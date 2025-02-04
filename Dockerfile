# Use Node.js as base image (you can change this based on your application)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if using Node.js)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]
