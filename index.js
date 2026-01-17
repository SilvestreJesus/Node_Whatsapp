const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const qrImage = require('qr-image');

const app = express();
app.use(express.json());
app.use(cors());

let ultimoQR = "";
let isReady = false;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ] 
    }
});

// EVENTO QR: Consola pequeña e imagen web
client.on('qr', (qr) => {
    ultimoQR = qr; 
    console.log('--- NUEVO QR GENERADO ---');
    // Genera el QR pequeño en la consola de Railway
    qrcode.generate(qr, { small: true });
    console.log('También puedes verlo en: /ver-qr');
});

client.on('ready', () => {
    ultimoQR = ""; 
    isReady = true;
    console.log('--- ¡WHATSAPP CONECTADO Y LISTO! ---');
});

// RUTA PARA VER EL QR COMO IMAGEN (Para escanear desde el celular)
app.get('/ver-qr', (req, res) => {
    if (isReady) return res.send("WhatsApp ya está conectado.");
    if (!ultimoQR) return res.send("Generando QR... espera unos segundos y recarga.");
    
    const image = qrImage.image(ultimoQR, { type: 'png', margin: 4 });
    res.type('png');
    image.pipe(res);
});

app.get('/', (req, res) => {
    res.send("Servidor Activo. Estado: " + (isReady ? "Conectado" : "Esperando QR"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
    client.initialize();
});