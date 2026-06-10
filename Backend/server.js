console.log("SERVER FILE EXECUTING");
console.log(__filename);
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const logger = require('./utils/logger');
const classStreamRoutes = require('./routes/classStreamRoutes');
const studentRoutes = require('./routes/studentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const resultRoutes = require('./routes/resultRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, req.body);
  next();
});

app.get('/api/health', (req, res) => {
  logger.info('Health endpoint accessed');
  res.json({ status: 'Backend is running' });
});

app.use('/api/class-streams', classStreamRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res) => {
  logger.warn('Route not found', `${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  logger.error('Server error', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
