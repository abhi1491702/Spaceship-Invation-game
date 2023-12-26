const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hitSound = document.getElementById("hitSound");
const groundSound = document.getElementById("groundSound");

let spaceship = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 30,
    width: 30,
    height: 30,
    dx: 10,
    image: new Image(), // Create a new image object
    
};
spaceship.image.src = "spaceship.png"; // Replace with the actual path to your spaceship image

let bullets = [];
let invaders = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let highestScore = 0;
let startTime = null;


function drawSpaceship() {
    // ctx.fillStyle = spaceship.color;
    // ctx.fillRect(spaceship.x, spaceship.y, spaceship.width, spaceship.height);
    ctx.drawImage(spaceship.image, spaceship.x, spaceship.y, spaceship.width, spaceship.height);
}

function moveSpaceship(direction) {
    spaceship.x += direction * spaceship.dx;
    spaceship.x = Math.min(Math.max(spaceship.x, 0), canvas.width - spaceship.width);
}

function shootBullet() {
    let bullet = {
        x: spaceship.x + spaceship.width / 2 - 2.5,
        y: spaceship.y,
        width: 5,
        height: 10,
        dy: -5,
        color: "white"
    };
    bullets.push(bullet);
}

function spawnInvader() {
    let invader = {
        x: Math.random() * (canvas.width - 30),
        y: 0,
        width: 30,
        height: 30,
        dy: 2,
        color: "red"
    };
    invaders.push(invader);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           b.x < a.x + a.width &&
           a.y < b.y + b.height &&
           b.y < a.y + a.height;
}
function endGame() {
    gameOver = true;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 30);


    // Display highest score instead of the current score
    ctx.font = "24px Arial";
    ctx.fillText(`Highest Score: ${highestScore}`, canvas.width / 2, canvas.height / 2 + 20);
}




function startGame() {
    if (gameOver) {
        gameOver = false;
        score = 0;
        startTime = Date.now();
        invaders = [];
        bullets = [];
        update();
    }
}

function drawStartMessage() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("You can start the game by pressing 'Start Game'", canvas.width / 2, canvas.height / 2);
}

function update() {
    window.hitSoundPlayed = false;
    window.groundSoundPlayed = false;
    if (gameOver) return;
    // Timer logic
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000); // Calculate elapsed time in seconds
    const remainingTime = Math.max(0, 120 - elapsedTime); // Calculate remaining time in seconds

    if (remainingTime === 0) {
        endGame();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameStarted) {
        drawStartMessage(); // Display start message
        requestAnimationFrame(update);
        return;
    }
    
    bullets.forEach((bullet, bIndex) => {
        bullet.y += bullet.dy;
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        invaders.forEach((invader, iIndex) => {
            if (detectCollision(bullet, invader)) {
                bullets.splice(bIndex, 1);
                invaders.splice(iIndex, 1);
                score += 10;

                hitSound.currentTime = 0; // Reset audio time
                hitSound.play();
            }
        });

        if (bullet.y < 0) {
            bullets.splice(bIndex, 1);
        }
    });

    invaders.forEach((invader, index) => {
        invader.y += invader.dy;
        ctx.fillStyle = invader.color;
        ctx.fillRect(invader.x, invader.y, invader.width, invader.height);

        if (invader.y > canvas.height) {
            invaders.splice(index, 1);
            score -= 10;
            groundSound.play();
            if (score <= 0) {
                score = 0;
                endGame();
            }
        }
    });
    if (score > highestScore) {
        highestScore = score;
    }
    // Update score, highest score, and remaining time
    document.getElementById("currentScore").textContent = score;
    document.getElementById("highestScore").textContent = highestScore;
    document.getElementById("remainingTime").textContent = remainingTime;
    

    // if (!gameOver) {
    //     ctx.fillStyle = "white";
    //     ctx.font = "24px Arial";
    //     ctx.fillText(`Score: ${score}`, 10, 30);
    //     ctx.fillText(`Highest Score: ${highestScore}`, 10, 60);
    //     ctx.fillText(`Time: ${remainingTime} sec`, 10, 90); // Display remaining time
    // }

    drawSpaceship();
    requestAnimationFrame(update);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moveSpaceship(-1);
    if (event.key === "ArrowRight") moveSpaceship(1);
    if (event.key === " ") shootBullet();
});

document.getElementById("startButton").addEventListener("click", () => {
    startGame();
    gameStarted = true;
});

hitSound.addEventListener('play', () => {
    window.hitSoundPlayed = true;
  });
  
  groundSound.addEventListener('play', () => {
    window.groundSoundPlayed = true;
  });
  

setInterval(spawnInvader, 2000);
update();
startGame();


window.hitSound = document.getElementById("hitSound");
window.groundSound = document.getElementById("groundSound");

