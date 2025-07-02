# Use official Nginx image
FROM nginx:alpine

# Remove the default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy static files to nginx public directory
COPY .. /usr/share/nginx/html

# Expose port 80
EXPOSE 80