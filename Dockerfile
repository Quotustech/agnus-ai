FROM node:18-alpine

WORKDIR /app

COPY package.json* ./

# Install dependencies
RUN npm install

# Copy local code to the container image
COPY . .

# Build the React application
RUN npm run build

# Expose port 3010
EXPOSE 3010

# Run the development server
CMD ["npm", "start"]
