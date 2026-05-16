const express = require('express'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ 
        status: "Online", 
        message: "Backend del Controlador de Tráfico Aéreo listo",
        replica: process.env.REPLICA_NAME || "Instancia Base"
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});