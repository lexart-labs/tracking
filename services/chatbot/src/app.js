const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const healthRouter = require('./modules/health/health.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	subtractLeadingHeaders: true,
});

app.use(limiter);

app.use('/health', healthRouter);

module.exports = app;
