CREATE DATABASE IF NOT EXISTS logisticat_db;
USE logisticat_db;

CREATE TABLE IF NOT EXISTS productos {
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_caducidad DATE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
};

CREATE TABLE IF NOT EXISTS mermas (
    id_merma INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_caducidad DATE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);