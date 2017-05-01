FROM node:boron

# Create app directory
RUN mkdir -p /srv/ionize-slack
WORKDIR /srv/ionize-slack

# Install app dependencies
COPY package.json /srv/ionize-slack
RUN npm install

# Bundle app source
COPY . /srv/ionize-slack

EXPOSE 8080
CMD [ "npm", "start" ]
