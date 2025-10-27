<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Game from './game/main';

const gameCanvas = ref<HTMLCanvasElement | null>(null);

let gameInstance: InstanceType<typeof Game> | null = null;

onMounted(() => {
  if (gameCanvas.value) {
    const rect = gameCanvas.value.getBoundingClientRect();

    // Set the canvas's internal drawing buffer size to match.
    gameCanvas.value.width = rect.width;
    gameCanvas.value.height = rect.height;

    gameInstance = new Game(gameCanvas.value);
    gameInstance.start()

    window.addEventListener('resize', handleResize);
  }
});

function handleResize() {
  if (gameCanvas.value && gameInstance) {
    // On resize, update the buffer size again
    const rect = gameCanvas.value.getBoundingClientRect();
    gameCanvas.value.width = rect.width;
    gameCanvas.value.height = rect.height;

    if (gameInstance.tiles) {
      gameInstance.tiles.calculateTiles();
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
</template>

<style>
/* Define colors as CSS variables for easy use.
  (Modified: less luminance, less contrast)
*/
:root {
  --c-deep-forest: hsla(196, 40%, 7%, 1);
  --c-shadow: hsla(191, 50%, 6%, 1);
  --c-text-muted: hsla(185, 30%, 35%, 1);
  --c-text-bright: hsla(185, 30%, 45%, 1);
  --c-night-sky: hsla(0, 0%, 4%, 1);
}

/* Styles for this component. */
.header-content,
.main-content {
  width: 100%;
  max-width: 800px;
  /* You can adjust this max-width */
  box-sizing: border-box;
  border-radius: 8px;
  margin: 1rem 0;
  /* Add some spacing between elements */
}

.header-content {
  /* Use semantic variables from base.css */
  background-color: var(--color-background-mute);
  border: 1px solid var(--color-border);
  padding: 1.5rem 2rem;
  text-align: center;
}

.title {
  /* Use semantic variables from base.css */
  color: var(--color-heading);
  margin: 0 0 0.5rem 0;
}

.subtitle {
  /* Use semantic variables from base.css */
  color: var(--color-text);
  margin: 0;
  font-weight: 500;
}

.main-content {
  /* Use semantic variables from base.css */
  background-color: var(--color-background-soft);
  padding: 1rem;
  /* Padding to frame the canvas */
  border: 1px solid var(--color-border);
}

#game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  display: block;
  /* Removes extra space below canvas */
  border-radius: 4px;
  /* Soften the canvas corners */
  /* Use semantic variables from base.css */
  border: 2px solid var(--color-heading);
  box-sizing: border-box;
  /* Include border in size */
  image-rendering: crisp-edges;
}
</style>