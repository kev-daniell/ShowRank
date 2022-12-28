FROM node:16.15.0

WORKDIR /showapp 

ENV PORT 8080
ENV HOST 0.0.0.0


ADD . /showapp

RUN npm install 

CMD node app.js
