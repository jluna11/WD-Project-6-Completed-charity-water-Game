// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let isCountdownRunning = false; // Keeps track of whether countdown is active
let dropMaker; // Will store our timer that creates drops regularly
let gameTimer; // Will store our countdown timer
let timeRemaining = 50; // Track remaining time (50 seconds)
let score = 0; // Track current score
let badDropsClicked = 0; // Track how many bad drops have been clicked

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", restartGame);
document.getElementById("loss-restart-btn").addEventListener("click", restartGame);
document.getElementById("victory-restart-btn").addEventListener("click", restartGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  timeRemaining = 50;
  score = 0;
  badDropsClicked = 0;
  
  // Update score display
  document.getElementById("score").textContent = score + "/50";
  document.getElementById("bad-score").textContent = badDropsClicked + "/3";
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

function getDropSpawnInterval() {
  // Spawn rate increases as score approaches 50
  // At score 0: 1000ms, At score 50: 300ms
  const baseInterval = 1000;
  const minInterval = 300;
  const speedup = (baseInterval - minInterval) * (score / 50);
  return Math.max(minInterval, baseInterval - speedup);
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
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 3 seconds (faster)
  drop.style.animationDuration = "3s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Add click handler to score points
  drop.addEventListener("click", () => {
    score++;
    document.getElementById("score").textContent = score + "/50";
    drop.remove();
    
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
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 3 seconds (faster)
  drop.style.animationDuration = "3s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Add click handler for bad drops - lose game on 3rd click
  drop.addEventListener("click", () => {
    badDropsClicked++;
    document.getElementById("bad-score").textContent = badDropsClicked + "/3";
    drop.remove();
    
    // Check if player has clicked 3 bad drops
    if (badDropsClicked >= 3) {
      endGameLoss();
    }
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}
