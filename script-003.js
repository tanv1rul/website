const canvas = document.getElementById('exoskyCanvas');
const ctx = canvas.getContext('2d');
const dots = [];
const connections = [];
let selectedDots = [];
let dotPairs = [];
let animationFrame;
let currentCluster = null;  // Holds the current active cluster for continuous selection
let clusterSpeedFactor = 0.2;  // Speed for moving clusters

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Randomly initialize the dots
for (let i = 0; i < 100; i++) {
    dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 3,
        connected: false,
        cluster: null,  // Track which cluster a dot belongs to
        isClusterClosed: false  // Track if the dot is part of a closed cluster
    });
}

// Handle dot selection and connection
canvas.addEventListener('click', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    dots.forEach(dot => {
        if (Math.hypot(mouseX - dot.x, mouseY - dot.y) < 10) {
            if (!currentCluster) {
                // Start a new cluster with the first dot
                currentCluster = [dot];
                dot.connected = true;
                dot.cluster = currentCluster;
            } else if (dot === currentCluster[0] && !currentCluster.closed) {
                // Close the cluster loop by clicking the first dot again
                currentCluster.closed = true;  // Mark the cluster as closed
                currentCluster.forEach(d => d.isClusterClosed = true);  // Mark all dots in the cluster as closed
                clusterSpeedFactor = 0.5;  // Slow down the cluster once closed
                currentCluster = null; // Break the cluster selection mode
            } else if (!currentCluster.closed && !dot.isClusterClosed) {
                // Add dot to the current cluster only if it's not part of a closed cluster
                connectDots(currentCluster[currentCluster.length - 1], dot);
                currentCluster.push(dot);
                dot.connected = true;
                dot.cluster = currentCluster;
                clusterSpeedFactor = 0.05;  // Slower speed for unclosed clusters
            }
        }
    });
});

function connectDots(dot1, dot2) {
    dotPairs.push([dot1, dot2]);
    connections.push({dot1, dot2});
}

function undoConnection() {
    if (connections.length > 0) {
        const { dot1, dot2 } = connections.pop();
        dot1.connected = dot2.connected = false;
        dotPairs.pop();

        // Remove from cluster
        if (dot1.cluster) dot1.cluster = null;
        if (dot2.cluster) dot2.cluster = null;
    }
}

function resetCanvas() {
    connections.length = 0;
    dotPairs.length = 0;
    dots.forEach(dot => {
        dot.connected = false;
        dot.cluster = null;
        dot.isClusterClosed = false;
    });
    currentCluster = null;
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

    // Update motion of connected clusters
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

    // Move entire cluster if a cluster is closed
    dots.forEach(dot => {
        if (dot.cluster && dot.cluster.length > 2 && dot.isClusterClosed) {
            const cluster = dot.cluster;
            const avgVx = cluster.reduce((sum, d) => sum + d.vx, 0) / cluster.length * clusterSpeedFactor;
            const avgVy = cluster.reduce((sum, d) => sum + d.vy, 0) / cluster.length * clusterSpeedFactor;

            cluster.forEach(clusterDot => {
                clusterDot.x += avgVx;
                clusterDot.y += avgVy;

                // Bounce off edges for clusters
                if (clusterDot.x < 0 || clusterDot.x > canvas.width) clusterDot.vx *= -1;
                if (clusterDot.y < 0 || clusterDot.y > canvas.height) clusterDot.vy *= -1;
            });
        }
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
