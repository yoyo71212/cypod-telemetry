// cypod-telemetry

require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3000;

pool.query('SELECT 1')
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to PostgreSQL database', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});