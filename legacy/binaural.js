/**
 * Binaural Beats Library - JavaScript Implementation
 * 
 * Port từ Python sang JavaScript với đầy đủ tính năng:
 * - Binaural beats generation
 * - Isochronic tones
 * - Monaural beats
 * - Solfeggio frequencies
 * - WAV file export
 * 
 * @author Converted from Python version by Ishan Oshada
 * @version 1.0.0
 */

/**
 * Solfeggio Frequency constants
 * Các tần số chữa lành Solfeggio
 */
const SolfeggioFrequency = {
    UT: 174,   // Healing - pain relief, tension reduction
    RE: 285,   // Restoring - tissue and organ repair
    MI: 396,   // Relieving - guilt, fear, grief transformation
    FA: 417,   // Broadening - trauma release, change facilitation
    SOL: 432,  // Connecting - universal harmony
    LA: 528,   // Energizing - DNA repair, harmony
    SI: 639,   // Balancing - relationships, cellular communication
    UT2: 741,  // Detoxing - cellular detox, mind cleansing
    RE2: 852   // Awakening - spiritual order, intuition
};

/**
 * Tạo mảng thời gian (time array) giống np.linspace
 * 
 * @param {number} start - Giá trị bắt đầu
 * @param {number} stop - Giá trị kết thúc
 * @param {number} num - Số lượng phần tử
 * @param {boolean} endpoint - Bao gồm endpoint không (mặc định false)
 * @returns {Float32Array} Mảng thời gian
 */
function linspace(start, stop, num, endpoint = false) {
    const arr = new Float32Array(num);
    const step = endpoint
        ? (stop - start) / (num - 1)
        : (stop - start) / num;

    for (let i = 0; i < num; i++) {
        arr[i] = start + (step * i);
    }
    return arr;
}

/**
 * Tạo sóng sine (sine wave)
 * 
 * Công thức: y(t) = amplitude × sin(2π × frequency × t)
 * 
 * @param {number} frequency - Tần số (Hz)
 * @param {number} duration - Thời lượng (giây)
 * @param {number} sampleRate - Sample rate (Hz), mặc định 44100
 * @param {number} amplitude - Biên độ (0.0 - 1.0), mặc định 1.0
 * @returns {Float32Array} Mảng samples của sine wave
 */
function generateSineWave(frequency, duration, sampleRate = 44100, amplitude = 1.0) {
    const numSamples = Math.floor(sampleRate * duration);
    const t = linspace(0, duration, numSamples, false);
    const wave = new Float32Array(numSamples);

    const twoPiF = 2.0 * Math.PI * frequency;

    for (let i = 0; i < numSamples; i++) {
        wave[i] = amplitude * Math.sin(twoPiF * t[i]);
    }

    return wave;
}

/**
 * Apply envelope (fade in/out) cho signal
 * 
 * Envelope structure:
 * - Attack: Fade in từ 0 lên 1
 * - Sustain: Giữ ở 1
 * - Decay: Fade out từ 1 về 0
 * 
 * @param {Float32Array} signal - Signal đầu vào
 * @param {number} attack - Thời gian attack (giây)
 * @param {number} decay - Thời gian decay (giây)
 * @param {number} sampleRate - Sample rate (Hz)
 * @returns {Float32Array} Signal đã apply envelope
 */
function applyEnvelope(signal, attack = 0.1, decay = 0.1, sampleRate = 44100) {
    const totalSamples = signal.length;
    const attackSamples = Math.floor(attack * sampleRate);
    const decaySamples = Math.floor(decay * sampleRate);

    const result = new Float32Array(totalSamples);

    // Copy original signal
    result.set(signal);

    // Attack phase (fade in)
    if (attackSamples > 0) {
        for (let i = 0; i < attackSamples && i < totalSamples; i++) {
            const envelope = i / attackSamples;  // 0 → 1
            result[i] *= envelope;
        }
    }

    // Decay phase (fade out)
    if (decaySamples > 0) {
        const startIdx = totalSamples - decaySamples;
        for (let i = 0; i < decaySamples && startIdx + i < totalSamples; i++) {
            const envelope = 1.0 - (i / decaySamples);  // 1 → 0
            result[startIdx + i] *= envelope;
        }
    }

    return result;
}

/**
 * Tạo binaural beat
 * 
 * Nguyên lý:
 * - Tai trái nghe tần số base_frequency
 * - Tai phải nghe tần số base_frequency + beat_frequency
 * - Não bộ phát hiện sự khác biệt và tạo ra beat ở beat_frequency
 * 
 * @param {number} baseFrequency - Tần số nền (Hz)
 * @param {number} beatFrequency - Tần số beat mong muốn (Hz)
 * @param {number} duration - Thời lượng (giây)
 * @param {number} sampleRate - Sample rate (Hz), mặc định 44100
 * @param {number} amplitude - Biên độ (0.0 - 1.0), mặc định 0.5
 * @param {number|null} carrierFrequency - Tần số carrier (optional)
 * @param {number} attack - Thời gian attack (giây)
 * @param {number} decay - Thời gian decay (giây)
 * @returns {{left: Float32Array, right: Float32Array}} Object chứa kênh trái và phải
 */
function generateBinauralBeat(
    baseFrequency,
    beatFrequency,
    duration,
    sampleRate = 44100,
    amplitude = 0.5,
    carrierFrequency = null,
    attack = 0.1,
    decay = 0.1
) {
    // Tính tần số cho 2 kênh
    const leftFreq = baseFrequency;
    const rightFreq = baseFrequency + beatFrequency;

    // Tạo sine wave cho mỗi kênh
    let leftChannel = generateSineWave(leftFreq, duration, sampleRate, amplitude);
    let rightChannel = generateSineWave(rightFreq, duration, sampleRate, amplitude);

    // Apply carrier frequency nếu có
    if (carrierFrequency !== null) {
        const carrier = generateSineWave(carrierFrequency, duration, sampleRate, 1.0);
        const numSamples = leftChannel.length;

        for (let i = 0; i < numSamples; i++) {
            leftChannel[i] *= carrier[i];
            rightChannel[i] *= carrier[i];
        }
    }

    // Apply envelope
    leftChannel = applyEnvelope(leftChannel, attack, decay, sampleRate);
    rightChannel = applyEnvelope(rightChannel, attack, decay, sampleRate);

    return { left: leftChannel, right: rightChannel };
}

/**
 * Tạo isochronic tone (âm xung)
 * 
 * Isochronic tone = sine wave được bật/tắt theo pattern
 * 
 * @param {number} frequency - Tần số của tone (Hz)
 * @param {number} pulseRate - Tốc độ pulse (Hz)
 * @param {number} duration - Thời lượng (giây)
 * @param {number} sampleRate - Sample rate (Hz)
 * @param {number} amplitude - Biên độ
 * @param {number} dutyCycle - Duty cycle (0.0 - 1.0), tỷ lệ on/off
 * @returns {Float32Array} Isochronic tone
 */
function generateIsochronicTone(
    frequency,
    pulseRate,
    duration,
    sampleRate = 44100,
    amplitude = 0.5,
    dutyCycle = 0.5
) {
    // Tạo base tone
    const tone = generateSineWave(frequency, duration, sampleRate, amplitude);

    // Tạo pulse pattern
    const numSamples = tone.length;
    const t = linspace(0, duration, numSamples, false);
    const pulsePeriod = 1.0 / pulseRate;

    const result = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
        const positionInCycle = t[i] % pulsePeriod;
        const isOn = positionInCycle < (pulsePeriod * dutyCycle);
        result[i] = isOn ? tone[i] : 0.0;
    }

    return result;
}

/**
 * Tạo monaural beat
 * 
 * Monaural beat = 2 tần số được trộn lại thành 1 kênh
 * Khác binaural: beat được nghe trực tiếp (vật lý), không phải do não tạo ra
 * 
 * @param {number} frequency1 - Tần số thứ nhất (Hz)
 * @param {number} frequency2 - Tần số thứ hai (Hz)
 * @param {number} duration - Thời lượng (giây)
 * @param {number} sampleRate - Sample rate (Hz)
 * @param {number} amplitude - Biên độ
 * @returns {Float32Array} Monaural beat
 */
function generateMonauralBeat(
    frequency1,
    frequency2,
    duration,
    sampleRate = 44100,
    amplitude = 0.5
) {
    const wave1 = generateSineWave(frequency1, duration, sampleRate, amplitude);
    const wave2 = generateSineWave(frequency2, duration, sampleRate, amplitude);

    const numSamples = wave1.length;
    const result = new Float32Array(numSamples);

    // Trộn 2 sóng và lấy trung bình
    for (let i = 0; i < numSamples; i++) {
        result[i] = (wave1[i] + wave2[i]) / 2.0;
    }

    return result;
}

/**
 * Tạo Solfeggio tone
 * 
 * @param {number} solfeggioFreq - Tần số Solfeggio (dùng SolfeggioFrequency constant)
 * @param {number} duration - Thời lượng (giây)
 * @param {number} sampleRate - Sample rate (Hz)
 * @param {number} amplitude - Biên độ
 * @param {number} attack - Attack time
 * @param {number} decay - Decay time
 * @returns {Float32Array} Solfeggio tone
 */
function generateSolfeggioTone(
    solfeggioFreq,
    duration,
    sampleRate = 44100,
    amplitude = 0.5,
    attack = 0.1,
    decay = 0.1
) {
    const signal = generateSineWave(solfeggioFreq, duration, sampleRate, amplitude);
    return applyEnvelope(signal, attack, decay, sampleRate);
}

/**
 * Tạo Solfeggio binaural beat
 * 
 * @param {number} solfeggioFreq - Tần số Solfeggio làm base
 * @param {number} beatFrequency - Beat frequency (Hz)
 * @param {number} duration - Thời lượng (giây)
 * @param {number} sampleRate - Sample rate (Hz)
 * @param {number} amplitude - Biên độ
 * @param {number} attack - Attack time
 * @param {number} decay - Decay time
 * @returns {{left: Float32Array, right: Float32Array}}
 */
function generateSolfeggioBinaural(
    solfeggioFreq,
    beatFrequency,
    duration,
    sampleRate = 44100,
    amplitude = 0.5,
    attack = 0.1,
    decay = 0.1
) {
    return generateBinauralBeat(
        solfeggioFreq,
        beatFrequency,
        duration,
        sampleRate,
        amplitude,
        null,
        attack,
        decay
    );
}

/**
 * Mix nhiều Solfeggio frequencies lại với nhau
 * 
 * @param {number[]} frequencies - Mảng các tần số Solfeggio
 * @param {number} duration - Thời lượng (giây)
 * @param {number[]|null} amplitudes - Mảng amplitudes (null = equal mix)
 * @param {number} sampleRate - Sample rate (Hz)
 * @param {number} attack - Attack time
 * @param {number} decay - Decay time
 * @returns {Float32Array} Mixed signal
 */
function mixSolfeggioFrequencies(
    frequencies,
    duration,
    amplitudes = null,
    sampleRate = 44100,
    attack = 0.1,
    decay = 0.1
) {
    // Nếu không có amplitudes, dùng equal mix
    if (amplitudes === null) {
        const amp = 1.0 / frequencies.length;
        amplitudes = new Array(frequencies.length).fill(amp);
    }

    if (frequencies.length !== amplitudes.length) {
        throw new Error('Number of frequencies must match number of amplitudes');
    }

    const numSamples = Math.floor(sampleRate * duration);
    const mixed = new Float32Array(numSamples);

    // Tạo và mix mỗi tần số
    for (let i = 0; i < frequencies.length; i++) {
        const tone = generateSineWave(frequencies[i], duration, sampleRate, amplitudes[i]);
        for (let j = 0; j < numSamples; j++) {
            mixed[j] += tone[j];
        }
    }

    // Apply envelope cho toàn bộ mixed signal
    return applyEnvelope(mixed, attack, decay, sampleRate);
}

/**
 * Convert Float32Array sang Int16Array cho WAV file
 * 
 * @param {Float32Array} float32Array - Audio data trong range [-1.0, 1.0]
 * @returns {Int16Array} Audio data trong range [-32768, 32767]
 */
function float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
}

/**
 * Tạo WAV file header
 * 
 * @param {number} numChannels - Số kênh (1=mono, 2=stereo)
 * @param {number} sampleRate - Sample rate (Hz)
 * @param {number} numSamples - Tổng số samples
 * @returns {ArrayBuffer} WAV header
 */
function createWavHeader(numChannels, sampleRate, numSamples) {
    const bytesPerSample = 2;  // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * numChannels * bytesPerSample;

    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);  // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true);   // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);  // BitsPerSample

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    return buffer;
}

/**
 * Helper function để write string vào DataView
 */
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * Export binaural beat sang WAV file (Node.js)
 * 
 * @param {string} filename - Tên file output
 * @param {Float32Array} leftChannel - Kênh trái
 * @param {Float32Array} rightChannel - Kênh phải
 * @param {number} sampleRate - Sample rate (Hz)
 */
function exportWavFile(filename, leftChannel, rightChannel, sampleRate = 44100) {
    const numSamples = leftChannel.length;

    // Convert sang Int16
    const leftInt16 = float32ToInt16(leftChannel);
    const rightInt16 = float32ToInt16(rightChannel);

    // Tạo header
    const header = createWavHeader(2, sampleRate, numSamples);

    // Tạo interleaved stereo data
    const data = new Int16Array(numSamples * 2);
    for (let i = 0; i < numSamples; i++) {
        data[i * 2] = leftInt16[i];      // Left
        data[i * 2 + 1] = rightInt16[i]; // Right
    }

    // Combine header + data
    const wavBuffer = new Uint8Array(header.byteLength + data.byteLength);
    wavBuffer.set(new Uint8Array(header), 0);
    wavBuffer.set(new Uint8Array(data.buffer), header.byteLength);

    // Save file (Node.js)
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        fs.writeFileSync(filename, wavBuffer);
        console.log(`✓ Saved: ${filename}`);
    }

    return wavBuffer;
}

/**
 * Export mono signal sang WAV file
 * 
 * @param {string} filename - Tên file output
 * @param {Float32Array} signal - Mono signal
 * @param {number} sampleRate - Sample rate (Hz)
 */
function exportMonoWavFile(filename, signal, sampleRate = 44100) {
    const numSamples = signal.length;
    const signalInt16 = float32ToInt16(signal);

    const header = createWavHeader(1, sampleRate, numSamples);
    const wavBuffer = new Uint8Array(header.byteLength + signalInt16.byteLength);
    wavBuffer.set(new Uint8Array(header), 0);
    wavBuffer.set(new Uint8Array(signalInt16.buffer), header.byteLength);

    if (typeof require !== 'undefined') {
        const fs = require('fs');
        fs.writeFileSync(filename, wavBuffer);
        console.log(`✓ Saved: ${filename}`);
    }

    return wavBuffer;
}

// Export cho Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SolfeggioFrequency,
        generateSineWave,
        applyEnvelope,
        generateBinauralBeat,
        generateIsochronicTone,
        generateMonauralBeat,
        generateSolfeggioTone,
        generateSolfeggioBinaural,
        mixSolfeggioFrequencies,
        exportWavFile,
        exportMonoWavFile
    };
}
