const bcrypt = require("bcryptjs");
const pool = require("../database/connection");
const crypto = require("crypto");
const { enviarBienvenida, enviarRecuperacionPassword } = require("../services/email.service");

async function registrarUsuario(req, res) {
    try {
        const { nombre, correo, password, rol } = req.body;

        if (!nombre || !correo || !password) {
            return res.status(400).json({
                ok: false,
                message: "Nombre, correo y contraseña son obligatorios"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                ok: false,
                message: "La contraseña debe tener al menos 6 caracteres"
            });
        }

        const [usuariosExistentes] = await pool.query(
            `
            SELECT id_usuario
            FROM usuarios
            WHERE correo = ?
            LIMIT 1
            `,
            [correo]
        );

        if (usuariosExistentes.length > 0) {
            return res.status(409).json({
                ok: false,
                message: "Ya existe un usuario con ese correo"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const rolUsuario = rol === "administrador" ? "administrador" : "empleado";

        const [resultado] = await pool.query(
            `
            INSERT INTO usuarios (nombre, correo, password_hash, rol)
            VALUES (?, ?, ?, ?)
            `,
            [nombre.trim(), correo.trim().toLowerCase(), passwordHash, rolUsuario]
        );

        await enviarBienvenida({
            nombre,
            correo,
            rol: rol || "empleado"
        });

        res.status(201).json({
            ok: true,
            message: "Usuario registrado correctamente",
            usuario: {
                id: resultado.insertId,
                nombre: nombre.trim(),
                correo: correo.trim().toLowerCase(),
                rol: rolUsuario
            }
        });

    } catch (error) {
        console.error("Error al registrar usuario:", error);

        res.status(500).json({
            ok: false,
            message: "Error al registrar usuario",
            error: error.message
        });
    }
}

async function iniciarSesion(req, res) {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({
                ok: false,
                message: "Correo y contraseña son obligatorios"
            });
        }

        const [usuarios] = await pool.query(
            `
            SELECT 
                id_usuario,
                nombre,
                correo,
                password_hash,
                rol
            FROM usuarios
            WHERE correo = ?
            LIMIT 1
            `,
            [correo.trim().toLowerCase()]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                ok: false,
                message: "Correo o contraseña incorrectos"
            });
        }

        const usuario = usuarios[0];

        const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordCorrecta) {
            return res.status(401).json({
                ok: false,
                message: "Correo o contraseña incorrectos"
            });
        }

        res.json({
            ok: true,
            message: "Inicio de sesión correcto",
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error("Error al iniciar sesión:", error);

        res.status(500).json({
            ok: false,
            message: "Error al iniciar sesión",
            error: error.message
        });
    }
}

async function solicitarRecuperacionPassword(req, res) {
    console.log("Entró a forgot-password");
    console.log("Body recibido:", req.body);
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).json({ message: "El correo es obligatorio." });
        }

        const [usuarios] = await pool.query(
            "SELECT * FROM usuarios WHERE correo = ?",
            [correo]
        );

        if (usuarios.length === 0) {
            return res.json({
                message: "Si el correo existe, se enviará una recuperación."
            });
        }

        const usuario = usuarios[0];
        const token = crypto.randomBytes(32).toString("hex");
        const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

        await pool.query(
            `INSERT INTO password_resets 
             (id_usuario, token, fecha_expiracion)
             VALUES (?, ?, ?)`,
            [usuario.id_usuario, token, fechaExpiracion]
        );

        await enviarRecuperacionPassword(usuario, token);

        console.log("TOKEN DE RECUPERACIÓN PARA DEMO:", token);

        res.json({
            message: "Si el correo existe, se enviará una recuperación."
        });

    } catch (error) {
        console.error("Error al solicitar recuperación:", error);
        res.status(500).json({ message: "Error al solicitar recuperación de contraseña." });
    }
}

async function restablecerPassword(req, res) {
    try {
        const { token, nuevaPassword } = req.body;

        if (!token || !nuevaPassword) {
            return res.status(400).json({ message: "Token y nueva contraseña son obligatorios." });
        }

        if (nuevaPassword.length < 6) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
        }

        const [resets] = await pool.query(
            `SELECT * FROM password_resets
             WHERE token = ?
             AND usado = 0
             AND fecha_expiracion > NOW()`,
            [token]
        );

        if (resets.length === 0) {
            return res.status(400).json({ message: "Token inválido o expirado." });
        }

        const reset = resets[0];
        const passwordHash = await bcrypt.hash(nuevaPassword, 10);

        await pool.query(
            "UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?",
            [passwordHash, reset.id_usuario]
        );

        await pool.query(
            "UPDATE password_resets SET usado = 1 WHERE id_reset = ?",
            [reset.id_reset]
        );

        res.json({ message: "Contraseña actualizada correctamente." });

    } catch (error) {
        console.error("Error al restablecer contraseña:", error);
        res.status(500).json({ message: "Error al restablecer contraseña." });
    }
}

module.exports = {
    registrarUsuario,
    iniciarSesion,
    solicitarRecuperacionPassword,
    restablecerPassword
};