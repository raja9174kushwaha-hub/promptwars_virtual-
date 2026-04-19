# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Define build arguments
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

# Copy package dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Create .env file from build arguments
RUN echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" > .env && \
    echo "VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY" >> .env

# Copy application source code and build it
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the custom nginx config for React Router fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 (Cloud Run expected port)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
