<script setup lang="ts">
// 1. Import shallowRef
import { ref, shallowRef, onMounted, watch } from 'vue';
import Game from './game/main';

const gameCanvas = ref<HTMLCanvasElement | null>(null);
const gameSpeed = ref(0.5);

// 2. Use shallowRef instead of ref
const gameInstance = shallowRef<InstanceType<typeof Game> | null>(null);

onMounted(() => {
  if (gameCanvas.value) {
    const rect = gameCanvas.value.getBoundingClientRect();

    gameCanvas.value.width = rect.width;
    gameCanvas.value.height = rect.height;

    // This code is all correct
    gameInstance.value = new Game(gameCanvas.value);

    if (gameInstance.value.frames && typeof gameInstance.value.frames.gameTick === 'number') {
      gameSpeed.value = gameInstance.value.frames.gameTick;
    }

    gameInstance.value.start()

    window.addEventListener('resize', handleResize);
  }
});

// This code is all correct
watch(gameSpeed, (newSpeed) => {
  if (gameInstance.value && gameInstance.value.frames) {
    gameInstance.value.frames.gameTick = newSpeed;
  }
});

// This code is all correct
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
  <div style="gap: 1rem;">
    <header class="header-content">
      <h1 class="title">
        Genetic Snakes
      </h1>
      <p class="subtitle">NFT Breeding & On-Chain High Scores</p>
    </header>

    <main class="main-content">
      <canvas id="game-canvas" ref="gameCanvas"></canvas>
    </main>
  </div>

  <div style="gap: 1rem;">
    <main class="main-content">
      <div class="controls-container">
        <label for="speed-slider">
          Game Speed: <strong>{{ gameSpeed.toFixed(2) }}</strong>
        </label>
        <input id="speed-slider" type="range" v-model.number="gameSpeed" min="0.05" max="1.5" step="0.01" />

        <div class="button-group">
          <button @click="gameInstance?.start()">Start</button>
          <button @click="gameInstance?.stop()">Stop</button>
          <button @click="gameInstance?.runWithNoDraw()">Run (No Draw)</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
/* (Your style code remains exactly the same) */
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
  margin: 1rem 0;
}

.header-content {
  background-color: var(--color-background-mute);
  border: 1px solid var(--color-border);
  padding: 1.5rem 2rem;
  text-align: center;
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
  gap: 0.5rem;
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
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
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
</style>