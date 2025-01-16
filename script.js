// Ana canvas ve board için canvas oluşturma
const mainCanvas = document.getElementById('gameCanvas');
const mainCtx = mainCanvas.getContext('2d');
mainCanvas.width = 480;
mainCanvas.height = 640;

const boardCanvas = document.createElement('canvas');
const boardCtx = boardCanvas.getContext('2d');
boardCanvas.width = 480;
boardCanvas.height = 640;

document.body.appendChild(boardCanvas); // Board katmanını ekliyoruz

const ROWS = 16;
const COLS = 12;
const BLOCK_SIZE = 40;

let backgroundIndex = 0;
const backgroundImages = Array.from({ length: 28 }, (_, i) => `assets/images/dusman${i + 1}.png`);

function changeBackground() {
    const img = new Image();
    img.src = backgroundImages[backgroundIndex];
    img.onload = () => {
        mainCtx.globalCompositeOperation = 'destination-over';
        mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.globalCompositeOperation = 'source-over';
        backgroundIndex = (backgroundIndex + 1) % backgroundImages.length;
    };
    setTimeout(changeBackground, 10000);
}

const pieceImages = Array.from({ length: 15 }, (_, i) => {
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
let currentPiece, nextPiece;
let currentX = 4, currentY = 0;
let gameOver = false;
let score = 0;

const bgMusicTracks = [
    new Audio('assets/sounds/background1.mp3'),
    new Audio('assets/sounds/background2.mp3'),
    new Audio('assets/sounds/background3.mp3')
];
let currentMusicIndex = 0;

function playBackgroundMusic() {
    if (bgMusicTracks.length === 0) return;
    const currentTrack = bgMusicTracks[currentMusicIndex];
    currentTrack.loop = false;
    currentTrack.play().catch(err => {
        console.warn(`Failed to play music: ${currentTrack.src}, Error: ${err}`);
    });

    currentTrack.onended = () => {
        currentMusicIndex = (currentMusicIndex + 1) % bgMusicTracks.length;
        playBackgroundMusic();
    };
}

function newPiece() {
    if (!nextPiece) nextPiece = generatePiece();
    currentPiece = nextPiece;
    nextPiece = generatePiece();
    currentX = Math.floor((COLS - currentPiece.shape[0].length) / 2);
    currentY = 0;
    if (!isValidMove(0, 0)) gameOver = true;
}

function generatePiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const imageIndex = Math.floor(Math.random() * pieceImages.length);
    return { shape: SHAPES[shapeIndex], image: pieceImages[imageIndex] };
}

function isValidMove(offsetX, offsetY, rotatedPiece = currentPiece.shape) {
    return rotatedPiece.every((row, dy) =>
        row.every((value, dx) => {
            if (!value) return true;
            const newX = currentX + dx + offsetX;
            const newY = currentY + dy + offsetY;
            return (
                newX >= 0 && newX < COLS &&
                newY >= 0 && newY < ROWS &&
                !board[newY]?.[newX]
            );
        })
    );
}

function moveSideways(direction) {
    if (isValidMove(direction, 0)) currentX += direction;
    drawBoard();
    drawPiece();
}

function moveDown() {
    if (!isValidMove(0, 1)) {
        mergePiece();
        clearRows();
        if (!gameOver) newPiece();
    } else {
        currentY++;
    }
}

function rotatePiece() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    if (isValidMove(0, 0, rotated)) currentPiece.shape = rotated;
    drawBoard();
    drawPiece();
}

function mergePiece() {
    currentPiece.shape.forEach((row, dy) =>
        row.forEach((value, dx) => {
            if (value) board[currentY + dy][currentX + dx] = currentPiece.image;
        })
    );
}

const soundEffects = [
    new Audio('assets/sounds/carpma1.mp3'),
    new Audio('assets/sounds/carpma2.mp3'),
    new Audio('assets/sounds/carpma3.mp3')
];

function playRandomSound() {
    const randomIndex = Math.floor(Math.random() * soundEffects.length);
    soundEffects[randomIndex].play();
}

function clearRows() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            score += 100;
            playRandomSound();
            drawStaticText(); // Skoru güncelle
        }
    }
}

function drawStaticText() {
    mainCtx.clearRect(0, 0, mainCanvas.width, 50); // Sadece üst kısmı temizle
    mainCtx.fillStyle = 'white';
    mainCtx.font = '20px Arial';
    mainCtx.fillText(`Skor: ${score}`, 10, 30);
    mainCtx.font = '16px Arial';
    mainCtx.fillText('Gelen Patlak Blok:', 350, 30);
}

function drawBackground() {
    const img = new Image();
    img.src = backgroundImages[backgroundIndex];
    if (img.complete && img.naturalWidth > 0) {
        mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
    }
}

function drawBoard() {
    boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
    board.forEach((row, y) =>
        row.forEach((value, x) => {
            if (value instanceof HTMLImageElement) {
                boardCtx.drawImage(value, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        })
    );
}

function drawPiece() {
    currentPiece.shape.forEach((row, dy) =>
        row.forEach((value, dx) => {
            if (value) {
                boardCtx.drawImage(currentPiece.image, (currentX + dx) * BLOCK_SIZE, (currentY + dy) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        })
    );
}

function drawNextPiece() {
    nextPiece.shape.forEach((row, dy) =>
        row.forEach((value, dx) => {
            if (value) {
                mainCtx.drawImage(nextPiece.image, 350 + dx * BLOCK_SIZE / 2, 50 + dy * BLOCK_SIZE / 2, BLOCK_SIZE / 2, BLOCK_SIZE / 2);
            }
        })
    );
}

function drawGameOver() {
    mainCtx.fillStyle = 'red';
    mainCtx.font = '40px Arial';
    mainCtx.fillText('Oyun Bitti', 120, mainCanvas.height / 2);
}

function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }
    moveDown();
    drawBoard();
    drawPiece();
    setTimeout(gameLoop, 500);
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
    playBackgroundMusic();
    startButton.style.display = 'none';
    drawStaticText();
    changeBackground();
    gameLoop();
});
