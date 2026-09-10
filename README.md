# Prostore - Demonstrating How To Build E-Commerce Platform With Event-Driven Architecture & Distributed Systems In The Age of AI

This software was built for personal learning experience, to combine experience with well established frameworks, languages and tools.
The development proces was aided by AI tools like Claude Code to speed up busy work with configurations and installations, to refactor and to enforce better testing with application security in mind.

## Prerequisites

- Docker (tested on version 29.7.2)

Before the first `docker compose up`, create a local `.env` file (gitignored,
one per machine) so containers write files as your own user instead of root:

```
echo "UID=$(id -u)" > .env
echo "GID=$(id -g)" >> .env
```

## Development Process

### Day 1: Basics

Chose IntelliJ IDEA as the main IDE for development because of Java. If I was developing for using JavaScript and TypeScript, I would have developed in VS Code.

Used Claude Code to set up backend with Java and Spring Boot with simple HTTP backend.

Used Claude Code to set up frontend with TypeScript, React and Vite.

Used Claude Code to set up Docker Compose file that has one service for backend, one service for the frontend. This way another developer can simply run backend and frontend without any project specific dependencies installed, besides Docker.