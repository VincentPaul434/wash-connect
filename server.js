const express = require('express');
const cors = require('cors');
require('dotenv').config();

const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const testTokenRoutes = require('./routes/testToken');
const profileRoutes = require('./routes/profile');
const changePasswordRoutes = require('./routes/changePasswords');
const carwashOwnerRegisterRoutes = require('./routes/carwashOwnerRegisters');
const carwashOwnerLoginRoutes = require('./routes/carwashOwnerLogin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', registerRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/auth', testTokenRoutes);
app.use('/api/auth', carwashOwnerRegisterRoutes);
app.use('/api/auth', carwashOwnerLoginRoutes);

app.use('/api/user', profileRoutes);
app.use('/api/user', changePasswordRoutes);


app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));