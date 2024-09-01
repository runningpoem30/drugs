const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecret';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/distSystem';

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(morgan('dev'));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', apiLimiter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Routes
app.use('/api/users', require('./routes/user'));
app.use('/api/drugs', require('./routes/drug'));
app.use('/api/orders', require('./routes/order'));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('newOrder', (order) => {
        io.emit('notification', `New order placed for ${order.quantity} units of ${order.drug.name}`);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.get('/test', (req, res) => {
  res.send('Server is up and running');
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
