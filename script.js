let score = 0;
let timeLeft = 180;
let currentLevel = '하';
let correctAnswer = 0;
let gameActive = false;
let timerInterval;
let gameLoop;
let lanes = [10, 35, 60, 85]; // Lane positions in %
let currentLane = 1; // Start in the second lane
let objects = []; // Active answer gates

const car = document.getElementById('player-car');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('level-display');
const finalScoreDisplay = document.getElementById('final-score');
const gameContainer = document.getElementById('game-container');
const problemText = document.getElementById('problem-text');

// Key controls
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    if (e.key === 'ArrowLeft' && currentLane > 0) {
        currentLane--;
        updateCarPosition();
    } else if (e.key === 'ArrowRight' && currentLane < 3) {
        currentLane++;
        updateCarPosition();
    }
});

// Touch controls for tablets
gameContainer.addEventListener('touchstart', (e) => {
    if (!gameActive) return;
    const touchX = e.touches[0].clientX;
    const screenMid = window.innerWidth / 2;
    if (touchX < screenMid && currentLane > 0) {
        currentLane--;
    } else if (touchX >= screenMid && currentLane < 3) {
        currentLane++;
    }
    updateCarPosition();
});

function updateCarPosition() {
    car.style.left = lanes[currentLane] + '%';
}

function showLevels() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('level-selection').style.display = 'flex';
}

function startGame(level) {
    currentLevel = level;
    score = 0;
    timeLeft = 180;
    gameActive = true;
    objects = [];
    currentLane = 1;
    updateCarPosition();
    
    document.getElementById('level-selection').style.display = 'none';
    levelDisplay.innerText = currentLevel;
    scoreDisplay.innerText = score;
    timerDisplay.innerText = timeLeft;
    
    startTimer();
    spawnProblem();
    runGameLoop();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function spawnProblem() {
    if (!gameActive) return;

    let divisor, dividend;
    if (currentLevel === '하') {
        divisor = Math.floor(Math.random() * 10) + 10;
        correctAnswer = Math.floor(Math.random() * 15) + 2;
    } else if (currentLevel === '중') {
        divisor = Math.floor(Math.random() * 30) + 20;
        correctAnswer = Math.floor(Math.random() * 20) + 5;
    } else {
        divisor = Math.floor(Math.random() * 50) + 50;
        correctAnswer = Math.floor(Math.random() * 30) + 5;
    }
    dividend = divisor * correctAnswer;
    
    problemText.innerText = `${dividend} ÷ ${divisor} = ?`;
    
    // Create answer gates
    const options = [correctAnswer];
    while (options.length < 4) {
        let wrong = correctAnswer + (Math.floor(Math.random() * 10) - 5);
        if (wrong > 0 && !options.includes(wrong) && wrong !== correctAnswer) {
            options.push(wrong);
        }
    }
    options.sort(() => Math.random() - 0.5);

    const gateGroup = {
        y: -100,
        answered: false,
        elements: []
    };

    options.forEach((val, i) => {
        const gate = document.createElement('div');
        gate.className = 'gate';
        gate.innerText = val;
        gate.style.left = lanes[i] + '%';
        gate.style.top = '-100px';
        gameContainer.appendChild(gate);
        gateGroup.elements.push({ el: gate, value: val, lane: i });
    });

    objects.push(gateGroup);
}

function runGameLoop() {
    if (!gameActive) return;

    objects.forEach((group, groupIndex) => {
        group.y += (currentLevel === '상' ? 1.5 : (currentLevel === '중' ? 1.0 : 0.5));
        
        group.elements.forEach(gateObj => {
            gateObj.el.style.top = group.y + 'px';
        });

        // Collision Check
        const carY = car.offsetTop;
        if (!group.answered && group.y > carY - 50 && group.y < carY + 50) {
            const hitGate = group.elements.find(g => g.lane === currentLane);
            if (hitGate) {
                group.answered = true;
                if (hitGate.value === correctAnswer) {
                    score += 10;
                    scoreDisplay.innerText = score;
                    showFeedback(true);
                } else {
                    timeLeft = Math.max(0, timeLeft - 5);
                    showFeedback(false);
                }
                
                // Remove gates after a short delay
                setTimeout(() => {
                    group.elements.forEach(g => g.el.remove());
                    objects.splice(groupIndex, 1);
                    spawnProblem();
                }, 500);
            }
        }

        // Remove if off screen
        if (group.y > window.innerHeight) {
            group.elements.forEach(g => g.el.remove());
            objects.splice(groupIndex, 1);
            spawnProblem();
        }
    });

    gameLoop = requestAnimationFrame(runGameLoop);
}

function showFeedback(isCorrect) {
    const originalFilter = car.style.filter;
    if (isCorrect) {
        car.style.filter = 'drop-shadow(0 0 20px #00ff00) brightness(1.5)';
    } else {
        car.style.filter = 'drop-shadow(0 0 20px #ff0000) brightness(0.5)';
    }
    
    setTimeout(() => {
        car.style.filter = originalFilter;
    }, 1000);
}

function endGame() {
    gameActive = false;
    cancelAnimationFrame(gameLoop);
    clearInterval(timerInterval);
    objects.forEach(group => group.elements.forEach(g => g.el.remove()));
    finalScoreDisplay.innerText = score;
    document.getElementById('result-screen').style.display = 'flex';
}
