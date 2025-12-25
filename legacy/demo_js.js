#!/usr/bin/env node
/**
 * Demo Script for Binaural Beats JavaScript Library
 * Tương tự như demo.py nhưng bằng JavaScript
 * 
 * Chạy: node demo_js.js
 */

const binaural = require('./binaural.js');
const fs = require('fs');

// Tạo thư mục output
const outputDir = 'demo_outputs_js';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

console.log('='.repeat(60));
console.log('   🎧 BINAURAL BEATS LIBRARY - JAVASCRIPT DEMO 🎧');
console.log('='.repeat(60));
console.log();

/**
 * Demo 1: Binaural Beat - Alpha Wave (10Hz)
 */
function demo1_alphaBinaural() {
    console.log('🎵 Demo 1: Binaural Beat - Alpha Wave (10Hz)');
    console.log('   Mục đích: Thư giãn, calmness, visualization');

    const { left, right } = binaural.generateBinauralBeat(
        200,    // base frequency
        10,     // beat frequency (Alpha)
        10,     // duration (giây)
        44100,  // sample rate
        0.3,    // amplitude
        null,   // no carrier
        0.5,    // attack
        0.5     // decay
    );

    const filename = `${outputDir}/01_alpha_binaural_10hz.wav`;
    binaural.exportWavFile(filename, left, right, 44100);
    console.log();
}

/**
 * Demo 2: Theta Wave (6Hz) - Deep Meditation
 */
function demo2_thetaMeditation() {
    console.log('🧘 Demo 2: Binaural Beat - Theta Wave (6Hz)');
    console.log('   Mục đích: Deep meditation, creativity, relaxation');

    const { left, right } = binaural.generateBinauralBeat(
        150, 6, 15, 44100, 0.3, null, 1.0, 1.0
    );

    const filename = `${outputDir}/02_theta_meditation_6hz.wav`;
    binaural.exportWavFile(filename, left, right);
    console.log();
}

/**
 * Demo 3: Delta Wave (2Hz) - Deep Sleep
 */
function demo3_deltaSleep() {
    console.log('😴 Demo 3: Binaural Beat - Delta Wave (2Hz)');
    console.log('   Mục đích: Deep sleep, healing, unconscious mind');

    const { left, right } = binaural.generateBinauralBeat(
        100, 2, 20, 44100, 0.25, null, 2.0, 2.0
    );

    const filename = `${outputDir}/03_delta_sleep_2hz.wav`;
    binaural.exportWavFile(filename, left, right);
    console.log();
}

/**
 * Demo 4: Beta Wave (20Hz) - Focus
 */
function demo4_betaFocus() {
    console.log('🎯 Demo 4: Binaural Beat - Beta Wave (20Hz)');
    console.log('   Mục đích: Focus, concentration, alertness');

    const { left, right } = binaural.generateBinauralBeat(
        250, 20, 10, 44100, 0.3
    );

    const filename = `${outputDir}/04_beta_focus_20hz.wav`;
    binaural.exportWavFile(filename, left, right);
    console.log();
}

/**
 * Demo 5: Isochronic Tone
 */
function demo5_isochronic() {
    console.log('⚡ Demo 5: Isochronic Tone (10Hz pulse)');
    console.log('   Mục đích: Brainwave entrainment với âm xung');

    const tone = binaural.generateIsochronicTone(
        200,   // frequency
        10,    // pulse rate
        10,    // duration
        44100,
        0.3,
        0.5    // duty cycle
    );

    const filename = `${outputDir}/05_isochronic_10hz.wav`;
    binaural.exportMonoWavFile(filename, tone);
    console.log();
}

/**
 * Demo 6: Monaural Beat
 */
function demo6_monaural() {
    console.log('🔊 Demo 6: Monaural Beat');
    console.log('   Mục đích: Alternative to binaural beats');

    const beat = binaural.generateMonauralBeat(
        200, 210, 10, 44100, 0.3
    );

    const filename = `${outputDir}/06_monaural_beat.wav`;
    binaural.exportMonoWavFile(filename, beat);
    console.log();
}

/**
 * Demo 7: Solfeggio 528Hz (LA) - DNA Repair
 */
function demo7_solfeggio528() {
    console.log('✨ Demo 7: Solfeggio 528Hz (LA)');
    console.log('   Mục đích: DNA repair, transformation, miracles');

    const tone = binaural.generateSolfeggioTone(
        binaural.SolfeggioFrequency.LA,  // 528 Hz
        15, 44100, 0.3, 1.0, 1.0
    );

    const filename = `${outputDir}/07_solfeggio_528hz_LA.wav`;
    binaural.exportMonoWavFile(filename, tone);
    console.log();
}

/**
 * Demo 8: Solfeggio 432Hz (SOL) - Universal Harmony
 */
function demo8_solfeggio432() {
    console.log('🌌 Demo 8: Solfeggio 432Hz (SOL)');
    console.log('   Mục đích: Universal harmony, connection');

    const tone = binaural.generateSolfeggioTone(
        binaural.SolfeggioFrequency.SOL,  // 432 Hz
        15, 44100, 0.3, 1.0, 1.0
    );

    const filename = `${outputDir}/08_solfeggio_432hz_SOL.wav`;
    binaural.exportMonoWavFile(filename, tone);
    console.log();
}

/**
 * Demo 9: Solfeggio Binaural (528Hz + 7.83Hz Schumann)
 */
function demo9_solfeggioBinaural() {
    console.log('🌍 Demo 9: Solfeggio Binaural (528Hz + 7.83Hz)');
    console.log('   Mục đích: DNA repair + Earth\'s natural frequency');

    const { left, right } = binaural.generateSolfeggioBinaural(
        binaural.SolfeggioFrequency.LA,  // 528 Hz
        7.83,  // Schumann resonance
        20, 44100, 0.3, 1.5, 1.5
    );

    const filename = `${outputDir}/09_solfeggio_binaural_528_7.83.wav`;
    binaural.exportWavFile(filename, left, right);
    console.log();
}

/**
 * Demo 10: Mixed Solfeggio Frequencies
 */
function demo10_mixedSolfeggio() {
    console.log('🎼 Demo 10: Mixed Solfeggio Frequencies');
    console.log('   Mixing: UT (174Hz) + SOL (432Hz) + LA (528Hz)');

    const mixed = binaural.mixSolfeggioFrequencies(
        [
            binaural.SolfeggioFrequency.UT,   // 174 Hz
            binaural.SolfeggioFrequency.SOL,  // 432 Hz
            binaural.SolfeggioFrequency.LA    // 528 Hz
        ],
        20,  // duration
        [0.33, 0.33, 0.34],  // amplitudes
        44100,
        2.0, 2.0
    );

    const filename = `${outputDir}/10_mixed_solfeggio.wav`;
    binaural.exportMonoWavFile(filename, mixed);
    console.log();
}

// Chạy tất cả demos
console.log(`✅ Đã tạo thư mục ${outputDir}/\n`);

demo1_alphaBinaural();
demo2_thetaMeditation();
demo3_deltaSleep();
demo4_betaFocus();
demo5_isochronic();
demo6_monaural();
demo7_solfeggio528();
demo8_solfeggio432();
demo9_solfeggioBinaural();
demo10_mixedSolfeggio();

console.log('='.repeat(60));
console.log('✅ HOÀN THÀNH! Đã tạo 10 file audio demo (JavaScript)');
console.log('='.repeat(60));
console.log();
console.log(`📁 Tất cả file được lưu trong thư mục: ${outputDir}/`);
console.log();
console.log('🎧 Hướng dẫn nghe:');
console.log('   - Dùng TAI NGHE STEREO để nghe binaural beats');
console.log('   - Nghe ở nơi yên tĩnh');
console.log('   - Âm lượng vừa phải (không quá to)');
console.log('   - Thư giãn và tập trung vào âm thanh');
console.log();
console.log('⚠️  Lưu ý:');
console.log('   - Không nghe khi lái xe hoặc vận hành máy móc');
console.log('   - Không dùng nếu có tiền sử động kinh');
console.log('   - Ngưng nghe nếu cảm thấy khó chịu');
console.log();
