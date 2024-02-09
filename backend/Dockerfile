FROM node:latest
LABEL authors="khanhtranngoccva@gmail.com"

WORKDIR /var/application
COPY ./package.json /var/application
RUN npm install

COPY ./ /var/application

CMD ["npm", "run", "dev"]
