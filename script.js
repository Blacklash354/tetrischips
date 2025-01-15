// Tetris Benzeri Oyun (Resimli, Arka Plan ve Başlatma Düzeltmesi)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
canvas.width = 400; // 10 sütun * 40px genişlik (Bloklar büyütüldü)
canvas.height = 800; // 20 satır * 40px yükseklik
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 40;

const background = new Image();
background.src = 'assets/images/background.jpg'; // Arka plan resmi eklendi

const pieceImages = [
    'assets/images/dusman1.png', 'assets/images/dusman2.png', 'assets/images/dusman3.png',
    'assets/images/dusman4.png', 'assets/images/dusman5.png', 'assets/images/dusman6.png',
    'assets/images/dusman7.png', 'assets/images/dusman8.png', 'assets/images/dusman9.png',
    'assets/images/dusman10.png', 'assets/images/dusman11.png', 'assets/images/dusman12.png',
    'assets/images/dusman13.png', 'assets/images/dusman14.png', 'assets/images/dusman15.png'
].map(src => {
    const img = new Image();
    img.src = src;
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
    currentX = 4;
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

function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
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
    startButton.style.display = 'none'; // Başlat düğmesini gizle
    gameLoop();
});
