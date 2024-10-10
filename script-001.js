const canvas = document.getElementById('exoskyCanvas');
const ctx = canvas.getContext('2d');
const dots = [];
const connections = [];
let selectedDots = [];
let dotPairs = [];
let animationFrame;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Randomly initialize the dots
for (let i = 0; i < 100; i++) {
    dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 8,
        connected: false
    });
}

// Handle dot selection and connection
canvas.addEventListener('click', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    dots.forEach(dot => {
        if (!dot.connected && Math.hypot(mouseX - dot.x, mouseY - dot.y) < 10) {
            selectedDots.push(dot);

            if (selectedDots.length === 2) {
                connectDots(selectedDots[0], selectedDots[1]);
                selectedDots = [];
            }
        }
    });
});

function connectDots(dot1, dot2) {
    dotPairs.push([dot1, dot2]);
    connections.push({dot1, dot2});
    dot1.connected = dot2.connected = true;
}

function undoConnection() {
    if (connections.length > 0) {
        const { dot1, dot2 } = connections.pop();
        dot1.connected = dot2.connected = false;
        dotPairs.pop();
    }
}

function resetCanvas() {
    connections.length = 0;
    dotPairs.length = 0;
    dots.forEach(dot => dot.connected = false);
}

document.getElementById('undoButton').addEventListener('click', undoConnection);
document.getElementById('resetButton').addEventListener('click', resetCanvas);

// Dot motion
function updateDots() {
    dots.forEach(dot => {
        if (!dot.connected) {
            dot.x += dot.vx;
            dot.y += dot.vy;

            // Bounce off the edges
            if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
            if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
        }
    });

    dotPairs.forEach(pair => {
        const centerX = (pair[0].x + pair[1].x) / 2;
        const centerY = (pair[0].y + pair[1].y) / 2;

        const distanceX = pair[0].x - centerX;
        const distanceY = pair[0].y - centerY;

        pair[0].x = centerX + distanceX;
        pair[0].y = centerY + distanceY;
        pair[1].x = centerX - distanceX;
        pair[1].y = centerY - distanceY;
    });
}

function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'white';
        ctx.fill();
    });

    connections.forEach(({ dot1, dot2 }) => {
        ctx.beginPath();
        ctx.moveTo(dot1.x, dot1.y);
        ctx.lineTo(dot2.x, dot2.y);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function animate() {
    updateDots();
    drawDots();
    animationFrame = requestAnimationFrame(animate);
}

animate();
