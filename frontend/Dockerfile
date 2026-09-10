FROM node:20

ARG UID=1000
ARG GID=1000

# node:20 already ships a "node" user/group at 1000:1000; remap it to the
# host user's ids so files written into the bind mount aren't root-owned.
RUN groupmod -g "$GID" node && usermod -u "$UID" -g "$GID" node \
	&& find / -xdev -group 1000 -exec chgrp -h node {} + 2>/dev/null || true \
	&& find / -xdev -user 1000 -exec chown -h node {} + 2>/dev/null || true

WORKDIR /app
RUN chown node:node /app

USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm install

COPY --chown=node:node . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
