# Build Stage
FROM node:20 AS build
WORKDIR /app

# Ensure build-time variables are passed in
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:alpine
# Copy the hardcoded nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Retrieve the explicitly compiled dist file
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
