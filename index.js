const nodemailer = require('nodemailer');

// Configuración del transporte de correo (SMTP)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true para puerto 465
    auth: {
        user: "22690406@tecvalles.mx",
        pass: "tkqx spuw rcsi qpcn" // Tu contraseña de aplicación
    }
});

// RUTA PARA ENVIAR CORREOS
app.post('/enviar-correo', async (req, res) => {
    const { emails, asunto, mensaje, imagen } = req.body;

    const mailOptions = {
        from: '"Factor Fit" <22690406@tecvalles.mx>',
        to: emails.join(', '), // Lista de correos
        subject: asunto,
        text: mensaje,
        html: `<p>${mensaje.replace(/\n/g, '<br>')}</p>`,
        attachments: []
    };

    // Si hay una imagen en Base64, la adjuntamos
    if (imagen) {
        mailOptions.attachments.push({
            filename: 'adjunto.png',
            content: imagen.split("base64,")[1],
            encoding: 'base64'
        });
    }

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Correo enviado" });
    } catch (error) {
        console.error("Error enviando mail:", error);
        res.status(500).json({ error: "Error al enviar correo" });
    }
});