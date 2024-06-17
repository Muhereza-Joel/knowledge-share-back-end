const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const tagRoutes = require('./routes/tags');
const eventRoutes = require('./routes/event');
const commentRoutes = require('./routes/comments');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const recommendationsRoutes = require('./routes/recommendations');

const app = express();
const port = process.env.PORT || 3001;
const host = 'localhost';

// Middleware for parsing JSON data
app.use(bodyParser.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use the routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);

// Start the server
app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
