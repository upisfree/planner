ARG UNIVERSAL_IMAGE
ARG UNIVERSAL_VER

FROM harbor.wildberries.ru/devops/ci/base-images/node:22.16 as build-stage

WORKDIR /app

# copy over package.json files
COPY package.json /app/
COPY package-lock.json /app/
COPY . /app

# install all depencies and build the project
RUN npm install && npm run build


FROM harbor.wildberries.ru/devops/nginx-brotli-wb:v1.19.8

WORKDIR /app

# nginx configs
RUN chmod g+rwx /var/cache/nginx /var/log/nginx \
	&& rm -rf /etc/nginx/conf.d/default.conf \
	&& rm -rf /etc/nginx/nginx.conf
COPY ./docker/config/nginx.conf /etc/nginx/nginx.conf

COPY --from=build-stage /app/dist /app/dist

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
