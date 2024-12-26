// Import necessary modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Setup server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Player data structure
let players = {};

// Socket.IO for multiplayer communication
io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Initialize new player
    players[socket.id] = {
        x: Math.random() * 100,
        y: Math.random() * 100,
        angle: 0,
        health: 100,
    };

    // Send current players to the new player
    socket.emit('currentPlayers', players);

    // Notify others about the new player
    socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

    // Handle player movement
    socket.on('movePlayer', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x += movementData.dx;
            players[socket.id].y += movementData.dy;
            players[socket.id].angle = movementData.angle;
            io.emit('playerMoved', { id: socket.id, player: players[socket.id] });
        }
    });

    // Handle shooting
    socket.on('shoot', (bulletData) => {
        io.emit('playerShoot', { id: socket.id, bullet: bulletData });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('A player disconnected:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
