require('dotenv').config();
const express = require('express');
const authMiddleware = require('./middleware/auth');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Load Routes
const authRoutes = require('./routes/auth'); // Import auth.js from routes
const configRoutes = require('./routes/config');

app.use('/auth', authRoutes); // Mount auth.js under /auth
app.use('/api', authMiddleware, configRoutes); // Mount config.js under /api

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log('Abstract API Key:', process.env.ABSTRACT_API_KEY);


const projectRoutes = require('./routes/projects');
app.use('/projects', projectRoutes);
