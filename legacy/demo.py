#!/usr/bin/env python3
"""
Demo Script cho Binaural Library
Tạo các loại âm thanh binaural beats khác nhau
"""

import numpy as np
import scipy.io.wavfile as wavfile
from binaural import (
    generate_binaural_beat,
    generate_isochronic_tone,
    generate_monaural_beat,
    generate_solfeggio_tone,
    generate_solfeggio_binaural,
    mix_solfeggio_frequencies,
    SolfeggioFrequency
)

def create_output_folder():
    """Tạo thư mục output để lưu file audio"""
    import os
    os.makedirs("demo_outputs", exist_ok=True)
    print("✅ Đã tạo thư mục demo_outputs/\n")

def demo_1_basic_binaural_beat():
    """Demo 1: Binaural Beat cơ bản - Alpha wave (10Hz) cho thư giãn"""
    print("🎵 Demo 1: Binaural Beat - Alpha Wave (10Hz)")
    print("   Mục đích: Thư giãn, calmness, visualization")
    
    left, right = generate_binaural_beat(
        base_frequency=200,    # Tần số nền 200Hz
        beat_frequency=10,     # Beat 10Hz (Alpha wave)
        duration=10,           # 10 giây
        amplitude=0.3,         # Âm lượng vừa phải
        attack=0.5,           # Fade in 0.5s
        decay=0.5             # Fade out 0.5s
    )
    
    # Ghép 2 kênh stereo
    stereo = np.vstack((left, right)).T
    stereo = np.int16(stereo * 32767)  # Convert sang int16
    
    filename = "demo_outputs/01_alpha_binaural_10hz.wav"
    wavfile.write(filename, 44100, stereo)
    print(f"   ✓ Đã lưu: {filename}\n")

def demo_2_theta_meditation():
    """Demo 2: Theta Wave (6Hz) cho thiền sâu"""
    print("🧘 Demo 2: Binaural Beat - Theta Wave (6Hz)")
    print("   Mục đích: Deep meditation, creativity, relaxation")
    
    left, right = generate_binaural_beat(
        base_frequency=150,
        beat_frequency=6,      # Theta wave
        duration=15,
        amplitude=0.3,
        attack=1.0,
        decay=1.0
    )
    
    stereo = np.vstack((left, right)).T
    stereo = np.int16(stereo * 32767)
    
    filename = "demo_outputs/02_theta_meditation_6hz.wav"
    wavfile.write(filename, 44100, stereo)
    print(f"   ✓ Đã lưu: {filename}\n")

def demo_3_delta_deep_sleep():
    """Demo 3: Delta Wave (2Hz) cho giấc ngủ sâu"""
    print("😴 Demo 3: Binaural Beat - Delta Wave (2Hz)")
    print("   Mục đích: Deep sleep, healing, unconscious mind")
    
    left, right = generate_binaural_beat(
        base_frequency=100,
        beat_frequency=2,      # Delta wave
        duration=20,
        amplitude=0.25,
        attack=2.0,
        decay=2.0
    )
    
    stereo = np.vstack((left, right)).T
    stereo = np.int16(stereo * 32767)
    
    filename = "demo_outputs/03_delta_sleep_2hz.wav"
    wavfile.write(filename, 44100, stereo)
    print(f"   ✓ Đã lưu: {filename}\n")

def demo_4_beta_focus():
    """Demo 4: Beta Wave (20Hz) cho tập trung"""
    print("🎯 Demo 4: Binaural Beat - Beta Wave (20Hz)")
    print("   Mục đích: Focus, concentration, alertness")
    
    left, right = generate_binaural_beat(
        base_frequency=250,
        beat_frequency=20,     # Beta wave
        duration=10,
        amplitude=0.3
    )
    
    stereo = np.vstack((left, right)).T
    stereo = np.int16(stereo * 32767)
    
    filename = "demo_outputs/04_beta_focus_20hz.wav"
    wavfile.write(filename, 44100, stereo)
    print(f"   ✓ Đã lưu: {filename}\n")

def demo_5_isochronic_tone():
    """Demo 5: Isochronic Tone - Pulsing sound"""
    print("⚡ Demo 5: Isochronic Tone (10Hz pulse)")
    print("   Mục đích: Brainwave entrainment với âm xung")
    
    tone = generate_isochronic_tone(
        frequency=200,
        pulse_rate=10,         # 10 pulses per second
        duration=10,
        amplitude=0.3,
        duty_cycle=0.5         # 50% on, 50% off
    )
    
    # Isochronic tone là mono, convert sang stereo
    stereo = np.vstack((tone, tone)).T
    stereo = np.int16(stereo * 32767)
    
    filename = "demo_outputs/05_isochronic_10hz.wav"
    wavfile.write(filename, 44100, stereo)
    print(f"   ✓ Đã lưu: {filename}\n")

def demo_6_monaural_beat():
    """Demo 6: Monaural Beat - Amplitude modulation"""
    print("🔊 Demo 6: Monaural Beat")
    print("   Mục đích: Alternative to binaural beats")
    
    beat = generate_monaural_beat(
        frequency1=200,
        frequency2=210,        # 10Hz difference
        duration=10,
        amplitude=0.3
    )
    
    # Monaural cũng là mono, convert sang stereo
    stereo = np.vstack((beat, beat)).T
    stereo = np.int16(stereo * 32767)
    
    filename = "demo_outputs/06_monaural_beat.wav"
    wavfile.write(filename, 44100, stereo)
    print(f"   ✓ Đã lưu: {filename}\n")

def demo_7_solfeggio_528hz():
    """Demo 7: Solfeggio Frequency 528Hz (LA) - DNA Repair"""
    print("✨ Demo 7: Solfeggio 528Hz (LA)")
    print("   Mục đích: DNA repair, transformation, miracles")
    
    tone = generate_solfeggio_tone(
        frequency=SolfeggioFrequency.LA,  # 528 Hz
        duration=15,
        amplitude=0.3,
        attack=1.0,
        decay=1.0
    )
    
    stereo = np.vstack((tone, tone)).T
    stereo = np.int16(stereo * 32767)
    
    filename = "demo_outputs/07_solfeggio_528hz_LA.wav"
    wavfile.write(filename, 44100, stereo)
    print(f"   ✓ Đã lưu: {filename}\n")

def demo_8_solfeggio_432hz():
    """Demo 8: Solfeggio 432Hz (SOL) - Universal Harmony"""
    print("🌌 Demo 8: Solfeggio 432Hz (SOL)")
    print("   Mục đích: Universal harmony, connection")
    
    tone = generate_solfeggio_tone(
        frequency=SolfeggioFrequency.SOL,  # 432 Hz
        duration=15,
        amplitude=0.3,
        attack=1.0,
        decay=1.0
    )
    
    stereo = np.vstack((tone, tone)).T
    stereo = np.int16(stereo * 32767)
    
    filename = "demo_outputs/08_solfeggio_432hz_SOL.wav"
    wavfile.write(filename, 44100, stereo)
    print(f"   ✓ Đã lưu: {filename}\n")

def demo_9_solfeggio_binaural():
    """Demo 9: Solfeggio Binaural - 528Hz + Schumann Resonance (7.83Hz)"""
    print("🌍 Demo 9: Solfeggio Binaural (528Hz + 7.83Hz)")
    print("   Mục đích: DNA repair + Earth's natural frequency")
    
    left, right = generate_solfeggio_binaural(
        solfeggio_freq=SolfeggioFrequency.LA,  # 528 Hz
        beat_frequency=7.83,  # Schumann resonance
        duration=20,
        amplitude=0.3,
        attack=1.5,
        decay=1.5
    )
    
    stereo = np.vstack((left, right)).T
    stereo = np.int16(stereo * 32767)
    
    filename = "demo_outputs/09_solfeggio_binaural_528_7.83.wav"
    wavfile.write(filename, 44100, stereo)
    print(f"   ✓ Đã lưu: {filename}\n")

def demo_10_mixed_solfeggio():
    """Demo 10: Mix nhiều Solfeggio Frequencies"""
    print("🎼 Demo 10: Mixed Solfeggio Frequencies")
    print("   Mixing: UT (174Hz) + SOL (432Hz) + LA (528Hz)")
    
    mixed = mix_solfeggio_frequencies(
        frequencies=[
            SolfeggioFrequency.UT,   # 174 Hz - Healing
            SolfeggioFrequency.SOL,  # 432 Hz - Harmony
            SolfeggioFrequency.LA    # 528 Hz - DNA repair
        ],
        duration=20,
        amplitudes=[0.33, 0.33, 0.34],  # Equal mix
        attack=2.0,
        decay=2.0
    )
    
    stereo = np.vstack((mixed, mixed)).T
    stereo = np.int16(stereo * 32767)
    
    filename = "demo_outputs/10_mixed_solfeggio.wav"
    wavfile.write(filename, 44100, stereo)
    print(f"   ✓ Đã lưu: {filename}\n")

def main():
    """Chạy tất cả các demo"""
    print("=" * 60)
    print("   🎧 BINAURAL BEATS LIBRARY - DEMO SCRIPT 🎧")
    print("=" * 60)
    print()
    
    create_output_folder()
    
    # Chạy tất cả demos
    demo_1_basic_binaural_beat()
    demo_2_theta_meditation()
    demo_3_delta_deep_sleep()
    demo_4_beta_focus()
    demo_5_isochronic_tone()
    demo_6_monaural_beat()
    demo_7_solfeggio_528hz()
    demo_8_solfeggio_432hz()
    demo_9_solfeggio_binaural()
    demo_10_mixed_solfeggio()
    
    print("=" * 60)
    print("✅ HOÀN THÀNH! Đã tạo 10 file audio demo")
    print("=" * 60)
    print()
    print("📁 Tất cả file được lưu trong thư mục: demo_outputs/")
    print()
    print("🎧 Hướng dẫn nghe:")
    print("   - Dùng TAI NGHE STEREO để nghe binaural beats")
    print("   - Nghe ở nơi yên tĩnh")
    print("   - Âm lượng vừa phải (không quá to)")
    print("   - Thư giãn và tập trung vào âm thanh")
    print()
    print("⚠️  Lưu ý:")
    print("   - Không nghe khi lái xe hoặc vận hành máy móc")
    print("   - Không dùng nếu có tiền sử động kinh")
    print("   - Ngưng nghe nếu cảm thấy khó chịu")
    print()

if __name__ == "__main__":
    main()
