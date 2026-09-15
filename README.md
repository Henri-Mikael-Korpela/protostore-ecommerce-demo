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

Before the first `docker compose up`, create a local `.env` file (gitignored,
one per machine) so containers write files as your own user instead of root:

```shell
echo "UID=$(id -u)" > .env
echo "GID=$(id -g)" >> .env
```

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

### Day 3: Adding unit tests

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