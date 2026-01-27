# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy source files
COPY . .

# Build arguments for customization
ARG VITE_API_URL=http://localhost:8080

# Build the widget
RUN VITE_API_URL=${VITE_API_URL} npm run build

# Output stage - just the built files
FROM scratch AS output
COPY --from=builder /app/dist/chatbot-widget.js /chatbot-widget.js

# Serve stage (optional - for testing)
FROM nginx:alpine AS serve

COPY --from=builder /app/dist/chatbot-widget.js /usr/share/nginx/html/
COPY --from=builder /app/demo/index.html /usr/share/nginx/html/index.html
COPY --from=builder /app/demo/static/ /usr/share/nginx/html/static/

# Fix the script path in demo HTML
RUN sed -i 's|../dist/chatbot-widget.js|chatbot-widget.js|g' /usr/share/nginx/html/index.html

EXPOSE 80
