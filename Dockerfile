FROM node:boron

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
# COPY package.json package-lock.json ./

RUN npm install

# Bundle app source
COPY . .

# map port
EXPOSE 8080

# set env
COPY .env.docker .
RUN .env.docker

# start command
CMD [ "npm", "start" ]
