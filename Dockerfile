FROM node:9

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm -g install yarn

COPY . /usr/src/app
RUN yarn install

EXPOSE 4242

CMD ["node", "src/index"]
