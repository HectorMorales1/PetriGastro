FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm ci --prefix server && npm ci --prefix client
COPY . .
RUN npm run build --prefix client
RUN npm run build --prefix server

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/server/dist ./server
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server/package.json ./server/
COPY --from=build /app/package.json ./
COPY --from=build /app/server/node_modules ./server/node_modules
EXPOSE 3000
CMD ["node", "server/server.js"]
