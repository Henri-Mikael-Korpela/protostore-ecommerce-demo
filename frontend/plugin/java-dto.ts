import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/**
 * Vite plugin that exposes Java DTO sources as TypeScript types.
 *
 * `import { type BookDto } from "@protostore/dto/BookDto.java"` resolves to the Java
 * source file under `javaRoot`. At runtime the module is empty (DTOs are types only).
 * For type checking, a `.d.java.ts` declaration is generated for each Java file into
 * `outDir`, which tsconfig maps `@protostore/*` to.
 */
export type JavaDtoPluginOptions = {
    /** Import prefix, e.g. `@protostore`. */
    prefix: string;
    /** Directory of the Java sources the prefix maps to. */
    javaRoot: string;
    /** Directory the generated `.d.java.ts` declarations are written to. */
    outDir: string;
};

export function javaDto(options: JavaDtoPluginOptions): Plugin {
    const prefix = options.prefix.endsWith("/") ? options.prefix : `${options.prefix}/`;
    const javaRoot = path.resolve(options.javaRoot);
    const outDir = path.resolve(options.outDir);

    function isJavaSource(file: string): boolean {
        return file.endsWith(".java") && isInside(javaRoot, file);
    }

    function generate(javaFile: string): void {
        const relative = path.relative(javaRoot, javaFile);
        const target = path.join(outDir, relative.replace(/\.java$/, ".d.java.ts"));
        const source = fs.readFileSync(javaFile, "utf8");
        let declaration: string;
        try {
            declaration = javaToDeclaration(source, {
                javaRoot,
                javaFile,
                displayPath: path.relative(process.cwd(), javaFile),
            });
        } catch (error) {
            throw new Error(`Failed to parse ${javaFile}: ${(error as Error).message}`);
        }
        fs.mkdirSync(path.dirname(target), { recursive: true });
        // Avoid touching unchanged files so tsc/editors don't needlessly re-check
        if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== declaration) {
            fs.writeFileSync(target, declaration);
        }
    }

    function remove(javaFile: string): void {
        const relative = path.relative(javaRoot, javaFile);
        fs.rmSync(path.join(outDir, relative.replace(/\.java$/, ".d.java.ts")), { force: true });
    }

    function generateAll(): void {
        fs.rmSync(outDir, { recursive: true, force: true });
        for (const file of walk(javaRoot)) {
            if (isJavaSource(file)) {
                generate(file);
            }
        }
    }

    return {
        name: "java-dto",
        enforce: "pre",

        buildStart() {
            generateAll();
        },

        resolveId(id) {
            if (!id.startsWith(prefix)) {
                return null;
            }
            const file = path.resolve(javaRoot, id.slice(prefix.length));
            if (!isJavaSource(file)) {
                this.error(`${id} must refer to a .java file inside ${javaRoot}`);
            }
            return file;
        },

        load(id) {
            if (!isJavaSource(id)) {
                return null;
            }
            this.addWatchFile(id);
            // DTOs only contribute types, so there is nothing to export at runtime
            return "export {};";
        },

        configureServer(server) {
            server.watcher.add(javaRoot);
            const onChange = (file: string) => {
                if (!isJavaSource(file)) {
                    return;
                }
                try {
                    generate(file);
                } catch (error) {
                    server.config.logger.error((error as Error).message);
                }
            };
            server.watcher.on("add", onChange);
            server.watcher.on("change", onChange);
            server.watcher.on("unlink", file => {
                if (isJavaSource(file)) {
                    remove(file);
                }
            });
        },
    };
}

function isInside(directory: string, file: string): boolean {
    const relative = path.relative(directory, file);
    return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function* walk(directory: string): Generator<string> {
    if (!fs.existsSync(directory)) {
        return;
    }
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            yield* walk(file);
        } else {
            yield file;
        }
    }
}

// ---------------------------------------------------------------------------
// Java parsing
// ---------------------------------------------------------------------------

type Token = { kind: "ident" | "symbol" | "literal"; value: string };

function tokenize(source: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < source.length) {
        const char = source[i];
        if (/\s/.test(char)) {
            i++;
        } else if (source.startsWith("//", i)) {
            const end = source.indexOf("\n", i);
            i = end === -1 ? source.length : end;
        } else if (source.startsWith("/*", i)) {
            const end = source.indexOf("*/", i + 2);
            i = end === -1 ? source.length : end + 2;
        } else if (source.startsWith('"""', i)) {
            const end = source.indexOf('"""', i + 3);
            i = end === -1 ? source.length : end + 3;
            tokens.push({ kind: "literal", value: "" });
        } else if (char === '"' || char === "'") {
            let j = i + 1;
            while (j < source.length && source[j] !== char) {
                j += source[j] === "\\" ? 2 : 1;
            }
            i = j + 1;
            tokens.push({ kind: "literal", value: "" });
        } else if (/[A-Za-z_$]/.test(char)) {
            const match = /^[A-Za-z0-9_$]+/.exec(source.slice(i))!;
            tokens.push({ kind: "ident", value: match[0] });
            i += match[0].length;
        } else if (/[0-9]/.test(char)) {
            const match = /^[0-9A-Za-z_.]+/.exec(source.slice(i))!;
            tokens.push({ kind: "literal", value: match[0] });
            i += match[0].length;
        } else if (source.startsWith("...", i)) {
            tokens.push({ kind: "symbol", value: "..." });
            i += 3;
        } else {
            tokens.push({ kind: "symbol", value: char });
            i++;
        }
    }
    return tokens;
}

type JavaType =
    | { kind: "named"; name: string; args: JavaType[] }
    | { kind: "array"; element: JavaType }
    | { kind: "wildcard" };

type Field = { name: string; type: JavaType; nullable: boolean };

type Declaration =
    | { kind: "record" | "class"; name: string; typeParams: string[]; fields: Field[] }
    | { kind: "enum"; name: string; constants: string[] };

type ParseResult = {
    packageName: string;
    imports: string[];
    declarations: Declaration[];
};

const MODIFIERS = new Set([
    "public", "protected", "private", "static", "final", "abstract", "sealed",
    "strictfp", "transient", "volatile", "default", "synchronized", "native",
]);

class Parser {
    private position = 0;
    private readonly tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    parseFile(): ParseResult {
        let packageName = "";
        const imports: string[] = [];
        const declarations: Declaration[] = [];

        while (!this.atEnd()) {
            if (this.acceptIdent("package")) {
                packageName = this.qualifiedName();
                this.expect(";");
            } else if (this.acceptIdent("import")) {
                const isStatic = this.acceptIdent("static");
                const name = this.qualifiedName(true);
                this.expect(";");
                if (!isStatic) {
                    imports.push(name);
                }
            } else if (this.accept(";")) {
                // Stray semicolon
            } else {
                const declaration = this.typeDeclaration();
                if (declaration) {
                    declarations.push(declaration);
                }
            }
        }
        return { packageName, imports, declarations };
    }

    /** Parses a top-level type declaration. Interfaces and annotations are skipped. */
    private typeDeclaration(): Declaration | null {
        this.modifiersAndAnnotations();
        if (this.accept("@") || this.peekIdent("interface")) {
            this.skipUntilBlock();
            this.skipBalanced("{", "}");
            return null;
        }
        const keyword = this.ident();
        if (keyword !== "record" && keyword !== "class" && keyword !== "enum") {
            throw new Error(`Unexpected token "${keyword}"`);
        }
        const name = this.ident();
        const typeParams = this.peek("<") ? this.typeParameters() : [];

        if (keyword === "record") {
            const fields = this.recordComponents();
            this.skipUntilBlock();
            this.skipBalanced("{", "}");
            return { kind: "record", name, typeParams, fields };
        }
        this.skipUntilBlock();
        if (keyword === "enum") {
            return { kind: "enum", name, constants: this.enumBody() };
        }
        return { kind: "class", name, typeParams, fields: this.classBody() };
    }

    private recordComponents(): Field[] {
        const fields: Field[] = [];
        this.expect("(");
        while (!this.accept(")")) {
            const { nullable } = this.modifiersAndAnnotations();
            const type = this.type();
            this.accept("...");
            const name = this.ident();
            fields.push({ name, type: this.arraySuffix(type), nullable });
            this.accept(",");
        }
        return fields;
    }

    private enumBody(): string[] {
        const constants: string[] = [];
        this.expect("{");
        while (!this.peek(";") && !this.peek("}")) {
            this.modifiersAndAnnotations();
            constants.push(this.ident());
            if (this.peek("(")) {
                this.skipBalanced("(", ")");
            }
            if (this.peek("{")) {
                this.skipBalanced("{", "}");
            }
            this.accept(",");
        }
        // Skip the rest of the body (fields, constructors, methods)
        this.accept(";");
        this.skipRestOfBlock();
        return constants;
    }

    /** Collects non-static fields of a class body, skipping methods and nested types. */
    private classBody(): Field[] {
        const fields: Field[] = [];
        this.expect("{");
        while (!this.accept("}")) {
            if (this.accept(";")) {
                continue;
            }
            if (this.peek("{")) {
                // Initializer block
                this.skipBalanced("{", "}");
                continue;
            }
            const { nullable, isStatic } = this.modifiersAndAnnotations();
            if (this.peek("@") || this.peekIdent("class") || this.peekIdent("record")
                || this.peekIdent("enum") || this.peekIdent("interface")) {
                this.skipUntilBlock();
                this.skipBalanced("{", "}");
                continue;
            }
            if (this.peek("<")) {
                // Generic method
                this.skipBalanced("<", ">");
            }
            if (this.peek("{")) {
                // Static initializer block
                this.skipBalanced("{", "}");
                continue;
            }
            const type = this.type();
            if (this.peek("(")) {
                // Constructor
                this.skipMember();
                continue;
            }
            const name = this.ident();
            if (this.peek("(")) {
                // Method
                this.skipMember();
                continue;
            }
            // Field declaration, possibly with multiple declarators: `int a, b = 1;`
            let current = { name, type: this.arraySuffix(type) };
            for (;;) {
                if (!isStatic) {
                    fields.push({ ...current, nullable });
                }
                if (this.accept("=")) {
                    this.skipInitializer();
                }
                if (this.accept(";")) {
                    break;
                }
                this.expect(",");
                const nextName = this.ident();
                current = { name: nextName, type: this.arraySuffix(type) };
            }
        }
        return fields;
    }

    private modifiersAndAnnotations(): { nullable: boolean; isStatic: boolean } {
        let nullable = false;
        let isStatic = false;
        for (;;) {
            if (this.peek("@") && !this.peekIdent("interface", 1)) {
                this.position++;
                const name = this.qualifiedName();
                if (name.split(".").pop() === "Nullable") {
                    nullable = true;
                }
                if (this.peek("(")) {
                    this.skipBalanced("(", ")");
                }
            } else if (this.current()?.kind === "ident" && MODIFIERS.has(this.current()!.value)) {
                isStatic ||= this.current()!.value === "static";
                this.position++;
            } else if (this.peekIdent("non") && this.peek("-", 1)) {
                this.position += 3;
            } else {
                return { nullable, isStatic };
            }
        }
    }

    private typeParameters(): string[] {
        const params: string[] = [];
        this.expect("<");
        let depth = 1;
        let expectName = true;
        while (depth > 0) {
            const token = this.next();
            if (token.value === "<") {
                depth++;
            } else if (token.value === ">") {
                depth--;
            } else if (depth === 1 && token.value === ",") {
                expectName = true;
            } else if (depth === 1 && expectName && token.kind === "ident") {
                params.push(token.value);
                expectName = false;
            }
        }
        return params;
    }

    private type(): JavaType {
        // Type annotations, e.g. `List<@Valid Item>`
        while (this.peek("@")) {
            this.position++;
            this.qualifiedName();
            if (this.peek("(")) {
                this.skipBalanced("(", ")");
            }
        }
        if (this.accept("?")) {
            if (this.acceptIdent("extends")) {
                return this.type();
            }
            if (this.acceptIdent("super")) {
                this.type();
            }
            return { kind: "wildcard" };
        }
        const name = this.qualifiedName();
        const args: JavaType[] = [];
        if (this.accept("<")) {
            while (!this.accept(">")) {
                args.push(this.type());
                this.accept(",");
            }
        }
        return this.arraySuffix({ kind: "named", name, args });
    }

    private arraySuffix(type: JavaType): JavaType {
        while (this.peek("[") && this.peek("]", 1)) {
            this.position += 2;
            type = { kind: "array", element: type };
        }
        return type;
    }

    private qualifiedName(allowWildcard = false): string {
        let name = this.ident();
        while (this.peek(".") && (this.current(1)?.kind === "ident" || (allowWildcard && this.peek("*", 1)))) {
            this.position++;
            name += "." + this.next().value;
        }
        return name;
    }

    private skipMember(): void {
        this.skipBalanced("(", ")");
        while (!this.peek("{") && !this.peek(";")) {
            this.position++;
        }
        if (!this.accept(";")) {
            this.skipBalanced("{", "}");
        }
    }

    private skipInitializer(): void {
        let depth = 0;
        while (depth > 0 || (!this.peek(",") && !this.peek(";"))) {
            const token = this.next();
            if ("({[".includes(token.value) && token.kind === "symbol") {
                depth++;
            } else if (")}]".includes(token.value) && token.kind === "symbol") {
                depth--;
            }
        }
    }

    private skipUntilBlock(): void {
        while (!this.peek("{")) {
            this.next();
        }
    }

    private skipRestOfBlock(): void {
        let depth = 1;
        while (depth > 0) {
            const token = this.next();
            if (token.kind === "symbol" && token.value === "{") {
                depth++;
            } else if (token.kind === "symbol" && token.value === "}") {
                depth--;
            }
        }
    }

    private skipBalanced(open: string, close: string): void {
        this.expect(open);
        let depth = 1;
        while (depth > 0) {
            const token = this.next();
            if (token.kind !== "symbol") {
                continue;
            }
            if (token.value === open) {
                depth++;
            } else if (token.value === close) {
                depth--;
            }
        }
    }

    private atEnd(): boolean {
        return this.position >= this.tokens.length;
    }

    private current(offset = 0): Token | undefined {
        return this.tokens[this.position + offset];
    }

    private next(): Token {
        const token = this.current();
        if (!token) {
            throw new Error("Unexpected end of file");
        }
        this.position++;
        return token;
    }

    private peek(symbol: string, offset = 0): boolean {
        const token = this.current(offset);
        return token?.kind === "symbol" && token.value === symbol;
    }

    private peekIdent(value: string, offset = 0): boolean {
        const token = this.current(offset);
        return token?.kind === "ident" && token.value === value;
    }

    private accept(symbol: string): boolean {
        if (this.peek(symbol)) {
            this.position++;
            return true;
        }
        return false;
    }

    private acceptIdent(value: string): boolean {
        if (this.peekIdent(value)) {
            this.position++;
            return true;
        }
        return false;
    }

    private expect(symbol: string): void {
        const token = this.next();
        if (token.kind !== "symbol" || token.value !== symbol) {
            throw new Error(`Expected "${symbol}" but got "${token.value}"`);
        }
    }

    private ident(): string {
        const token = this.next();
        if (token.kind !== "ident") {
            throw new Error(`Expected identifier but got "${token.value}"`);
        }
        return token.value;
    }
}

// ---------------------------------------------------------------------------
// TypeScript generation
// ---------------------------------------------------------------------------

const STRING_TYPES = new Set([
    "String", "char", "Character", "CharSequence", "UUID", "URI", "URL",
    "LocalDate", "LocalDateTime", "LocalTime", "OffsetDateTime", "OffsetTime", "ZonedDateTime",
    "Instant", "Duration", "Period", "Year", "YearMonth", "Date", "ZoneId", "Locale", "Currency",
]);

const NUMBER_TYPES = new Set([
    "byte", "short", "int", "long", "float", "double",
    "Byte", "Short", "Integer", "Long", "Float", "Double", "Number", "BigDecimal", "BigInteger",
]);

const BOOLEAN_TYPES = new Set(["boolean", "Boolean"]);

const ARRAY_TYPES = new Set([
    "List", "ArrayList", "LinkedList", "Set", "HashSet", "LinkedHashSet", "TreeSet", "SortedSet",
    "Collection", "Iterable", "Stream",
]);

const MAP_TYPES = new Set(["Map", "HashMap", "LinkedHashMap", "TreeMap", "SortedMap"]);

const UNKNOWN_TYPES = new Set(["Object", "JsonNode"]);

type GenerationContext = {
    javaRoot: string;
    javaFile: string;
    displayPath: string;
};

type TypeScope = {
    typeParams: Set<string>;
    /** Referenced DTOs from other files: type name -> relative import path. */
    references: Map<string, string>;
    localTypes: Set<string>;
    imports: string[];
    packageName: string;
    context: GenerationContext;
};

export function javaToDeclaration(source: string, context: GenerationContext): string {
    const { packageName, imports, declarations } = new Parser(tokenize(source)).parseFile();
    const references = new Map<string, string>();
    const localTypes = new Set(declarations.map(declaration => declaration.name));

    const bodies = declarations.map(declaration => {
        if (declaration.kind === "enum") {
            const union = declaration.constants.map(constant => JSON.stringify(constant)).join(" | ");
            return `export type ${declaration.name} = ${union || "never"};\n`;
        }
        const scope: TypeScope = {
            typeParams: new Set(declaration.typeParams),
            references,
            localTypes,
            imports,
            packageName,
            context,
        };
        const params = declaration.typeParams.length > 0 ? `<${declaration.typeParams.join(", ")}>` : "";
        const members = declaration.fields.map(field => {
            const type = toTypeScript(field.type, scope);
            return `    ${field.name}: ${type}${field.nullable ? " | null" : ""};\n`;
        });
        return `export type ${declaration.name}${params} = {\n${members.join("")}};\n`;
    });

    const header = `// Generated from ${context.displayPath}. Do not edit.\n`;
    const importLines = [...references]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, from]) => `import type { ${name} } from ${JSON.stringify(from)};\n`)
        .join("");
    return [header, importLines, bodies.join("\n")].filter(Boolean).join("\n");
}

function toTypeScript(type: JavaType, scope: TypeScope): string {
    if (type.kind === "wildcard") {
        return "unknown";
    }
    if (type.kind === "array") {
        const element = toTypeScript(type.element, scope);
        return /^[\w.]+$/.test(element) ? `${element}[]` : `(${element})[]`;
    }

    const simpleName = type.name.split(".").pop()!;
    const args = type.args.map(arg => toTypeScript(arg, scope));

    if (scope.typeParams.has(type.name)) {
        return type.name;
    }
    if (STRING_TYPES.has(simpleName)) {
        return "string";
    }
    if (NUMBER_TYPES.has(simpleName)) {
        return "number";
    }
    if (BOOLEAN_TYPES.has(simpleName)) {
        return "boolean";
    }
    if (UNKNOWN_TYPES.has(simpleName)) {
        return "unknown";
    }
    if (ARRAY_TYPES.has(simpleName)) {
        return toTypeScript({ kind: "array", element: type.args[0] ?? { kind: "wildcard" } }, scope);
    }
    if (MAP_TYPES.has(simpleName)) {
        const key = args[0] === "number" ? "number" : "string";
        return `Record<${key}, ${args[1] ?? "unknown"}>`;
    }
    if (simpleName === "Optional") {
        return `${args[0] ?? "unknown"} | null`;
    }
    if (simpleName === "OptionalInt" || simpleName === "OptionalLong" || simpleName === "OptionalDouble") {
        return "number | null";
    }

    const reference = resolveReference(type.name, scope);
    if (reference === null) {
        return "unknown";
    }
    return args.length > 0 ? `${reference}<${args.join(", ")}>` : reference;
}

/**
 * Resolves a referenced Java type to another generated declaration, registering an import
 * for it. Returns null when the type cannot be found under the Java root.
 */
function resolveReference(name: string, scope: TypeScope): string | null {
    const simpleName = name.split(".").pop()!;
    if (scope.localTypes.has(simpleName) && !name.includes(".")) {
        return simpleName;
    }

    const candidates: string[] = [];
    if (name.includes(".")) {
        candidates.push(name);
    } else {
        candidates.push(...scope.imports.filter(i => i.endsWith(`.${name}`)));
        candidates.push(scope.packageName ? `${scope.packageName}.${name}` : name);
        candidates.push(...scope.imports.filter(i => i.endsWith(".*")).map(i => `${i.slice(0, -1)}${name}`));
    }

    const { javaRoot, javaFile } = scope.context;
    const rootPackage = packageOfRoot(javaFile, scope.packageName, javaRoot);
    for (const candidate of candidates) {
        if (rootPackage && !candidate.startsWith(`${rootPackage}.`)) {
            continue;
        }
        const relativeToRoot = (rootPackage ? candidate.slice(rootPackage.length + 1) : candidate)
            .split(".")
            .join(path.sep);
        const file = path.join(javaRoot, `${relativeToRoot}.java`);
        if (file !== javaFile && fs.existsSync(file) && declaresType(file, simpleName)) {
            let from = path.relative(path.dirname(javaFile), file).split(path.sep).join("/");
            if (!from.startsWith(".")) {
                from = `./${from}`;
            }
            scope.references.set(simpleName, from);
            return simpleName;
        }
    }
    return null;
}

/** Whether the Java file produces a declaration for the type (interfaces, for example, do not). */
function declaresType(javaFile: string, name: string): boolean {
    try {
        const { declarations } = new Parser(tokenize(fs.readFileSync(javaFile, "utf8"))).parseFile();
        return declarations.some(declaration => declaration.name === name);
    } catch {
        return false;
    }
}

/** Derives the Java package that corresponds to `javaRoot`, e.g. `com.prostore`. */
function packageOfRoot(javaFile: string, packageName: string, javaRoot: string): string {
    const depth = path.relative(javaRoot, path.dirname(javaFile)).split(path.sep).filter(Boolean).length;
    const parts = packageName.split(".").filter(Boolean);
    return parts.slice(0, parts.length - depth).join(".");
}
