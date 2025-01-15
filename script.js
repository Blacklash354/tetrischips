// Tetris Benzeri Oyun (Resimli ve Arka Plan Müzikli)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
canvas.width = 300; // 10 sütun * 30px genişlik
canvas.height = 600; // 20 satır * 30px yükseklik
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

const pieceImages = [
    'assets/images/dusman1.png', 'assets/images/dusman2.png', 'assets/images/dusman3.png',
    'assets/images/dusman4.png', 'assets/images/dusman5.png', 'assets/images/dusman6.png',
    'assets/images/dusman7.png', 'assets/images/dusman8.png', 'assets/images/dusman9.png',
    'assets/images/dusman11.png',  'assets/images/dusman12.png',  'assets/images/dusman13.png',
    'assets/images/dusman14.png',  'assets/images/dusman15.png',  'assets/images/dusman16.png',
    'assets/images/dusman17.png',   'assets/images/dusman18.png',  'assets/images/dusman19.png',
    'assets/images/dusman20.png',   'assets/images/dusman21.png',  'assets/images/dusman22.png',
    'assets/images/dusman23.png',   'assets/images/dusman24.png',  'assets/images/dusman25.png',
    'assets/images/dusman26.png',    'assets/images/dusman27.png',  'assets/images/dusman28.png',
    
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]]  // Z
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
    currentX = 4;
    currentY = 0;
    if (!isValidMove(0, 0)) {
        gameOver = true;
    }
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

function rotatePiece() {
    let rotated = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse());
    if (isValidMove(0, 0, rotated)) {
        currentPiece.shape = rotated;
    }
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

function moveDown() {
    if (!isValidMove(0, 1)) {
        mergePiece();
        clearRows();
        newPiece();
    } else {
        currentY++;
    }
}

function moveSideways(direction) {
    if (isValidMove(direction, 0)) {
        currentX += direction;
    }
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        ctx.fillText('Oyun Bitti', 80, 300);
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
    gameLoop();
});
