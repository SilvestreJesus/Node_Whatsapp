# Usamos una imagen de Node limpia y ligera
FROM node:18-slim

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos solo lo necesario
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto
EXPOSE 3000

CMD ["node", "index.js"]