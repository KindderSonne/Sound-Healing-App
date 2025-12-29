/**
 * app.js
 * Main application controller.
 */

import { BinauralSynth } from './audio/BinauralSynth.js';
import { VisualRenderer } from './visual/VisualRenderer.js';
import { BreathGuide } from './ui/BreathGuide.js';
import { UIManager } from './ui/UIManager.js';

class App {
    constructor() {
        this.audio = new BinauralSynth();
        this.visual = new VisualRenderer('visual-container');
        this.breath = new BreathGuide('breath-guide');
        this.ui = new UIManager();

        this.isBreathingEnabled = false;
        this.currentMode = null; // 'guided' or 'focus'
    }

    formatDuration(seconds) {
        if (seconds < 60) return seconds + 's';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return secs > 0 ? `${mins}m${secs}s` : `${mins}m`;
    }

    init() {
        this.visual.init();

        // Setup shader change callback
        this.visual.onShaderChanged = (shaderName, shaderData) => {
            this.ui.generateShaderControls(shaderData, (key, value) => {
                this.visual.updateUniform(key, value);
            });
        };

        // Initialize controls for default shader
        this.visual.setShader('sunset');

        this.visual.start(); // Start visual loop immediately for background

        this.setupEventListeners();
        this.ui.showScreen('gateway');
    }

    setupEventListeners() {
        // Gateway Screen
        document.getElementById('btn-guided').addEventListener('click', () => {
            this.currentMode = 'guided';
            this.ui.showScreen('selection');
            document.getElementById('selection-guided').style.display = 'block';
            document.getElementById('selection-focus').style.display = 'none';
        });

        document.getElementById('btn-focus').addEventListener('click', () => {
            this.currentMode = 'focus';
            this.ui.showScreen('selection');
            document.getElementById('selection-guided').style.display = 'none';
            document.getElementById('selection-focus').style.display = 'flex';
        });

        document.getElementById('breath-toggle').addEventListener('change', (e) => {
            this.isBreathingEnabled = e.target.checked;
        });

        // Selection Screen Back Button
        document.getElementById('btn-back-selection').addEventListener('click', () => {
            this.ui.showScreen('gateway');
        });

        // Selection Screen (Focus Mode)
        document.getElementById('btn-enter-void').addEventListener('click', () => {
            this.startImmersion();
        });

        // Immersion Controls
        document.getElementById('btn-exit').addEventListener('click', () => {
            this.stopImmersion();
        });

        document.getElementById('btn-fullscreen').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

        // Real-time Controls
        document.getElementById('focus-hz').addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById('hz-display').textContent = val + ' Hz';
            if (this.audio.isPlaying) {
                const baseFreq = parseFloat(document.getElementById('base-hz').value);
                this.audio.update(baseFreq, val);
            }
        });

        // Base Frequency Control
        document.getElementById('base-hz').addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById('base-hz-display').textContent = val + ' Hz';
            if (this.audio.isPlaying) {
                const beatFreq = parseFloat(document.getElementById('focus-hz').value);
                this.audio.update(val, beatFreq);
            }
        });

        // Volume Control
        document.getElementById('volume').addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById('volume-display').textContent = val + '%';
            this.audio.setVolume(val / 100);
        });

        // Duration / Infinite Toggle
        document.getElementById('infinite-toggle').addEventListener('click', (e) => {
            const btn = e.target;
            const slider = document.getElementById('duration');
            const display = document.getElementById('duration-display');
            const hint = document.getElementById('duration-hint');

            btn.classList.toggle('active');
            const isInfinite = btn.classList.contains('active');

            if (isInfinite) {
                slider.disabled = true;
                slider.style.opacity = '0.3';
                hint.style.opacity = '0.3';
                display.textContent = '∞';
            } else {
                slider.disabled = false;
                slider.style.opacity = '1';
                hint.style.opacity = '1';
                display.textContent = this.formatDuration(parseInt(slider.value));
            }
        });

        document.getElementById('duration').addEventListener('input', (e) => {
            document.getElementById('duration-display').textContent = this.formatDuration(parseInt(e.target.value));
        });

        // Preview Button - Live audio while configuring
        document.getElementById('btn-preview').addEventListener('click', () => {
            const btn = document.getElementById('btn-preview');
            const playIcon = document.getElementById('preview-icon-play');
            const stopIcon = document.getElementById('preview-icon-stop');
            const previewText = document.getElementById('preview-text');
            const status = document.getElementById('preview-status');

            if (this.audio.isPlaying) {
                // Stop preview
                this.audio.stop();
                btn.classList.remove('playing');
                playIcon.style.display = 'block';
                stopIcon.style.display = 'none';
                previewText.textContent = 'Preview';
                status.textContent = '';
            } else {
                // Start preview
                const baseFreq = parseFloat(document.getElementById('base-hz').value);
                const beatFreq = parseFloat(document.getElementById('focus-hz').value);
                const volume = parseFloat(document.getElementById('volume').value) / 100;

                this.audio.setVolume(volume);
                this.audio.play(baseFreq, beatFreq);

                btn.classList.add('playing');
                playIcon.style.display = 'none';
                stopIcon.style.display = 'block';
                previewText.textContent = 'Stop';
                status.textContent = `Playing: ${baseFreq}Hz + ${beatFreq}Hz beat`;
            }
        });

        // Presets Selection
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Get preset values
                const baseFreq = parseFloat(e.currentTarget.dataset.base);
                const beatFreq = parseFloat(e.currentTarget.dataset.beat);

                // Update sliders
                document.getElementById('base-hz').value = baseFreq;
                document.getElementById('base-hz-display').textContent = baseFreq + ' Hz';
                document.getElementById('focus-hz').value = beatFreq;
                document.getElementById('hz-display').textContent = beatFreq + ' Hz';

                // Update audio if playing
                if (this.audio.isPlaying) {
                    this.audio.update(baseFreq, beatFreq);
                    document.getElementById('preview-status').textContent = `Playing: ${baseFreq}Hz + ${beatFreq}Hz beat`;
                }
            });
        });

        // Shader Selection
        document.querySelectorAll('.shader-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.shader-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const shader = e.currentTarget.dataset.shader;

                const iframe = document.getElementById('external-shader-frame');
                const visualContainer = document.getElementById('visual-container');
                const controlsContainer = document.getElementById('shader-controls');

                if (shader === 'rainForest') {
                    // Handle External Shader
                    this.visual.stop();
                    visualContainer.style.display = 'none';
                    iframe.style.display = 'block';
                    iframe.src = 'shaders/rain_forest_v3.html';

                    // Clear internal shader controls
                    controlsContainer.innerHTML = '<div style="color: #888; font-size: 0.8rem; text-align: center;">Interactive Mouse Control Enabled</div>';
                } else {
                    // Handle Internal Shader
                    iframe.style.display = 'none';
                    iframe.src = ''; // Unload iframe to save resources
                    visualContainer.style.display = 'block';

                    this.visual.setShader(shader);
                    this.visual.start();
                }
            });
        });
    }

    startImmersion() {
        this.ui.showScreen('immersion');
        this.ui.initIdleDetection();

        // Start Audio
        if (this.currentMode === 'focus') {
            const baseFreq = parseFloat(document.getElementById('base-hz').value);
            const beatFreq = parseFloat(document.getElementById('focus-hz').value);
            const volume = parseFloat(document.getElementById('volume').value) / 100;

            this.audio.setVolume(volume);
            this.audio.play(baseFreq, beatFreq);
        }

        // Start Breath
        if (this.isBreathingEnabled) {
            this.breath.setActive(true);
        }
    }

    stopImmersion() {
        this.audio.stop();
        this.breath.setActive(false);
        this.ui.showScreen('selection');

        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
