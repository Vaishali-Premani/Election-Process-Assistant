# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Use build-time argument for the API key
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Force create a .env file so Vite definitely sees it
RUN echo "VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}" > .env

# Build the Vite React app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 as required by Cloud Run
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
