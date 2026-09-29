FROM eclipse-temurin:17-jdk

ARG UID=1001
ARG GID=1001

RUN    apt-get update \
    && apt-get install -y --no-install-recommends entr \
	&& rm -rf /var/lib/apt/lists/* \
    # The base image (Ubuntu 24.04+) already ships an "ubuntu" user/group at \
    # 1000:1000. If a group/user with the requested id exists, rename it to \
    # "app"; otherwise create it. \
    && if getent group "$GID" > /dev/null; then \
           groupmod -n app "$(getent group "$GID" | cut -d: -f1)"; \
       else \
           groupadd -g "$GID" app; \
       fi \
    && if getent passwd "$UID" > /dev/null; then \
           usermod -l app -d /home/app -m -g "$GID" "$(getent passwd "$UID" | cut -d: -f1)"; \
       else \
           useradd -m -u "$UID" -g "$GID" app; \
       fi

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
