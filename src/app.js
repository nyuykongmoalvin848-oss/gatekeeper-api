import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import router from './routes/routes.js';
import { pool } from './config/db.js';

const app = express();
app.use(express.json());


const openapiDocument = YAML.load('./openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));


app.use(router);


app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});


app.use((err, req, res, next) => {
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
