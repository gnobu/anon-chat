const express = require('express');
const app = express();
const cors = require('cors');

const { notFound, errorHandler } = require('./middleware/error.middleware');
const userRoutes = require('./routes/user.route');
const chatRoutes = require('./routes/chat.route');
const messageRoutes = require('./routes/message.route');


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('API is running');
})

app.use('/api/user', (req, res, next) => {
    console.log('reached login');
    next()
}, userRoutes);

app.use('/api/chat', chatRoutes);

app.use('/api/message', messageRoutes);

app.use(notFound);

app.use(errorHandler);

module.exports = { app };