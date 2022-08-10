FROM node:16.4-alpine

WORKDIR /app
COPY . .
RUN npm i --production

CMD [ "node", "index.js" ]

EXPOSE 8001