const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productosRoutes = require("./routes/productos.routes");

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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});