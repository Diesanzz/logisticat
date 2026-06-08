# Logisticat

**Logisticat** es una aplicación web para la administración de inventarios en cafeterías. Su objetivo principal es ayudar a registrar insumos, monitorear fechas de caducidad, controlar entradas y salidas de productos, y reducir la merma mediante alertas visuales.

## Objetivo general

Desarrollar una aplicación web funcional para la administración de inventarios en cafeterías que permita el registro de insumos y el monitoreo de sus fechas de caducidad para optimizar el aprovechamiento de recursos y reducir la merma.

## Objetivos específicos

- Diseñar una arquitectura web responsiva accesible desde cualquier navegador.
- Implementar lógica en JavaScript para calcular automáticamente la vida útil de los productos.
- Diseñar un sistema de alertas visuales para productos próximos a caducar.
- Organizar el inventario para mostrar primero los productos que vencen antes.
- Configurar una base de datos SQL para guardar el historial de entradas, salidas y mermas.

## Módulos principales

- Registro de insumos.
- Inventario general.
- Alertas de caducidad.
- Control de entradas.
- Control de salidas.
- Registro de mermas.
- Historial de movimientos.

## Reglas de negocio

- Todo insumo debe registrarse con nombre, cantidad, fecha de entrada y fecha de caducidad.
- El sistema debe priorizar la salida de productos con fecha de vencimiento más próxima.
- Los productos deben mostrarse con alertas visuales según su fecha de caducidad:
  - Rojo: menos de 48 horas para vencer.
  - Amarillo: entre 3 y 7 días para vencer.
  - Verde: producto vigente.
- No se permite eliminar productos del stock sin registrar el motivo: consumo, daño o caducidad.

## Tecnologías propuestas

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### Base de datos

- MySQL

### Herramientas

- Git
- GitHub
- Docker
- Postman
- Visual Studio Code

## Estructura del proyecto

```txt
logisticat/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── main.js
│
├── backend/
│   └── src/
│       ├── routes/
│       ├── controllers/
│       └── database/
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   ├── requerimientos.md
│   ├── reglas-negocio.md
│   └── avances.md
│
└── README.md