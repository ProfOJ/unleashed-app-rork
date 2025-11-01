import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const checkDismissed = async () => {
      const dismissed = await AsyncStorage.getItem('pwa-install-dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    };

    checkDismissed();

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const dismissPrompt = async () => {
    await AsyncStorage.setItem('pwa-install-dismissed', 'true');
    setIsDismissed(true);
  };

  const resetDismissed = async () => {
    await AsyncStorage.removeItem('pwa-install-dismissed');
    setIsDismissed(false);
  };

  return {
    isInstallable: isInstallable && !isDismissed && Platform.OS === 'web',
    promptInstall,
    dismissPrompt,
    resetDismissed,
  };
}
