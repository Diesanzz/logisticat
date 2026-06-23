# Logisticat

**Logisticat** es una aplicación web para la administración de inventarios en cafeterías.  
Permite registrar insumos, controlar fechas de caducidad, registrar entradas, salidas y mermas, generar alertas visuales, consultar reportes con gráficas y administrar usuarios mediante autenticación básica.

## Objetivo del proyecto

Desarrollar una aplicación web funcional que ayude a cafeterías a administrar sus productos e insumos, reduciendo mermas y mejorando el control de caducidades mediante una interfaz clara, responsiva y fácil de usar.

## Tecnologías utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript
- Chart.js

### Backend
- Node.js
- Express.js
- Nodemailer
- BcryptJS

### Base de datos
- MySQL
- XAMPP / phpMyAdmin

### Herramientas
- Git
- GitHub
- Visual Studio Code
- Postman / Thunder Client

## Funcionalidades principales

- Inicio de sesión de usuarios.
- Registro de usuarios.
- Recuperación de contraseña mediante token.
- Envío o simulación de correos de recuperación.
- Correo de bienvenida al crear una cuenta.
- Manejo básico de roles:
  - Administrador
  - Empleado
- Separación de vistas mediante navegación lateral.
- Dashboard principal.
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
- Gráficas de estado de productos y movimientos.
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
- Registrar usuarios desde la interfaz.

### Empleado

El empleado puede:

- Consultar inventario.
- Registrar productos.
- Editar productos.
- Registrar salidas.
- Consultar alertas, reportes e historial.

El empleado no puede modificar configuraciones administrativas.

## Vistas principales

El sistema se organiza en distintas vistas dentro de una misma aplicación web:

- **Dashboard:** muestra indicadores generales e insights del inventario.
- **Inventario:** permite consultar, registrar, editar productos y registrar salidas.
- **Alertas:** muestra productos vencidos o próximos a vencer.
- **Reportes:** presenta tarjetas de resumen y gráficas.
- **Historial:** muestra entradas, salidas y mermas registradas.
- **Configuración:** permite modificar parámetros administrativos del sistema.

## Gráficas y reportes

La sección de reportes utiliza **Chart.js** para mostrar información visual del inventario.

Incluye:

- Gráfica de barras para productos activos, por caducar y vencidos.
- Gráfica circular de distribución de productos por estado.
- Gráfica de movimientos registrados:
  - Entradas
  - Salidas
  - Mermas

Estas gráficas se generan con los datos obtenidos desde la API y se actualizan al modificar el inventario.

## Recuperación de contraseña

Logisticat cuenta con un flujo de recuperación de contraseña mediante token.

Flujo general:

1. El usuario selecciona **¿Olvidaste tu contraseña?**
2. Ingresa su correo.
3. El backend genera un token temporal.
4. El sistema intenta enviar el token por correo.
5. Si no hay credenciales SMTP válidas, el token se muestra en consola para modo demo.
6. El usuario ingresa el token y define una nueva contraseña.
7. La contraseña se almacena nuevamente usando hash con BcryptJS.

Este flujo permite demostrar la recuperación de contraseña aunque el entorno local no tenga correo real configurado.

## Correos del sistema

El backend utiliza **Nodemailer** para el envío de correos.

Correos implementados:

- Correo de bienvenida al crear una cuenta.
- Correo de recuperación de contraseña.

En ambiente local, si no existen credenciales SMTP válidas, el sistema no se detiene.  
En su lugar, simula el correo en la consola del backend para facilitar las pruebas.

## Estructura del proyecto

logisticat/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── database/
│   ├── package.json
│   ├── package-lock.json
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

## Instalación del proyecto

### 1. Clonar el repositorio

git clone git@github.com:Diesanzz/logisticat.git
cd logisticat

### 2. Instalar dependencias del backend

cd backend
npm install

### 3. Configurar variables de entorno

Crear un archivo `.env` dentro de la carpeta `backend`.

Ejemplo:

PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=logisticat_db
DB_PORT=3306

APP_URL=http://127.0.0.1:5500/frontend/index.html

MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=Logisticat <no-reply@logisticat.local>


Para usar Gmail real, se puede configurar así:

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=correo@gmail.com
MAIL_PASS=contraseña_de_aplicacion
MAIL_FROM=Logisticat <correo@gmail.com>


> Nota: Gmail requiere una contraseña de aplicación, no la contraseña normal de la cuenta.

### 4. Crear la base de datos

Abrir XAMPP y encender:

* Apache
* MySQL

Después entrar a phpMyAdmin y ejecutar el archivo:

database/schema.sql

Este archivo crea la base de datos `logisticat_db` y sus tablas.

Después ejecutar:

database/seed.sql

Este archivo inserta datos iniciales de prueba.

### 5. Ejecutar el backend

Dentro de la carpeta `backend`:

npm run dev

El servidor se ejecutará en:

http://localhost:3000

### 6. Abrir el frontend

Abrir el archivo:

frontend/index.html

O usar la extensión **Live Server** de Visual Studio Code.

## Endpoints principales

### Autenticación

| Método | Ruta                        | Descripción                           |
| ------ | --------------------------- | ------------------------------------- |
| POST   | `/api/auth/registro`        | Registra un nuevo usuario             |
| POST   | `/api/auth/login`           | Inicia sesión                         |
| POST   | `/api/auth/forgot-password` | Solicita recuperación de contraseña   |
| POST   | `/api/auth/reset-password`  | Restablece la contraseña usando token |

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
* `password_resets`

## Flujo recomendado de uso

1. Ejecutar los scripts de base de datos.
2. Encender el backend.
3. Abrir el frontend.
4. Crear un usuario.
5. Iniciar sesión.
6. Registrar productos en inventario.
7. Consultar alertas de caducidad.
8. Registrar salidas parciales.
9. Registrar mermas por daño o caducidad.
10. Revisar reportes y gráficas.
11. Consultar historial de movimientos.
12. Probar recuperación de contraseña.
13. Ajustar configuración de historial si se cuenta con permisos de administrador.

## Modo demo de correo

Si las variables de correo no están configuradas o Gmail rechaza las credenciales, Logisticat simula el envío de correos en consola.

Esto permite probar:

* Registro de usuarios.
* Correo de bienvenida.
* Recuperación de contraseña.
* Generación de token.
* Restablecimiento de contraseña.

Sin depender de un servidor SMTP real durante la demostración local.

## Estado del proyecto

El proyecto cuenta con una versión funcional que incluye:

* Frontend con vistas navegables.
* Backend con API REST.
* Conexión a MySQL.
* Autenticación básica.
* Registro de usuarios.
* Recuperación de contraseña.
* Correos con Nodemailer y modo demo.
* Roles básicos.
* Inventario.
* Alertas.
* Reportes con gráficas.
* Historial.
* Recomendaciones.
* Configuración administrativa.

## Integrantes

* Astrid Nahid Rayón Santiago
* Laura Sofia Riquelme Cuellar
* Diego Sandin Manzo

## Materia

Tecnologías para el desarrollo de aplicaciones web

## Institución

Instituto Politécnico Nacional
Escuela Superior de Cómputo (ESCOM)
