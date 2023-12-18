# Use an official Node 20.10 runtime as a parent image
FROM node:20

# Install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install only the production dependencies
RUN npm install --only=production

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable for Node (set NODE_ENV in your deployment settings)
ENV NODE_ENV=production

# Run the app when the container launches
CMD ["node", "server.js"]
