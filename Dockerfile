# Base Stage
FROM node:22-alpine3.20 AS base

ENV DIR /app
WORKDIR $DIR
ARG NPM_TOKEN

# Development Stage
FROM base AS dev

ENV NODE_ENV=dev
ENV CI=true

COPY package.json yarn.lock ./

# Instalar dependencias de desarrollo
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ".npmrc" && \
    yarn install --frozen-lockfile && \
    rm -f .npmrc

COPY tsconfig*.json .
COPY nest-cli.json .
COPY src src

EXPOSE $PORT
CMD ["yarn", "start:dev"]

# Build Stage
FROM base AS build

ENV CI=true

COPY package.json yarn.lock ./

# Instalar dependencias para producción
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ".npmrc" && \
    yarn install --frozen-lockfile && \
    rm -f .npmrc

COPY tsconfig*.json .
COPY nest-cli.json .
COPY src src

# Construir la aplicación
RUN yarn build

# Producción Stage
FROM base AS production

ENV NODE_ENV=prod  
ENV USER=node

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build $DIR/package.json .
COPY --from=build $DIR/yarn.lock .
COPY --from=build $DIR/node_modules node_modules
COPY --from=build $DIR/dist dist

USER $USER
EXPOSE $PORT
CMD ["dumb-init", "node", "dist/main.js"]
