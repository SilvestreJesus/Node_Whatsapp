const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// 1. CONFIGURACIÓN DE CORS
app.use(cors({
    origin: ['https://factorfit.vercel.app', 'http://localhost:4200'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. CONFIGURACIÓN DE LÍMITE DE DATOS (Para fotos en Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. CONFIGURACIÓN DE GMAIL (Optimizada para Railway)
const transporter = nodemailer.createTransport({
    pool: true, // Mantiene la conexión abierta para mayor velocidad y evitar bloqueos
    host: "smtp.gmail.com",
    port: 465, // Puerto SSL seguro
    secure: true, 
    auth: {
        user: "22690406@tecvalles.mx",
        pass: "tkqx spuw rcsi qpcn" 
    },
    tls: {
        // Obliga a reconocer el servidor de Google aunque el contenedor no tenga certificados actualizados
        servername: 'smtp.gmail.com',
        rejectUnauthorized: false
    }
});

// --- RUTAS ---

// Ruta 1: Estado del servidor
app.get('/', (req, res) => {
    res.send("Servidor de Correos Factor Fit - Activo");
});

// Ruta 2: Test directo (Copia esta URL en tu navegador para probar sin Angular)
// URL: https://tu-app.up.railway.app/test-email
app.get('/test-email', async (req, res) => {
    try {
        await transporter.sendMail({
            from: '"Factor Fit Test" <22690406@tecvalles.mx>',
            to: "22690406@tecvalles.mx",
            subject: "Prueba Directa de Conexión",
            text: "El servidor de correos está configurado correctamente y funcionando en Railway."
        });
        res.send("<h1>¡Éxito!</h1><p>Correo de prueba enviado a 22690406@tecvalles.mx. Revisa tu bandeja.</p>");
    } catch (error) {
        console.error("Error en el test:", error);
        res.status(500).send("<h1>Error en el test</h1><p>" + error.message + "</p>");
    }
});

// Ruta 3: Envío de correos desde Angular
app.post('/enviar-correo', async (req, res) => {
    const { emails, asunto, mensaje, imagen } = req.body;

    if (!emails || emails.length === 0) {
        return res.status(400).json({ error: "No hay destinatarios" });
    }

    const mailOptions = {
        from: '"Factor Fit" <22690406@tecvalles.mx>',
        to: emails.join(', '), 
        subject: asunto,
        text: mensaje,
        html: `<div style="font-family: Arial, sans-serif;">
                <p>${mensaje.replace(/\n/g, '<br>')}</p>
               </div>`,
        attachments: []
    };

    // Si viene una imagen en base64, la adjuntamos
    if (imagen && imagen.includes('base64,')) {
        mailOptions.attachments.push({
            filename: 'promocion_factor_fit.png',
            content: imagen.split("base64,")[1],
            encoding: 'base64'
        });
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log("Correos enviados a:", emails);
        res.json({ success: true, message: "Correos enviados correctamente" });
    } catch (error) {
        console.error("Error al enviar correos:", error);
        res.status(500).json({ 
            error: "Fallo al enviar correo", 
            detalle: error.message 
        });
    }
});

// 4. INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`>>> Servidor Factor Fit corriendo en puerto ${PORT}`);
});