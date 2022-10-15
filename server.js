require('dotenv').config();
const { DB_URI, DB_PASSWORD, DB_USERNAME } = process.env;
const db_uri = DB_URI.replace(/\<username\>/g, encodeURIComponent(DB_USERNAME)).replace(/\<password\>/g, encodeURIComponent(DB_PASSWORD))

// DB setup.
const { DBSetup } = require('./config');
const { PORT } = process.env || 5000;
const { app } = require('./index');

// IO setup
const { Server } = require('socket.io');

new DBSetup().connectDB(db_uri, () => {
    // app.listen(PORT, console.log(`Server running on port http://localhost:${PORT}`));

    const server = app.listen(PORT, console.log(`Server running on port http://localhost:${PORT}`));

    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000"
        }
    });

    io.on('connection', (socket) => {
        console.log(`${socket.id} connected to server`);

        socket.on('setup', (userData) => {
            socket.join(userData._id);
            socket.emit('connected');
        });

        socket.on('join chat', (room) => {
            socket.join(room);
            console.log(`User joined room: ${room}`);
        });

        socket.on('typing', (room) => socket.in(room).emit('typing'));

        socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

        socket.on('new message', (newMessage) => {
            let chat = newMessage.chat;

            if (!chat.users) return console.log('chat.users not defined');

            chat.users.forEach(user => {
                if (user._id == newMessage.sender._id) return;

                socket.in(user._id).emit('message received', newMessage);
            })
        });

        socket.off('setup', () => {
            console.log('user disconnected');
            socket.leave(userData._id);
        });
    })

})

