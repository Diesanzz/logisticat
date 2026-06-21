const bcrypt = require("bcryptjs");
const pool = require("../database/connection");

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

module.exports = {
    registrarUsuario,
    iniciarSesion
};