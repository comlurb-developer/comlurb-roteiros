FROM nginx:alpine
COPY ~/dist/roteiro /usr/share/nginx/html
EXPOSE 80