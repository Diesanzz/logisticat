const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productosRoutes = require("./routes/productos.routes");
const reportesRoutes = require("./routes/reportes.routes");
const movimientosRoutes = require("./routes/movimientos.routes");
const alertasRoutes = require("./routes/alertas.routes");
const recomendacionesRoutes = require("./routes/recomendaciones.routes");
const configuracionRoutes = require("./routes/configuracion.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "API de Logisticat funcionando correctamente"
    });
});

app.use("/api/productos", productosRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/movimientos", movimientosRoutes);
app.use("/api/alertas", alertasRoutes);
app.use("/api/recomendaciones", recomendacionesRoutes);
app.use("/api/configuracion", configuracionRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});