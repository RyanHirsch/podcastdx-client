### Build Stage
FROM node:12.18 AS build
ENV NODE_ENV=development
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install

COPY ["tsconfig.json", "./"]
COPY ["src/", "src/" ]
RUN yarn build


### Test Stage
FROM node:12.18 AS test
ENV NODE_ENV=test
WORKDIR /app
COPY [".", "./"]
RUN yarn install && yarn test
CMD ["yarn", "test"]


### Final
FROM node:12.18-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --production
COPY --from=build /app/dist /app/dist
CMD yarn start
