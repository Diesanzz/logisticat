CREATE DATABASE IF NOT EXISTS logisticat_db;
USE logisticat_db;

CREATE TABLE IF NOT EXISTS productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_caducidad DATE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mermas (
    id_merma INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NULL,
    nombre_producto VARCHAR(100) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    motivo ENUM('consumo', 'daño', 'caducidad') NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movimientos (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NULL,
    nombre_producto VARCHAR(100) NOT NULL,
    tipo ENUM('entrada', 'salida', 'merma') NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    motivo VARCHAR(100) NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS configuraciones (
    id_configuracion INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor VARCHAR(100) NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'empleado') DEFAULT 'empleado',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets (
    id_reset INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    fecha_expiracion DATETIME NOT NULL,
    usado TINYINT(1) DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);