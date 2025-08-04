FROM node:18-slim

WORKDIR /app

# Copy package files from backend
COPY campus-connect/backend/package*.json ./
COPY campus-connect/backend/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code from backend
COPY campus-connect/backend/src/ ./src/

# Create uploads directory
RUN mkdir -p uploads/images

# Build TypeScript code
RUN npm run build

# Expose the port the app runs on
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD ["npm", "start"]