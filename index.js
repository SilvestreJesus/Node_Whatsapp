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
        protocolTimeout: 0,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ] 
    }
});

// --- EVENTOS DE WHATSAPP ---
client.on('qr', (qr) => {
    ultimoQR = qr; 
    console.log('--- NUEVO QR GENERADO ---');
    qrcode.generate(qr, { small: true });
    console.log('También puedes verlo en: /ver-qr');
});

client.on('ready', () => {
    ultimoQR = ""; 
    isReady = true;
    console.log('--- ¡WHATSAPP CONECTADO Y LISTO! ---');
});

// --- RUTAS DEL SERVIDOR ---

// 1. Ruta de estado
app.get('/', (req, res) => {
    res.send("Servidor Activo. Estado: " + (isReady ? "Conectado" : "Esperando QR"));
});

// 2. Ruta para ver el QR como imagen
app.get('/ver-qr', (req, res) => {
    if (isReady) return res.send("WhatsApp ya está conectado.");
    if (!ultimoQR) return res.send("Generando QR... espera unos segundos y recarga.");
    
    const image = qrImage.image(ultimoQR, { type: 'png', margin: 4 });
    res.type('png');
    image.pipe(res);
});

// 3. RUTA PARA RECIBIR MENSAJES DESDE ANGULAR (IMPORTANTE: FUERA DEL LISTEN)
app.post('/enviar', async (req, res) => {
    const { numero, mensaje } = req.body;

    if (!isReady) {
        return res.status(500).json({ error: "WhatsApp no está conectado todavía" });
    }

    try {
        const chatId = numero.includes('@c.us') ? numero : `${numero}@c.us`;
        await client.sendMessage(chatId, mensaje);
        
        console.log(`Mensaje enviado a ${numero}`);
        res.json({ success: true, message: "Mensaje enviado correctamente" });
    } catch (error) {
        console.error("Error enviando mensaje:", error);
        res.status(500).json({ error: "Fallo al enviar mensaje" });
    }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
    client.initialize();
});