const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const PORT = process.env.PORT || 5000;
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
// Connect to DB
connectDB();

const app = express();
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Is set' : 'Not set');

//Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);

//Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));