FROM node:latest
LABEL authors="khanhtranngoccva@gmail.com"

WORKDIR /var/application
COPY ./package.json /var/application
RUN npm install

COPY .. /var/application
RUN prisma generate
RUN npm run build

CMD ["npm", "run", "start"]
