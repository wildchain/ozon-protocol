FROM node:20-alpine

WORKDIR /user/src/app

COPY package*.json ./

COPY . .

RUN npm install

RUN npm run build

RUN npm install -g cross-env

EXPOSE 8082




