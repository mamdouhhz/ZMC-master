const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const cron = require('node-cron');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught Exception. Shutting down server...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

// DEVELOPMENT DATABASE
// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

// LOCAL DATABASE
const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB)
  .then(() => console.log('Database Connected Successfully!'));
//   .catch(() => {
//   });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection 💥. Shuting down...');
  // close server after asynchronous requests
  server.close(() => {
    process.exit(1);
  });
});
