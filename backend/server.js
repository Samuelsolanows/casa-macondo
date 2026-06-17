const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('./db'); // Probar conexión a la BD al arrancar

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth');
const actividadesRoutes = require('./routes/actividades');
const alojamientosRoutes = require('./routes/alojamientos');
const emprendimientosRoutes = require('./routes/emprendimientos');
const eventosRoutes = require('./routes/eventos');
const visitasRoutes = require('./routes/visitas');

app.use('/api', authRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/alojamientos', alojamientosRoutes);
app.use('/api/emprendimientos', emprendimientosRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/visitas', visitasRoutes);

// Ruta de estado simple
app.get('/status', (req, res) => {
  res.json({ status: 'online', message: 'Servidor Casa Macondo funcionando correctamente.' });
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
