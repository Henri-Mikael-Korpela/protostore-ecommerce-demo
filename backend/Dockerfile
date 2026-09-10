FROM eclipse-temurin:17-jdk

ARG UID=1000
ARG GID=1000

RUN apt-get update && apt-get install -y --no-install-recommends entr \
	&& rm -rf /var/lib/apt/lists/* \
	&& groupadd -g "$GID" app \
	&& useradd -m -u "$UID" -g "$GID" app

WORKDIR /app
RUN chown app:app /app

USER app

COPY --chown=app:app gradlew settings.gradle build.gradle ./
COPY --chown=app:app gradle gradle
RUN ./gradlew --version

COPY --chown=app:app . .

EXPOSE 8080

# entr restarts `bootRun` whenever a source file changes; the outer loop
# lets it pick up newly added files too (entr -d exits when that happens).
CMD ["sh", "-c", "while true; do find src build.gradle settings.gradle -type f | entr -d -n -r ./gradlew bootRun; done"]
