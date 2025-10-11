const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const nameModal = document.getElementById('nameModal');
const gameContainer = document.getElementById('gameContainer');
const playerNameInput = document.getElementById('playerName');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const leaderboardList = document.getElementById('leaderboardList');

const WORKER_URL = 'snake-worker.ayolahbisa13.workers.dev'; // Ganti dengan URL Worker-mu
const gridSize = 20;
const tileCount = 280 / gridSize;
let snake = [{ x: 7, y: 7 }];
let food = { x: 10, y: 10 };
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop;
let currentPlayer = '';

function generateFood() {
    let newFood;
    let isOnSnake;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (isOnSnake);
    return newFood;
}

async function fetchLeaderboard() {
    try {
        const response = await fetch(`${WORKER_URL}/leaderboard`);
        const data = await response.json();
        leaderboardList.innerHTML = '';
        data.slice(0, 10).forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
            leaderboardList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        leaderboardList.innerHTML = '<li>Error loading leaderboard</li>';
    }
}

async function submitScore(name, score) {
    try {
        await fetch(`${WORKER_URL}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, score })
        });
    } catch (error) {
        console.error('Error submitting score:', error);
    }
}

function startWithName() {
    currentPlayer = playerNameInput.value.trim() || 'Anonymous';
    if (currentPlayer === '') {
        alert('Masukkan nama!');
        return;
    }
    currentPlayerDisplay.textContent = currentPlayer;
    nameModal.style.display = 'none';
    gameContainer.style.display = 'block';
    startGame();
}

function startGame() {
    snake = [{ x: 7, y: 7 }];
    food = generateFood();
    dx = 0;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = score;
    clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, 120);
}

function resetGame() {
    startGame();
}

function changeDirection(direction) {
    if (direction === 'up' && dy === 0) {
        dx = 0; dy = -1;
    } else if (direction === 'down' && dy === 0) {
        dx = 0; dy = 1;
    } else if (direction === 'left' && dx === 0) {
        dx = -1; dy = 0;
    } else if (direction === 'right' && dx === 0) {
        dx = 1; dy = 0;
    }
}

function drawGame() {
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    let head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        food = generateFood();
    } else {
        snake.pop();
    }

    ctx.fillStyle = '#00cc66';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            clearInterval(gameLoop);
            submitScore(currentPlayer, score);
            alert(`Game Over! Skor: ${score}. Cek leaderboard!`);
            nameModal.style.display = 'flex';
            gameContainer.style.display = 'none';
            playerNameInput.value = '';
            fetchLeaderboard();
            return;
        }
    }
}

nameModal.style.display = 'flex';
fetchLeaderboard();
