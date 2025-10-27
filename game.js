// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    {x: 10, y: 10}
];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;

// Initialize high score display
highScoreElement.textContent = highScore;

// Game functions
function drawGame() {
    if (gamePaused || !gameRunning) return;
    
    clearCanvas();
    moveSnake();
    
    const collision = checkCollision();
    if (collision) {
        gameOver();
        return;
    }
    
    drawFood();
    drawSnake();
    
    setTimeout(drawGame, 100);
}

function clearCanvas() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((segment, index) => {
        // Head is brighter
        ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Draw eyes on head
        if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = 3;
            const eyeOffset = 5;
            
            // Position eyes based on direction
            if (dx === 1) { // Moving right
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (dx === -1) { // Moving left
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (dy === -1) { // Moving up
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
            } else if (dy === 1) { // Moving down
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            }
        }
    });
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

function drawFood() {
    // Draw food with pulsing effect
    const time = Date.now() / 1000;
    const pulse = Math.sin(time * 5) * 0.1 + 0.9;
    
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    
    const foodSize = gridSize * pulse;
    const offset = (gridSize - foodSize) / 2;
    
    ctx.fillRect(
        food.x * gridSize + offset,
        food.y * gridSize + offset,
        foodSize - 2,
        foodSize - 2
    );
    
    ctx.shadowBlur = 0;
}

function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function gameOver() {
    gameRunning = false;
    alert(`Game Over! Your score: ${score}`);
    startBtn.textContent = 'Start Game';
}

function startGame() {
    if (gameRunning) return;
    
    resetGame();
    gameRunning = true;
    gamePaused = false;
    startBtn.textContent = 'Restart';
    generateFood();
    drawGame();
}

function pauseGame() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
    
    if (!gamePaused) {
        drawGame();
    }
}

function resetGame() {
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameRunning = false;
    gamePaused = false;
    startBtn.textContent = 'Start Game';
    pauseBtn.textContent = 'Pause';
    clearCanvas();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (dy === 0) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
            if (dy === 0) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (dx === 0) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx === 0) {
                dx = 1;
                dy = 0;
            }
            break;
    }
});

// Button event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);

// Initial canvas draw
clearCanvas();
