FROM node:16 as build

WORKDIR /build
COPY ./ /build

RUN yarn install
RUN yarn build

FROM nginx:alpine
COPY --from=build /build/public /usr/share/nginx/html
# RUN rm /etc/nginx/conf.d/default.conf
# COPY ./nginx.conf /etc/nginx/conf.d


EXPOSE 80