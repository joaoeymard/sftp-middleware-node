FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Ensure upload folder exists inside the image
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]
