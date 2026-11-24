FROM node:22.23.5-bookworm-slim@sha256:e9f565d32859f0cbfb52125eafe8be39390f24dac302dc3cdf566e8ba3ab21ee AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 GLOBOWS_STANDALONE=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY next.config.ts tsconfig.json ./
COPY src ./src
COPY public ./public
COPY docker/web-env.sh ./docker/web-env.sh
ARG STACK_QA_PROJECT
RUN sed -i 's/\r$//' ./docker/web-env.sh \
    && . ./docker/web-env.sh \
    && npm run build

FROM node:22.23.5-bookworm-slim@sha256:e9f565d32859f0cbfb52125eafe8be39390f24dac302dc3cdf566e8ba3ab21ee AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3100 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/docker/web-env.sh ./docker/web-env.sh
USER node
EXPOSE 3100
CMD ["sh", "-ec", ". ./docker/web-env.sh && exec node server.js"]
