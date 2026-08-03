# Use official Node.js runtime as parent image
FROM node:18-slim

# Install FFmpeg and FFprobe system packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Set working directory inside container
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose port (if applicable) and define default command
CMD ["npm", "start"]
