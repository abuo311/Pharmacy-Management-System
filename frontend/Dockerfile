# Step 1: Build the production dist folder using Node
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve the static files using Nginx
FROM nginx:alpine
# Copy custom build to Nginx public html directory
COPY --from=build /app/dist /usr/share/nginx/html
# Expose port 5173 to match your current Vite development mapping setup
EXPOSE 5173
# Override default Nginx config to expose port 5173 instead of 80
RUN sed -i 's/listen\(.*\)80;/listen 5173;/g' /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]