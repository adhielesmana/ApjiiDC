# Use the Node.js 20 image as the base
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application files into the container
COPY . .

# Expose the port your Express app listens on
EXPOSE 3071
EXPOSE 8088

# Set the default command to run your application
CMD ["npm", "start"]
