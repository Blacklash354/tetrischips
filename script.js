// Tetris Benzeri Oyun (Düzeltildi: Alt ve Sağ Sınırlar, Blokların Doğru Hareketi)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
canvas.width = 400;
canvas.height = 800;
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 40;

const background = new Image();
background.src = 'assets/images/background.jpg';
background.onload = () => console.log('Background image loaded successfully.');
background.onerror = () => console.error('Failed to load background image.');

const pieceImages = [...Array(15)].map((_, i) => {
    const img = new Image();
    img.src = `assets/images/dusman${i + 1}.png`;
    img.onerror = () => console.error(`Failed to load image: dusman${i + 1}.png`);
    return img;
});

const SHAPES = [
    [[1, 1, 1, 1]], [[1, 1, 1], [0, 1, 0]], [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]], [[1, 1], [1, 1]], [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]]
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece;
let currentX = 4, currentY = 0;
let gameOver = false;
let score = 0;

const bgMusic = new Audio('assets/sounds/background.mp3');
bgMusic.loop = true;

function newPiece() {
    let shapeIndex = Math.floor(Math.random() * SHAPES.length);
    let imageIndex = Math.floor(Math.random() * pieceImages.length);
    currentPiece = { shape: SHAPES[shapeIndex], image: pieceImages[imageIndex] };
    currentX = Math.floor((COLS - currentPiece.shape[0].length) / 2);
    currentY = 0;
    if (!isValidMove(0, 0)) gameOver = true;
}

function isValidMove(offsetX, offsetY, rotatedPiece) {
    let shape = rotatedPiece || currentPiece.shape;
    return shape.every((row, dy) =>
        row.every((value, dx) => {
            let newX = currentX + dx + offsetX;
            let newY = currentY + dy + offsetY;
            return !value || (newX >= 0 && newX < COLS && newY < ROWS && !board[newY][newX]);
        })
    );
}

function moveSideways(direction) {
    if (isValidMove(direction, 0)) currentX += direction;
}

function moveDown() {
    if (!isValidMove(0, 1)) {
        mergePiece();
        clearRows();
        newPiece();
    } else currentY++;
}

function rotatePiece() {
    let rotated = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse());
    if (isValidMove(0, 0, rotated)) currentPiece.shape = rotated;
}

function mergePiece() {
    currentPiece.shape.forEach((row, dy) => row.forEach((value, dx) => {
        if (value) board[currentY + dy][currentX + dx] = currentPiece.image;
    }));
}

function clearRows() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            score += 100;
        }
    }
}

function drawBackground() {
    if (background.complete && background.naturalWidth > 0) {
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    } else {
        console.warn('Background image not loaded yet.');
    }
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    board.forEach((row, y) => row.forEach((value, x) => {
        if (value instanceof HTMLImageElement) {
            ctx.drawImage(value, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }));
}

function drawPiece() {
    currentPiece.shape.forEach((row, dy) => row.forEach((value, dx) => {
        if (value) {
            ctx.drawImage(currentPiece.image, (currentX + dx) * BLOCK_SIZE, (currentY + dy) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }));
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Skor: ${score}`, 10, 30);
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Oyun Bitti', 120, 400);
        return;
    }
    moveDown();
    drawBoard();
    drawPiece();
    drawScore();
    setTimeout(gameLoop, 500 - Math.min(400, score));
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') moveSideways(-1);
    if (e.key === 'ArrowRight') moveSideways(1);
    if (e.key === 'ArrowUp') rotatePiece();
    if (e.key === 'ArrowDown') moveDown();
});

startButton.addEventListener('click', () => {
    gameOver = false;
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    newPiece();
    bgMusic.play();
    startButton.style.display = 'none';
    gameLoop();
});
