const path = require('path');

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const patientRouter = require('./routes/patientRoutes');
const sessionRouter = require('./routes/sessionRoutes');
const timetableRouter = require('./routes/timetableRoutes');
const waitingListRouter = require('./routes/waitingListRoutes');
const notebookRouter = require('./routes/notebookRoutes');

const app = express();
app.use(express.json({ limit: '10kb' }));

app.use(cors());

// 1) Middlewares
app.use(express.static(path.join(__dirname, 'public')));

if ((process.env.NODE_ENV = 'development')) app.use(morgan('dev'));
// if ((process.env.NODE_ENV === 'development')) app.use(morgan('dev'));

const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'لقد حاولت العديد من المحاولات. حاول مرة أخرى',
});

app.use('/api', limiter);

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/patients', patientRouter);
app.use('/api/v1/sessions', sessionRouter);
app.use('/api/v1/timetables', timetableRouter);
app.use('/api/v1/waiting-list', waitingListRouter);
app.use('/api/v1/notebooks', notebookRouter);

app.all('*', (req, res, next) => {
  return next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalErrorHandler);
module.exports = app;
