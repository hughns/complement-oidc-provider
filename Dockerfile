FROM node:18-alpine

# RUN apk add --no-cache git openssh
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY dist ./dist

EXPOSE 8080

CMD ["npm", "start"]
