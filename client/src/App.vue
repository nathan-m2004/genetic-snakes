<script setup lang="ts">
// 1. Import shallowRef
import { ref, shallowRef, onMounted, watch } from 'vue';
import Game from './game/main';

const gameCanvas = ref<HTMLCanvasElement | null>(null);
const gameSpeed = ref(0.5);

// New/updated refs for game controls
const noDraw = ref(false)
const showBest = ref(false)
const showBestCount = ref(1) // <-- Setting for how many to show

// --- New Refs for Game Stats ---
const liveBestScore = ref(0); // <-- Stat for the actual best score
const generation = ref(1);
// ------------------------------

// 2. Use shallowRef instead of ref
const gameInstance = shallowRef<InstanceType<typeof Game> | null>(null);

onMounted(() => {
  if (gameCanvas.value) {
    const rect = gameCanvas.value.getBoundingClientRect();

    gameCanvas.value.width = rect.width;
    gameCanvas.value.height = rect.height;

    gameInstance.value = new Game(gameCanvas.value);

    if (gameInstance.value.frames && typeof gameInstance.value.frames.gameTick === 'number') {
      gameSpeed.value = gameInstance.value.frames.gameTick;
    }

    // Set initial default value on game instance
    // @ts-ignore
    gameInstance.value.best_size = showBestCount.value;

    gameInstance.value.start()

    // --- New Stats Polling Loop ---
    function updateGameStats() {
      if (gameInstance.value) {
        // @ts-ignore
        // Renamed 'bestSize' to 'liveBestScore' and polling 'currentBestScore'
        // *** You may need to change 'currentBestScore' to your actual stat property name ***
        liveBestScore.value = gameInstance.value.currentBestScore || 0;
        // @ts-ignore
        generation.value = gameInstance.value.generation || 1;
      }
      requestAnimationFrame(updateGameStats); // Continue the loop
    }
    updateGameStats(); // Start the loop
    // ------------------------------

    window.addEventListener('resize', handleResize);
  }
});

// Watcher for Game Speed
watch(gameSpeed, (newSpeed) => {
  if (gameInstance.value && gameInstance.value.frames) {
    gameInstance.value.frames.gameTick = newSpeed;
  }
});

// Watcher for noDraw (Disable Rendering)
watch(noDraw, (value) => {
  if (gameInstance.value) {
    gameInstance.value.runNoDraw = value;
  }
});

// Watcher for showBest (the checkbox)
watch(showBest, (value) => {
  if (gameInstance.value) {
    // @ts-ignore
    gameInstance.value.showBest = value;
  }
});

// --- New Watcher for showBestCount (the number input) ---
watch(showBestCount, (value) => {
  if (gameInstance.value) {
    // @ts-ignore
    // Updates the 'best_size' setting on the game instance
    gameInstance.value.best_size = value;
  }
});
// --------------------------------------------------------

function handleResize() {
  if (gameCanvas.value && gameInstance.value) {
    const rect = gameCanvas.value.getBoundingClientRect();
    gameCanvas.value.width = rect.width;
    gameCanvas.value.height = rect.height;

    if (gameInstance.value.tiles) {
      gameInstance.value.tiles.calculateTiles();
    }
  }
}
</script>

<template>
  <div class="game-layout">

    <div class="game-column">
      <header class="header-content">
        <h1 class="title">
          Genetic Snakes
        </h1>
      </header>

      <main class="main-content">
        <canvas id="game-canvas" ref="gameCanvas"></canvas>
      </main>
    </div>

    <div class="controls-column">
      <main class="main-content">
        <div class="controls-container">

          <div class="button-group">
            <button @click="gameInstance?.start()">Start</button>
            <button @click="gameInstance?.stop()">Stop</button>
          </div>

          <hr class="divider" />

          <label for="speed-slider">
            Game Speed: <strong>{{ gameSpeed.toFixed(2) }}</strong>
          </label>
          <input id="speed-slider" type="range" v-model.number="gameSpeed" min="0.05" max="1.5" step="0.01" />

          <hr class="divider" />

          <div class="checkbox-group">
            <input id="no-draw-check" type="checkbox" v-model="noDraw" />
            <label for="no-draw-check">Disable Rendering (Fast-Forward)</label>
          </div>

          <div class="checkbox-group show-best-group">
            <input id="show-best-check" type="checkbox" v-model="showBest" />
            <label for="show-best-check">Show Best Snake(s)</label>
            <input type="number" v-model.number="showBestCount" min="1" :max="gameInstance?.POPULATION_SIZE || 50"
              class="small-number-input" :disabled="!showBest" />
          </div>
          <hr class="divider" />
          <div class="stats-group">
            <h3 class="group-title">Live Stats</h3>
            <div class="stat-item">
              <span>Generation:</span>
              <strong>{{ generation }}</strong>
            </div>
            <div class="stat-item">
              <span>Best Score:</span>
              <strong>{{ liveBestScore }}</strong>
            </div>
          </div>
          <hr class="divider" />
          <div class="stats-group">
            <h3 class="group-title">GA Parameters</h3>
            <div class="stat-item">
              <span>Population:</span>
              <strong>{{ gameInstance?.POPULATION_SIZE || 'N/A' }}</strong>
            </div>
            <div class="stat-item">
              <span>Tournament:</span>
              <strong>{{ gameInstance?.TOURNAMENT_SIZE || 'N/A' }}</strong>
            </div>
            <div class="stat-item">
              <span>Elitism:</span>
              <strong>{{ gameInstance?.ELITISM_SIZE || 'N/A' }}</strong>
            </div>
            <div class="stat-item">
              <span>Mutation Rate:</span>
              <strong>{{ gameInstance?.MUTATION_RATE || 'N/A' }}</strong>
            </div>
          </div>
        </div>
      </main>
    </div>

  </div>
</template>

<style>
/* (Your existing styles remain) */
:root {
  --c-deep-forest: hsla(196, 40%, 7%, 1);
  --c-shadow: hsla(191, 50%, 6%, 1);
  --c-text-muted: hsla(185, 30%, 35%, 1);
  --c-text-bright: hsla(185, 30%, 45%, 1);
  --c-night-sky: hsla(0, 0%, 4%, 1);
}

.header-content,
.main-content {
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
  border-radius: 8px;
}

.header-content {
  background-color: var(--color-background-mute);
  border: 1px solid var(--color-border);
  padding: 1.5rem 2rem;
  text-align: center;
  margin-bottom: 1rem;
}

.title {
  color: var(--color-heading);
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: var(--color-text);
  margin: 0;
  font-weight: 500;
}

.main-content {
  background-color: var(--color-background-soft);
  padding: 1rem;
  border: 1px solid var(--color-border);
}

#game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  display: block;
  border-radius: 4px;
  border: 2px solid var(--color-heading);
  box-sizing: border-box;
  image-rendering: crisp-edges;
}

.controls-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem;
}

.controls-container label {
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.9rem;
}

.controls-container input[type="range"] {
  width: 100%;
  cursor: pointer;
  margin-top: -0.5rem;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.button-group button {
  flex-grow: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-background-mute);
  color: var(--color-text);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.button-group button:hover {
  background-color: var(--color-border-hover);
}

/* --- LAYOUT STYLES --- */

.game-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}

.game-column {
  flex: 2;
  min-width: 320px;
}

.controls-column {
  flex: 1;
  min-width: 280px;
}

.divider {
  border: none;
  height: 1px;
  background-color: var(--color-border);
  margin: 0.25rem 0;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-group label {
  cursor: pointer;
  user-select: none;
}

.checkbox-group input[type="checkbox"] {
  cursor: pointer;
  width: 1rem;
  height: 1rem;
}

/* --- STATS STYLES --- */
.group-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--color-border);
}

.stats-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.stat-item span {
  color: var(--color-text);
}

.stat-item strong {
  color: var(--color-heading);
  font-weight: 600;
}

/* --- NEW STYLES for Number Input --- */
.show-best-group {
  justify-content: space-between;
}

.small-number-input {
  width: 4rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--color-background-mute);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 4px;
  font-weight: 500;
}

.small-number-input:disabled {
  background-color: var(--color-background-soft);
  color: var(--c-text-muted);
  cursor: not-allowed;
}
</style>