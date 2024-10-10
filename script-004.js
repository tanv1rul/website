const canvas = document.getElementById('exoskyCanvas');
const ctx = canvas.getContext('2d');
const dots = [];
const connections = [];
let currentCluster = null;  // Holds the current active cluster for continuous selection

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Randomly initialize the dots
for (let i = 0; i < 100; i++) {
    dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        radius: 3,
        connected: false,
        cluster: null,  // Track which cluster a dot belongs to
    });
}

// Handle dot selection and connection
canvas.addEventListener('click', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Find the closest dot to the click
    const clickedDot = dots.find(dot => {
        return Math.hypot(dot.x - mouseX, dot.y - mouseY) < dot.radius + 5;
    });

    if (clickedDot) {
        if (!currentCluster) {
            // Start a new cluster
            currentCluster = {
                dots: [],
                centerX: clickedDot.x,
                centerY: clickedDot.y,
                vx: (Math.random() - 0.5) * 1,  // Random initial cluster velocity
                vy: (Math.random() - 0.5) * 1   // Random initial cluster velocity
            };
        }

        if (!clickedDot.connected) {
            // Add dot to current cluster
            currentCluster.dots.push(clickedDot);
            clickedDot.connected = true;

            // Update cluster's center position
            currentCluster.centerX += clickedDot.x;
            currentCluster.centerY += clickedDot.y;

            if (currentCluster.dots.length > 1) {
                // Connect the current dot with the previous one
                connections.push({
                    start: currentCluster.dots[currentCluster.dots.length - 2],
                    end: clickedDot
                });
            }
        }
    }

    // Close the cluster loop
    if (currentCluster && currentCluster.dots.length > 2 && clickedDot === currentCluster.dots[0]) {
        connections.push({
            start: currentCluster.dots[currentCluster.dots.length - 1],
            end: currentCluster.dots[0]  // Connect the last dot with the first one
        });

        // Calculate cluster's average position for centering
        currentCluster.centerX /= currentCluster.dots.length;
        currentCluster.centerY /= currentCluster.dots.length;

        // Set cluster velocities for all dots in the cluster
        currentCluster.dots.forEach(dot => {
            dot.cluster = currentCluster; // Track which cluster the dot belongs to
        });

        // Reset the current cluster after closing
        currentCluster = null; // Resetting this ensures no further connections to the previous cluster
    }
});

// Update the movement of clusters and individual dots
function updateDots() {
    dots.forEach(dot => {
        // If the dot is part of a cluster, move the cluster
        if (dot.cluster) {
            // Move the dot based on the cluster's velocity
            dot.x += dot.cluster.vx;
            dot.y += dot.cluster.vy;

            // Check for collision with canvas edges
            if (dot.x < 0 || dot.x > canvas.width) {
                dot.cluster.vx *= -1;  // Reverse cluster velocity
                dot.x = Math.max(0, Math.min(dot.x, canvas.width)); // Clamp within bounds
            }
            if (dot.y < 0 || dot.y > canvas.height) {
                dot.cluster.vy *= -1;  // Reverse cluster velocity
                dot.y = Math.max(0, Math.min(dot.y, canvas.height)); // Clamp within bounds
            }
        } else {
            // Move individual dots that are not in a cluster
            dot.x += dot.vx;
            dot.y += dot.vy;

            // Bounce the individual dots off the canvas edges
            if (dot.x < 0 || dot.x > canvas.width) {
                dot.vx *= -1;
                dot.x = Math.max(0, Math.min(dot.x, canvas.width)); // Clamp within bounds
            }
            if (dot.y < 0 || dot.y > canvas.height) {
                dot.vy *= -1;
                dot.y = Math.max(0, Math.min(dot.y, canvas.height)); // Clamp within bounds
            }
        }
    });
}

// Draw dots and connections
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the dots
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();
    });

    // Draw connections
    connections.forEach(connection => {
        ctx.beginPath();
        ctx.moveTo(connection.start.x, connection.start.y);
        ctx.lineTo(connection.end.x, connection.end.y);
        ctx.strokeStyle = 'white';
        ctx.stroke();
    });
}

// Undo functionality
document.getElementById('undoButton').addEventListener('click', () => {
    if (connections.length > 0) {
        connections.pop();  // Remove the last connection
        // Find the last connected dot and disconnect it
        const lastConnection = connections[connections.length - 1];
        if (lastConnection) {
            const { end } = lastConnection;
            end.connected = false;  // Mark the last connected dot as unconnected
        }
    }
});

// Reset functionality
document.getElementById('resetButton').addEventListener('click', () => {
    // Clear all dots, connections, and reset clusters
    while (dots.length > 0) dots.pop();
    while (connections.length > 0) connections.pop();
    currentCluster = null;  // Reset the current cluster

    // Reinitialize dots
    for (let i = 0; i < 100; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            radius: 3,
            connected: false,
            cluster: null,  // Track which cluster a dot belongs to
        });
    }
});

// Animation loop
function animate() {
    updateDots();  // Update positions
    draw();        // Draw dots and their connections
    requestAnimationFrame(animate);
}

// Start animation loop
animate();
