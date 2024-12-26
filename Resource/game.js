// public/game.js
const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = {};

// Render loop
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in players) {
        const player = players[id];
        ctx.fillStyle = id === socket.id ? 'blue' : 'red';
        ctx.beginPath();
        ctx.arc(player.x, player.y, 20, 0, 2 * Math.PI);
        ctx.fill();
    }

    requestAnimationFrame(render);
}

// Handle player data updates
socket.on('currentPlayers', (serverPlayers) => {
    players = serverPlayers;
});

socket.on('newPlayer', ({ id, player }) => {
    players[id] = player;
});

socket.on('playerMoved', ({ id, player }) => {
    players[id] = player;
});

socket.on('playerDisconnected', (id) => {
    delete players[id];
});

// Handle movement input
window.addEventListener('keydown', (e) => {
    const dx = e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0;
    const dy = e.key === 'ArrowDown' ? 5 : e.key === 'ArrowUp' ? -5 : 0;

    socket.emit('movePlayer', { dx, dy, angle: 0 });
});

render();
