FROM nginx:alpine
COPY src/dist/roteiro /usr/share/nginx/html
EXPOSE 80