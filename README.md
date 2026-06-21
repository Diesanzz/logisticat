# Logisticat

**Logisticat** es una aplicación web para la administración de inventarios en cafeterías.  
Permite registrar insumos, controlar fechas de caducidad, registrar entradas y salidas, detectar productos próximos a vencer, consultar reportes y obtener recomendaciones para mejorar la gestión del inventario.

## Objetivo del proyecto

Desarrollar una aplicación web funcional que ayude a cafeterías a administrar sus productos e insumos, reduciendo mermas y facilitando el control de caducidades mediante una interfaz clara, responsiva y fácil de usar.

## Tecnologías utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Base de datos
- MySQL
- XAMPP / phpMyAdmin

### Herramientas
- Git
- GitHub
- Postman / Thunder Client
- Visual Studio Code

## Funcionalidades principales

- Inicio de sesión de usuarios.
- Registro de usuarios.
- Manejo básico de roles:
  - Administrador
  - Empleado
- Registro de productos.
- Edición de productos.
- Alta inteligente de productos existentes.
- Control de cantidades en inventario.
- Registro de salidas parciales.
- Registro de mermas por consumo, daño o caducidad.
- Alertas de productos próximos a caducar.
- Badge visual de alertas en la barra lateral.
- Historial de movimientos.
- Filtros y búsqueda en inventario.
- Filtros y búsqueda en historial.
- Reportes visuales del inventario.
- Recomendaciones inteligentes basadas en el estado del inventario.
- Configuración de conservación de historial.
- Limpieza manual de historial antiguo.
- Sidebar colapsable.
- Modal de perfil de usuario.

## Roles del sistema

### Administrador

El administrador puede:

- Acceder a la configuración del sistema.
- Modificar la conservación del historial.
- Limpiar historial antiguo.
- Consultar inventario, alertas, reportes e historial.
- Registrar, editar y retirar productos.

### Empleado

El empleado puede:

- Consultar inventario.
- Registrar productos.
- Editar productos.
- Registrar salidas.
- Consultar alertas, reportes e historial.

El empleado no puede modificar configuraciones administrativas.

## Estructura del proyecto

`txt
logisticat/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── database/
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── main.js
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
├── .gitignore
└── README.md
`

## Instalación del proyecto

### 1. Clonar el repositorio

`git clone git@github.com:Diesanzz/logisticat.git
cd logisticat
`

### 2. Instalar dependencias del backend

`cd backend
npm install
`

### 3. Configurar variables de entorno

Crear un archivo `.env` dentro de la carpeta `backend` con el siguiente contenido:

`env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=logisticat_db
DB_PORT=3306
`

También existe un archivo `.env.example` como referencia.

### 4. Crear la base de datos

Abrir XAMPP y encender:

* Apache
* MySQL

Después entrar a phpMyAdmin y crear la base de datos:

`sql
CREATE DATABASE logisticat_db;
`

Luego ejecutar los scripts ubicados en la carpeta `database/`:

`txt
database/schema.sql
database/seed.sql
`

### 5. Ejecutar el backend

Dentro de la carpeta `backend`:

`bash
npm run dev
`

El servidor se ejecutará en:

`txt
http://localhost:3000
`

### 6. Abrir el frontend

Abrir el archivo:

`txt
frontend/index.html
`

O usar la extensión **Live Server** de Visual Studio Code.

## Endpoints principales

### Autenticación

| Método | Ruta                 | Descripción               |
| ------ | -------------------- | ------------------------- |
| POST   | `/api/auth/registro` | Registra un nuevo usuario |
| POST   | `/api/auth/login`    | Inicia sesión             |

### Productos

| Método | Ruta                       | Descripción                 |
| ------ | -------------------------- | --------------------------- |
| GET    | `/api/productos`           | Obtiene todos los productos |
| POST   | `/api/productos`           | Registra un producto        |
| PUT    | `/api/productos/:id`       | Actualiza un producto       |
| POST   | `/api/productos/:id/merma` | Registra salida o merma     |
| DELETE | `/api/productos/:id`       | Elimina un producto         |

### Movimientos

| Método | Ruta               | Descripción                         |
| ------ | ------------------ | ----------------------------------- |
| GET    | `/api/movimientos` | Obtiene el historial de movimientos |

### Reportes

| Método | Ruta                    | Descripción                    |
| ------ | ----------------------- | ------------------------------ |
| GET    | `/api/reportes/resumen` | Obtiene resumen del inventario |

### Alertas

| Método | Ruta                     | Descripción                                     |
| ------ | ------------------------ | ----------------------------------------------- |
| GET    | `/api/alertas/caducidad` | Obtiene productos vencidos o próximos a caducar |

### Recomendaciones

| Método | Ruta                   | Descripción                           |
| ------ | ---------------------- | ------------------------------------- |
| GET    | `/api/recomendaciones` | Genera recomendaciones del inventario |

### Configuración

| Método | Ruta                                   | Descripción                         |
| ------ | -------------------------------------- | ----------------------------------- |
| GET    | `/api/configuracion`                   | Obtiene configuración actual        |
| PUT    | `/api/configuracion/historial`         | Actualiza conservación de historial |
| DELETE | `/api/configuracion/historial/limpiar` | Limpia historial antiguo            |

## Base de datos

Tablas principales:

* `productos`
* `movimientos`
* `mermas`
* `usuarios`
* `configuraciones`

## Flujo recomendado de uso

1. Iniciar sesión.
2. Registrar productos en inventario.
3. Consultar alertas de caducidad.
4. Registrar salidas parciales cuando se consuman productos.
5. Registrar mermas por daño o caducidad.
6. Revisar reportes e historial.
7. Consultar recomendaciones del sistema.
8. Ajustar configuración de historial si se cuenta con permisos de administrador.

## Estado del proyecto

El proyecto cuenta con una versión funcional que incluye frontend, backend, conexión a base de datos MySQL, autenticación básica, roles, reportes, alertas, historial y recomendaciones.

## Integrantes

* Astrid Nahid Rayón Santiago
* Laura Sofia Riquelme Cuellar
* Diego Sandin Manzo

## Materia

Tecnologías para el desarrollo de aplicaciones web

## Institución

Instituto Politécnico Nacional
Escuela Superior de Cómputo

