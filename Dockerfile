# First we specify the base image that we need, in this case we go with minimal node alpine image 
FROM node:22-alpine

#We then specifiy the working directory within the image. If "app" doesnt exist it will be created and navigated into
WORKDIR /app

#We copy all the package.json files from the files in the current project folder to the ./ location will be the /app where our pwd is at
COPY package*.json ./

#After copying the package.json files we run npm install to install all the necesarry dependancies that are needed
RUN npm install

#We then copy all the project files from our current pwd on the host machine to the pwd on the docker image filesys
COPY . .

#we document the container port
EXPOSE 5000

#To start the server , we use the command "node", "server.js"
CMD ["node", "server.js"]