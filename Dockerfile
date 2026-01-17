# Usamos una imagen que ya tiene Chrome instalado para Puppeteer
FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto que usa tu Express
EXPOSE 3000

CMD ["node", "index.js"]