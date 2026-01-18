const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Configuración de CORS para que Angular (Vercel) pueda conectarse
app.use(cors({
    origin: ['https://factorfit.vercel.app', 'http://localhost:4200'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Aumentar el límite para recibir imágenes en Base64
app.use(express.json({ limit: '50mb' }));

// Configuración de Gmail con tus credenciales
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // false para puerto 587 (usa STARTTLS)
    auth: {
        user: "22690406@tecvalles.mx",
        pass: "tkqx spuw rcsi qpcn" 
    },
    tls: {
        rejectUnauthorized: false // Evita errores de certificados en contenedores Docker
    },
    connectionTimeout: 20000, // 20 segundos de espera para conectar
    greetingTimeout: 20000,   // 20 segundos de espera para el saludo SMTP
    socketTimeout: 30000      // 30 segundos de inactividad
});

// Ruta principal para probar si el servidor vive
app.get('/', (req, res) => {
    res.send("Servidor de Correos Factor Fit - Activo");
});

// RUTA PARA ENVIAR CORREO
app.post('/enviar-correo', async (req, res) => {
    const { emails, asunto, mensaje, imagen } = req.body;

    const mailOptions = {
        from: '"Factor Fit" <22690406@tecvalles.mx>',
        to: emails.join(', '), 
        subject: asunto,
        text: mensaje,
        html: `<p>${mensaje.replace(/\n/g, '<br>')}</p>`,
        attachments: []
    };

    if (imagen) {
        mailOptions.attachments.push({
            filename: 'adjunto.png',
            content: imagen.split("base64,")[1],
            encoding: 'base64'
        });
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente a:", emails);
        res.json({ success: true, message: "Correo enviado" });
    } catch (error) {
        console.error("Error en Nodemailer:", error);
        res.status(500).json({ error: "No se pudo enviar el correo" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de correos corriendo en puerto ${PORT}`);
});