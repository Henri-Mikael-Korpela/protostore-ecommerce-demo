FROM eclipse-temurin:17-jdk

RUN apt-get update && apt-get install -y --no-install-recommends entr \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle
RUN ./gradlew --version

COPY . .

EXPOSE 8080

# entr restarts `bootRun` whenever a source file changes; the outer loop
# lets it pick up newly added files too (entr -d exits when that happens).
CMD ["sh", "-c", "while true; do find src build.gradle settings.gradle -type f | entr -d -n -r ./gradlew bootRun; done"]
