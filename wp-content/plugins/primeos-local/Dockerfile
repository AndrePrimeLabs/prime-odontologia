FROM nginx:stable-alpine
LABEL maintainer="PrimeOS Team"
LABEL description="PrimeOS - Digital Operating System"
LABEL version="1.0.0"
RUN apk add --no-cache curl ca-certificates tini
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
ENTRYPOINT ["tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://localhost/health || exit 1
EXPOSE 80
