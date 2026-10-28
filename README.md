# Prostore - Demonstrating How To Build E-Commerce Platform With Event-Driven Architecture & Distributed Systems In The Age of AI

This software was built for personal learning experience, to combine experience with well established frameworks, languages and tools.
The development proces was aided by AI tools like Claude Code to speed up busy work with configurations and installations, to refactor and to enforce better testing with application security in mind.

## Prerequisites

- Docker (tested on version 29.7.2)

Everything runs through `docker compose up`, so Docker is the only hard
requirement. For running or debugging the backend outside of Docker (like
`./gradlew bootRun` from an IDE), you'll also need:

- JDK 17 (the backend's Docker image also uses `eclipse-temurin:17-jdk`).
- Gradle 8.14.3, which is not installed separately. The repo ships the Gradle wrapper (`./gradlew`).

## Setup

Every machine needs a local `.env` file in the repository root (gitignored).
It holds the database password, which is required, and the user and group ids
the containers run as. The steps differ per host OS.

### Linux host

The source code is bind-mounted into the containers, so files the containers
create (like `build/` and `.generated/`) get the container user's ids on the
host. Set the ids to your own user so those files aren't owned by root or some
other user:

```shell
echo "UID=$(id -u)" > .env
echo "GID=$(id -g)" >> .env
echo "DB_PASSWORD=change-me" >> .env
```

Then start everything:

```shell
docker compose up -d
```

### Windows host

Requires Docker Desktop with the WSL 2 backend.

Docker Desktop does not map container users to Windows users on bind mounts.
Files the containers write to a Windows path (like `D:\...`) are owned by your
Windows user whatever UID the container runs as. So the ids only need to exist
in the images, and the defaults work. Create `.env` in PowerShell:

```powershell
@"
UID=1000
GID=1000
DB_PASSWORD=change-me
"@ | Set-Content -Encoding ascii .env
```

Use `Set-Content -Encoding ascii` rather than `>`. Windows PowerShell 5.1's
`>` writes UTF-16, which Docker Compose can't read.

Scripts that run inside the Linux containers (`gradlew`, `*.sh`) must keep LF
line endings. `.gitattributes` enforces this even with `core.autocrlf=true`.
A clone made before `.gitattributes` existed may still have a CRLF `gradlew`,
which makes the backend fail with errors like `/bin/sh^M: bad interpreter`.
Check the file out again to fix it:

```powershell
Remove-Item backend/gradlew
git checkout -- backend/gradlew
```

Then start everything:

```powershell
docker compose up -d
```

Automatic reloading (the backend restarting via `entr` and Vite hot reload)
relies on file change notifications, which are less reliable for files on a
Windows drive. If changes aren't picked up, restart the service
(`docker compose restart backend`) or clone the repository inside a WSL 2
distribution instead (like `\\wsl$\Ubuntu\home\<you>\...`). Then run
`docker compose` from a WSL shell and follow the Linux host instructions. This
also makes file I/O much faster.

### Services

Once the containers are up:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080 (like http://localhost:8080/api/books)
- PostgreSQL: `localhost:5433` (`DB_PORT_TO_HOST` in `.env` changes the port)

Follow the logs with `docker compose logs -f` and stop everything with
`docker compose down`.

## Coding Style

- [TypeScript Programming Style Guide](./docs/typescript-programming-style-guide.md)

## Development Process

### Day 1: Basics

Chose IntelliJ IDEA as the main IDE for development because of Java. If I was developing for using JavaScript and TypeScript, I would have developed in VS Code.

Used Claude Code to set up backend with Java and Spring Boot with simple HTTP backend.

Used Claude Code to set up frontend with TypeScript, React and Vite.

Used Claude Code to set up Docker Compose file that has one service for backend, one service for the frontend. This way another developer can simply run backend and frontend without any project specific dependencies installed, besides Docker.

Had problems with file permissions and Gradle setup in order to show declarations in IDEA properly. Used Claude Code to resolve these issues.

Used Claude Code to create basic front page for the project's website that shows a banner with a featured book. Above the banner, there's a search bar for books. Didn't implement any functionality yet, just focused on simple layout and that it looks like a basis for an online store.

### Day 2: Database Integration

Went from "no database" to "Spring Boot talking to Postgres in Docker".

Set up JPA for Spring and installed Flyway dependency. Wrote down notes.

Created the first migration for initializing a book table. Created a book entity the match the creation query in the migration.

Fixed some incompatibilities between Gradle and Postgres versions.

Topics to learn more about later:

- UUID and its different versions (v7 seems to be a good modern version)
- PostgreSQL: Operator `~` with regex string
- Java: Constructor method reference

## Day 3: Adding unit tests

Added one unit test to test the GET /api/books endpoint.

Topics to learn more about later:

- Spring dependency injection and @Autowired
- ./gradlew test
- ./gradlew dependencies

## Day 4: Adding SQL testdata, Book Search Improvements

Added SQL testdata containing some test books. Used Claude Code to set up Testcontainers to utilize multiple test datum.

Configured test runner to use GRADLE insteaad of PLATFORM, which is IntelliJ's built-in JUnit runner.

Added query parameter `search` to the books endpoint to search for books containing the search value (case-insensitive).

Using Claude Code, implemented a basis for full-text search for books.

Topics to learn more about later:

- Information retrieval (IR), specifically a hybrid lexical + semantic search

## Day 5: Book Search Integration

Implemented books search in UI.

Used Claude Code to build a custom Vite plugin that can parse DTO files from Java code. This way there is no need for handwritten corresponding types in TypeScript. Added custom path @protostore so that it is possible to import DTOs like this:

```typescript
import { type BookDto } from "@protostore/dto/BookDto.java";
```

Improved frontend API typing so that endpoint response types are automatically inferred, with little duplication required.

## Day 6: Docker and Windows

I had to switch to Windows as my main operating system. Then I realized Docker didn't just work out of the box. I had to change some Docker settings and file structures to get things going. Thanks to Claude it was much faster but due to many complications on my own Windows operating system (like running out of disc space all of a sudden), I sank many into it.

## Day 7: Shopping Cart Functionality

Implemented shopping cart functionality. There's no login yet, only guest users.

A guest user is now able to add books to their shopping cart.

## Day 8: Shopping Cart in Local Storage, Some Refactoring, Ensuring Better Code Quality

Integrated local storage as part of the shopping cart. Added nice book animation whenever user adds an item to the shopping cart.

Added book cover preview in the search.

Improved TypeScript rules by adding ESLint, made rules more explicit and ensured better code quality especially when it comes to asynchronous programming and exception handling. Enforced a more strict explicit error handling instead of relying so much on exception handling.

Replaced mock book display on the front page with featured books. Added more books for testing. Added a featured field for determining whether a book is featured or not.

Divide CSS styles into CSS modules so that CSS can be worked on in a modular way.