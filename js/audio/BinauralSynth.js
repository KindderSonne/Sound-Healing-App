/**
 * BinauralSynth.js
 * Core audio engine for generating binaural beats using Web Audio API Oscillators.
 * Optimized for "Infinite" duration and real-time frequency adjustment.
 */

export class BinauralSynth {
    constructor() {
        this.audioContext = null;
        this.leftOsc = null;
        this.rightOsc = null;
        this.gainNode = null;
        this.analyser = null;
        this.isPlaying = false;
        this.volume = 0.5;
    }

    /**
     * Initialize the audio context and nodes
     */
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.volume;

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;

            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        }
    }

    /**
     * Start playing binaural beats
     * @param {number} baseFreq - Base frequency in Hz
     * @param {number} beatFreq - Beat frequency in Hz
     */
    play(baseFreq, beatFreq) {
        this.init();

        if (this.isPlaying) {
            this.update(baseFreq, beatFreq);
            return;
        }

        // Create stereo separation using ChannelMerger
        const merger = this.audioContext.createChannelMerger(2);

        // Left Channel (Base Frequency)
        this.leftOsc = this.audioContext.createOscillator();
        this.leftOsc.type = 'sine';
        this.leftOsc.frequency.value = baseFreq;
        this.leftOsc.connect(merger, 0, 0);

        // Right Channel (Base + Beat Frequency)
        this.rightOsc = this.audioContext.createOscillator();
        this.rightOsc.type = 'sine';
        this.rightOsc.frequency.value = baseFreq + beatFreq;
        this.rightOsc.connect(merger, 0, 1);

        // Connect merger to gain
        merger.connect(this.gainNode);

        // Start oscillators
        const now = this.audioContext.currentTime;
        this.leftOsc.start(now);
        this.rightOsc.start(now);

        // Fade in
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(0, now);
        this.gainNode.gain.linearRampToValueAtTime(this.volume, now + 2); // 2s fade in

        this.isPlaying = true;
    }

    /**
     * Update frequencies in real-time
     * @param {number} baseFreq 
     * @param {number} beatFreq 
     */
    update(baseFreq, beatFreq) {
        if (!this.isPlaying) return;

        const now = this.audioContext.currentTime;
        // Smooth transition
        this.leftOsc.frequency.setTargetAtTime(baseFreq, now, 0.1);
        this.rightOsc.frequency.setTargetAtTime(baseFreq + beatFreq, now, 0.1);
    }

    /**
     * Stop playback with fade out
     */
    stop() {
        if (!this.isPlaying) return;

        const now = this.audioContext.currentTime;

        // Fade out
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(0, now + 2); // 2s fade out

        // Stop oscillators after fade
        setTimeout(() => {
            if (this.leftOsc) {
                this.leftOsc.stop();
                this.leftOsc.disconnect();
            }
            if (this.rightOsc) {
                this.rightOsc.stop();
                this.rightOsc.disconnect();
            }
            this.isPlaying = false;
        }, 2000);
    }

    /**
     * Set volume
     * @param {number} value - 0.0 to 1.0
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.gainNode) {
            this.gainNode.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.1);
        }
    }

    /**
     * Get analyser node for visualization
     * @returns {AnalyserNode}
     */
    getAnalyser() {
        return this.analyser;
    }
}
