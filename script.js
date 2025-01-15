const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
canvas.width = 480;
canvas.height = 640;
const ROWS = 16;
const COLS = 12;
const BLOCK_SIZE = 40;

// Arka plan resmi
const background = new Image();
background.src = 'assets/images/background.png';
background.onload = () => console.log('Background loaded successfully.');
background.onerror = () => console.error('Failed to load background image.');

// Parça resimleri
const pieceImages = Array.from({ length: 15 }, (_, i) => {
    const img = new Image();
    img.src = `assets/images/dusman${i + 1}.png`;
    img.onerror = () => console.error(`Failed to load image: dusman${i + 1}.png`);
    return img;
});

// Tetris şekilleri
const SHAPES = [
    [[1, 1, 1, 1]], [[1, 1, 1], [0, 1, 0]], [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]], [[1, 1], [1, 1]], [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]]
];

// Başlangıç durumları
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece, nextPiece;
let currentX = 4, currentY = 0;
let gameOver = false;
let score = 0;

// Arka plan müziği
const bgMusic = new Audio('assets/sounds/background.mp3');
bgMusic.loop = true;

function preloadImages(images, callback) {
    let loadedCount = 0;
    images.forEach((img) => {
        img.onload = () => {
            loadedCount++;
            if (loadedCount === images.length) {
                callback();
            }
        };
        img.onerror = () => {
            console.warn(`Failed to load image: ${img.src}`);
            loadedCount++;
            if (loadedCount === images.length) {
                callback();
            }
        };
    });
}

function newPiece() {
    if (!nextPiece) {
        nextPiece = generatePiece();
    }
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
            if (!value) return true; // Parça yoksa devam et
            const newX = currentX + dx + offsetX;
            const newY = currentY + dy + offsetY;
            return (
                newX >= 0 && newX < COLS && // Yan sınır kontrolü
                newY >= 0 && newY < ROWS && // Alt sınır kontrolü
                !board[newY]?.[newX] // Mevcut tahtadaki doluluk kontrolü
            );
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
    } else {
        currentY++;
    }
}

function rotatePiece() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    if (isValidMove(0, 0, rotated)) currentPiece.shape = rotated;
}

function mergePiece() {
    currentPiece.shape.forEach((row, dy) =>
        row.forEach((value, dx) => {
            if (value) board[currentY + dy][currentX + dx] = currentPiece.image;
        })
    );
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
    }
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    board.forEach((row, y) =>
        row.forEach((value, x) => {
            if (value instanceof HTMLImageElement) {
                ctx.drawImage(value, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        })
    );
}

function drawNextPiece() {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Gelen Patlak Blok:', 350, 30);
    nextPiece.shape.forEach((row, dy) =>
        row.forEach((value, dx) => {
            if (value) {
                try {
                    if (nextPiece.image.complete && nextPiece.image.naturalWidth > 0) {
                        ctx.drawImage(
                            nextPiece.image,
                            350 + dx * BLOCK_SIZE / 2,
                            50 + dy * BLOCK_SIZE / 2,
                            BLOCK_SIZE / 2,
                            BLOCK_SIZE / 2
                        );
                    } else {
                        console.warn('Next piece image not loaded or broken.');
                    }
                } catch (error) {
                    console.error('Failed to draw next piece image:', error);
                }
            }
        })
    );
}

function drawPiece() {
    currentPiece.shape.forEach((row, dy) =>
        row.forEach((value, dx) => {
            if (value) {
                try {
                    if (currentPiece.image.complete && currentPiece.image.naturalWidth > 0) {
                        ctx.drawImage(
                            currentPiece.image,
                            (currentX + dx) * BLOCK_SIZE,
                            (currentY + dy) * BLOCK_SIZE,
                            BLOCK_SIZE,
                            BLOCK_SIZE
                        );
                    } else {
                        console.warn('Current piece image not loaded or broken.');
                    }
                } catch (error) {
                    console.error('Failed to draw current piece image:', error);
                }
            }
        })
    );
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
    drawNextPiece();
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

    console.log("Starting the game...");
    newPiece(); // İlk parçayı oluştur
    bgMusic.play(); // Arka plan müziğini başlat
    startButton.style.display = 'none'; // Başla düğmesini gizle
    gameLoop(); // Oyun döngüsünü başlat
});
