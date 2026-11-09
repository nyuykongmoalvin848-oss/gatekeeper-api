import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Gatekeeper core routing successfully mounted. Running on port ${PORT}`);
});
