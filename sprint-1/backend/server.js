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

app.use('/api', authRoutes);
app.use('/api/actividades', actividadesRoutes);

// Ruta de estado simple
app.get('/status', (req, res) => {
  res.json({ status: 'online', message: 'Servidor Bochalema 360 funcionando correctamente.' });
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
