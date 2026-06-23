const nodemailer = require("nodemailer");
require("dotenv").config();

function mailConfigurado() {
    return Boolean(
        process.env.MAIL_HOST &&
        process.env.MAIL_USER &&
        process.env.MAIL_PASS
    );
}

async function enviarCorreo({ to, subject, html }) {
    if (!mailConfigurado()) {
        console.log("Correo no configurado. Simulación de envío:");
        console.log("Para:", to);
        console.log("Asunto:", subject);
        console.log("Contenido:", html);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject,
        html
    });
}

async function enviarBienvenida(usuario) {
    await enviarCorreo({
        to: usuario.correo,
        subject: "Bienvenido a Logisticat",
        html: `
            <h2>Bienvenido a Logisticat, ${usuario.nombre}</h2>
            <p>Tu cuenta fue creada correctamente.</p>
            <p>Rol asignado: <strong>${usuario.rol}</strong></p>
        `
    });
}

async function enviarRecuperacionPassword(usuario, token) {
    const resetUrl = `${process.env.APP_URL || "http://localhost" }?resetToken=${token}`;

    await enviarCorreo({
        to: usuario.correo,
        subject: "Recuperación de contraseña - Logisticat",
        html: `
            <h2>Recuperación de contraseña</h2>
            <p>Hola, ${usuario.nombre}.</p>
            <p>Usa el siguiente token para restablecer tu contraseña:</p>
            <h3>${token}</h3>
            <p>Este token expira en 15 minutos.</p>
            <p>Link de recuperación:</p>
            <a href="${resetUrl}">${resetUrl}</a>
        `
    });
}

module.exports = {
    enviarBienvenida,
    enviarRecuperacionPassword
};