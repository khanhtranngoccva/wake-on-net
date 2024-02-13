FROM node:lts
LABEL authors="khanhtranngoccva@gmail.com"

RUN apt-get update -y
RUN apt-get install -y iputils-ping

WORKDIR /var/application
COPY ./package.json /var/application
RUN npm install

COPY ./ /var/application

CMD ["npm", "run", "dev"]
