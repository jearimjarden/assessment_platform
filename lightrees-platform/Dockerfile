FROM node:22-alpine

WORKDIR /app/lightrees-platform

COPY lightrees-platform/package*.json ./

RUN npm install

COPY lightrees-platform/ ./
COPY src/ /app/src/

RUN npm run build

EXPOSE 3000

CMD ["npm","start"]
