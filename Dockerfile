FROM node:14
WORKDIR /node-express-mongodb-master
COPY package.json .
RUN npm install
COPY . .
CMD npm start