ARG UNIVERSAL_IMAGE
ARG UNIVERSAL_VER
ARG NODE_VERSION=22.16
ARG CI_JOB_TOKEN

FROM harbor.wildberries.ru/devops/ci/base-images/node:${NODE_VERSION} as build-stage

WORKDIR /app

# copy over package.json files
COPY package.json /app/
COPY package-lock.json /app/
COPY . /app

#RUN printf "@geoservice:registry=https://gitlab.wildberries.ru/api/v4/packages/npm/\n \
#    @pvz-checker:registry=https://gitlab.wildberries.ru/api/v4/packages/npm/\n\n \
#    //gitlab.wildberries.ru/api/v4/packages/npm/:_authToken=%s" "${CI_JOB_TOKEN}" > .npmrc && \
#    npm ci --include=dev && \
#    npm cache clean --force

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
