FROM node:18-alpine

WORKDIR /app

# Copia solo package.json e package-lock.json per sfruttare la cache Docker
COPY package*.json ./

# Installa le dipendenze (questa layer viene cachata se package.json non cambia)
RUN npm install

EXPOSE 3001

# Avvia nodemon in watch mode (i file sorgente sono montati come volume)
CMD ["npm", "run", "watch"]
