FROM node:10

# install netcat for polling purposes
RUN apt-get update && \
  apt-get -y install netcat && \
  apt-get clean

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY app app
COPY openapi.json server.js entrypoint.sh ./

# add execution access to entrypoint.sh
RUN chmod +x entrypoint.sh

# give your user the ownership of the current directory
RUN chown -R node:node ./

# activate user
USER node

EXPOSE 8000
ENTRYPOINT [ "sh", "./entrypoint.sh" ]