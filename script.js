let score = 0;
let timeLeft = 60;
let currentLevel = '하';
let correctAnswer = 0;
let gameActive = false;
let timerInterval;

const problemContainer = document.getElementById('problem-container');
const problemText = document.getElementById('problem-text');
const optionsContainer = document.querySelector('.options');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('level-display');
const finalScoreDisplay = document.getElementById('final-score');
const car = document.getElementById('player-car');
const track = document.querySelector('.track');

function showLevels() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('level-selection').style.display = 'flex';
}

function startGame(level) {
    currentLevel = level;
    score = 0;
    timeLeft = 60;
    gameActive = true;
    
    document.getElementById('level-selection').style.display = 'none';
    levelDisplay.innerText = currentLevel;
    scoreDisplay.innerText = score;
    timerDisplay.innerText = timeLeft;
    
    nextQuestion();
    startTimer();
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

function nextQuestion() {
    if (!gameActive) return;
    
    let divisor, dividend;
    
    if (currentLevel === '하') {
        divisor = Math.floor(Math.random() * 10) + 10; // 10-19
        correctAnswer = Math.floor(Math.random() * 15) + 2; // 2-16
    } else if (currentLevel === '중') {
        divisor = Math.floor(Math.random() * 30) + 20; // 20-49
        correctAnswer = Math.floor(Math.random() * 20) + 5; // 5-24
    } else {
        divisor = Math.floor(Math.random() * 50) + 50; // 50-99
        correctAnswer = Math.floor(Math.random() * 30) + 5; // 5-34
    }
    
    dividend = divisor * correctAnswer;
    
    // 4th grade division might have remainders, but for a game, clean division is often better for flow.
    // Let's add a small random remainder sometimes to make it harder at '상' level? 
    // No, let's keep it clean for now to avoid confusion during racing.
    
    problemText.innerText = `${dividend} ÷ ${divisor} = ?`;
    problemContainer.style.display = 'block';
    
    generateOptions(correctAnswer);
}

function generateOptions(correct) {
    const options = [correct];
    while (options.length < 4) {
        let wrong = correct + (Math.floor(Math.random() * 10) - 5);
        if (wrong > 0 && !options.includes(wrong)) {
            options.push(wrong);
        }
    }
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);
    
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach((btn, index) => {
        btn.innerText = options[index];
    });
}

function checkAnswer(btn) {
    if (!gameActive) return;
    
    const selected = parseInt(btn.innerText);
    if (selected === correctAnswer) {
        score += 10;
        scoreDisplay.innerText = score;
        showFeedback(true);
    } else {
        showFeedback(false);
        timeLeft = Math.max(0, timeLeft - 5);
    }
    
    problemContainer.style.display = 'none';
    setTimeout(nextQuestion, 1000);
}

function showFeedback(isCorrect) {
    const originalFilter = car.style.filter;
    if (isCorrect) {
        car.style.filter = 'drop-shadow(0 0 20px #00ff00) brightness(1.5)';
        track.style.animationDuration = '0.5s';
    } else {
        car.style.filter = 'drop-shadow(0 0 20px #ff0000) brightness(0.5)';
        track.style.animationDuration = '5s';
    }
    
    setTimeout(() => {
        car.style.filter = originalFilter;
        track.style.animationDuration = '2s';
    }, 1000);
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    problemContainer.style.display = 'none';
    finalScoreDisplay.innerText = score;
    document.getElementById('result-screen').style.display = 'flex';
}
