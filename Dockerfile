# Stage 1: Build
FROM node:18 AS builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy project files
COPY . .

# Build the project for production
RUN npm run build

# Stage 2: Serve the built app
FROM node:18 AS runner

# Set the working directory
WORKDIR /app

# Install a simple static file server
RUN npm install -g serve

# Copy build output from builder stage
COPY --from=builder /app/dist /app/dist

# Expose port
EXPOSE 3000

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "3000"]
