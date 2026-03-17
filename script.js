// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let isCountdownRunning = false; // Keeps track of whether countdown is active
let dropMaker; // Will store our timer that creates drops regularly
let gameTimer; // Will store our countdown timer
let timeRemaining = 50; // Track remaining time (50 seconds)
let score = 0; // Track current score
let badDropsClicked = 0; // Track how many bad drops have been clicked
let milestoneTimeout;

// Audio effects
const splashSound = new Audio('Water_Splash.mp3');
const failSound = new Audio('Fail.mp3');
const victorySound = new Audio('Winner.mp3');
const lostSound = new Audio('Game_Lost.mp3');
const goSound = new Audio('Go!.mp3');
const buttonClickSound = new Audio('Button_Click.mp3');

// Difficulty settings
let selectedDifficulty = 'Easy';
let maxBadDrops = 3;
let timePerGame = 50;
let dropSpeedMultiplier = 1;

function setDifficulty(mode) {
  selectedDifficulty = mode;
  document.getElementById('easy-btn').classList.remove('selected');
  document.getElementById('medium-btn').classList.remove('selected');
  document.getElementById('hard-btn').classList.remove('selected');
  const btn = document.getElementById(mode.toLowerCase() + '-btn');
  btn.classList.add('selected');

  if (mode === 'Easy') {
    maxBadDrops = 3;
    timePerGame = 50;
    dropSpeedMultiplier = 1;
  } else if (mode === 'Medium') {
    maxBadDrops = 2;
    timePerGame = 45;
    dropSpeedMultiplier = 1.3;
  } else if (mode === 'Hard') {
    maxBadDrops = 1;
    timePerGame = 40;
    dropSpeedMultiplier = 1.7;
  }
}

// set default difficulty and button wiring
setDifficulty('Easy');
document.getElementById('easy-btn').addEventListener('click', () => { buttonClickSound.currentTime = 0; buttonClickSound.play(); setDifficulty('Easy'); });
document.getElementById('medium-btn').addEventListener('click', () => { buttonClickSound.currentTime = 0; buttonClickSound.play(); setDifficulty('Medium'); });
document.getElementById('hard-btn').addEventListener('click', () => { buttonClickSound.currentTime = 0; buttonClickSound.play(); setDifficulty('Hard'); });

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", restartGame);
document.getElementById("loss-restart-btn").addEventListener("click", restartGame);
document.getElementById("victory-restart-btn").addEventListener("click", restartGame);

function startGame() {
  // Play click sound when pressing start
  buttonClickSound.currentTime = 0;
  buttonClickSound.play();

  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  timeRemaining = timePerGame;
  score = 0;
  badDropsClicked = 0;
  
  // Update score display
  document.getElementById("score").textContent = score + "/50";
  document.getElementById("bad-score").textContent = badDropsClicked + "/" + maxBadDrops;
  document.getElementById("time").textContent = timeRemaining;
  
  // Hide the modals if visible
  document.getElementById("game-over-modal").style.display = "none";
  document.getElementById("loss-modal").style.display = "none";
  document.getElementById("victory-modal").style.display = "none";
  document.getElementById("start-btn").style.display = "none";

  // Show countdown overlay
  showCountdown();
}

function showCountdown() {
  // Clear any existing intervals to ensure clean state
  clearInterval(dropMaker);
  clearInterval(gameTimer);
  isCountdownRunning = true;
  
  const countdownOverlay = document.getElementById("countdown-overlay");
  const countdownText = document.getElementById("countdown-text");
  countdownOverlay.style.display = "flex";
  
  let count = 3;
  countdownText.textContent = count;
  
  const countdownTimer = setInterval(() => {
    count--;
    if (count > 0) {
      countdownText.textContent = count;
    } else {
      countdownText.textContent = "Go!";
      goSound.currentTime = 0;
      goSound.play();
      setTimeout(() => {
        countdownOverlay.style.display = "none";
        isCountdownRunning = false;
        // Start the actual game after countdown
        createDrop();
        dropMaker = setInterval(createDrop, 1000);
        gameTimer = setInterval(updateTimer, 1000);
      }, 1000);
      clearInterval(countdownTimer);
    }
  }, 1000);
}

function showMilestoneMessage(message) {
  const toast = document.getElementById("milestone-toast");
  clearTimeout(milestoneTimeout);
  toast.textContent = message;
  toast.style.display = "block";
  milestoneTimeout = setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

function getDropSpawnInterval() {
  // Spawn rate increases as score approaches 50
  // At score 0: 1000ms, At score 50: 300ms
  const baseInterval = 1000;
  const minInterval = 300;
  const speedup = (baseInterval - minInterval) * (score / 50);
  const interval = Math.max(minInterval, baseInterval - speedup);
  return Math.max(120, interval / dropSpeedMultiplier);
}

function getBadDropProbability() {
  // Increased base probability and steeper curve for more bad drops
  // At score 0-10: 15%, At score 50: 50%
  if (score < 10) return 0.15;
  if (score < 20) return 0.2;
  if (score < 30) return 0.3;
  if (score < 40) return 0.4;
  return 0.5;
}

function updateTimer() {
  timeRemaining--;
  document.getElementById("time").textContent = timeRemaining;
  
  if (timeRemaining <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(gameTimer);
  
  // Remove all remaining drops from the game
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());
  
  // Show game over modal
  document.getElementById("game-over-modal").style.display = "flex";
  document.getElementById("start-btn").style.display = "block";
}

function restartGame() {
  startGame();
}

function endGameVictory() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(gameTimer);
  
  // Remove all remaining drops from the game
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());
  
  // Play victory sound once
  victorySound.currentTime = 0;
  victorySound.play();

  // Show victory modal
  document.getElementById("victory-modal").style.display = "flex";
  document.getElementById("start-btn").style.display = "block";
}

function endGameLoss() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(gameTimer);
  
  // Remove all remaining drops from the game
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());
  
  // Show loss modal
  document.getElementById("loss-modal").style.display = "flex";
  document.getElementById("start-btn").style.display = "block";
}

function createDrop() {
  // don't spawn new drops if game has ended or countdown is running
  if (!gameRunning || isCountdownRunning) return;

  // Randomly decide if this is a bad drop based on current score
  const isBadDrop = Math.random() < getBadDropProbability();
  
  if (isBadDrop) {
    createBadDrop();
  } else {
    createGoodDrop();
  }
  
  // Update spawn rate and restart interval
  clearInterval(dropMaker);
  const newInterval = getDropSpawnInterval();
  dropMaker = setInterval(createDrop, newInterval);
}

function createGoodDrop() {
  // Create a new img element that will be our water drop
  const drop = document.createElement("img");
  drop.className = "water-drop";
  drop.src = "Clean_Water.png";
  drop.alt = "water drop";

  // Make drops different sizes for visual variety
  const initialSize = 88;
  const sizeMultiplier = Math.random() * 0.7 + 0.7;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;
  drop.style.padding = '4px';

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 3 seconds (faster based on difficulty)
  drop.style.animationDuration = (3 / dropSpeedMultiplier).toFixed(2) + "s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Add click handler to score points
  drop.addEventListener("click", () => {
    score++;
    splashSound.currentTime = 0;
    splashSound.play();
    document.getElementById("score").textContent = score + "/50";
    drop.remove();
    
    // Show milestone messages for 10, 25, and 40
    if (score === 10) {
      showMilestoneMessage("10 so far! Keep going!");
    } else if (score === 25) {
      showMilestoneMessage("25! Halfway there!");
    } else if (score === 40) {
      showMilestoneMessage("40/50! Ten more!");
    }

    // Check if player has reached 50 points
    if (score >= 50) {
      endGameVictory();
    }
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

function createBadDrop() {
  // Create a new img element that will be our bad water drop
  const drop = document.createElement("img");
  drop.className = "water-drop bad-drop";
  drop.src = "Dirty_Water.png";
  drop.alt = "bad water drop";

  // Make drops different sizes for visual variety
  const initialSize = 88;
  const sizeMultiplier = Math.random() * 0.7 + 0.7;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;
  drop.style.padding = '4px';

  // Position the drop randomly across the game width
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 3 seconds (faster based on difficulty)
  drop.style.animationDuration = (3 / dropSpeedMultiplier).toFixed(2) + "s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Add click handler for bad drops - lose game on 3rd click
  drop.addEventListener("click", () => {
    badDropsClicked++;
    failSound.currentTime = 0;
    failSound.play();
    document.getElementById("bad-score").textContent = badDropsClicked + "/" + maxBadDrops;
    drop.remove();
    
    // Check if player has reached max bad drops
    if (badDropsClicked >= maxBadDrops) {
      lostSound.currentTime = 0;
      lostSound.play();
      endGameLoss();
    }
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}
