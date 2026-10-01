/**
 * Sound synthesis and Notification utility for AsistenKu
 */

class SoundAndNotificationManager {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play pleasant, warm 2-tone notification chime
  playChime(type: 'reminder' | 'deadline' | 'success' | 'alert' = 'reminder') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'deadline' || type === 'alert') {
        // High attention alert chime (F5 -> A5 -> C6)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(698.46, now); // F5
        osc.frequency.setValueAtTime(880.0, now + 0.12); // A5
        osc.frequency.setValueAtTime(1046.5, now + 0.24); // C6

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'success') {
        // Friendly success harmonic (C5 -> G5)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(783.99, now + 0.14); // G5

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.55);
      } else {
        // Standard reminder chime (E5 -> B5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc1.frequency.setValueAtTime(987.77, now + 0.12); // B5

        gain1.gain.setValueAtTime(0.01, now);
        gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.04);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc1.start(now);
        osc1.stop(now + 0.55);
      }

      // Vibrate if supported on mobile
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (e) {
      console.warn('Audio chime playback omitted:', e);
    }
  }

  // Request browser notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Show desktop/mobile web notification
  showWebNotification(title: string, body: string, icon = '/icon-192.png') {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon,
          badge: '/icon-192.png',
          tag: 'asistenku-reminder-' + Date.now(),
        });
      } catch (err) {
        console.warn('Failed to show native notification:', err);
      }
    }
  }
}

export const soundAndNotify = new SoundAndNotificationManager();
