# Build Stage
FROM node:22-alpine AS build

# Set the working directory strictly inside the container
WORKDIR /app

# Pass the API URL at build time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy isolated package bindings gracefully for layer caching
COPY package.json package-lock.json ./

# Install explicit production compilation dependencies
RUN npm ci

# Copy the entire client scope context
COPY . .

# Compile the final statically isolated Vite bundle
RUN npm run build

# Serve Stage
FROM nginx:alpine

# Create the missing directory
RUN mkdir -p /etc/nginx/templates

# Flush default Nginx configs dynamically
RUN rm -rf /etc/nginx/conf.d/*

# Inject the flawless Opus default mapping to permanently override Railway port mappings dynamically
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Native Linux injection to handle strictly parsed PORT variables natively
RUN apk add --no-cache gettext

# Retrieve the explicitly compiled dist file from the builder phase
COPY --from=build /app/dist /usr/share/nginx/html

# Expose native 80 dynamically
EXPOSE 80

# Spin up Nginx in the foreground reliably
CMD ["nginx", "-g", "daemon off;"]
