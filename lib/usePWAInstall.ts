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
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const checkInstalled = () => {
      if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInStandaloneMode = (window.navigator as any).standalone === true;
        setIsInstalled(isStandalone || isInStandaloneMode);
      }
    };

    const checkDismissed = async () => {
      const dismissed = await AsyncStorage.getItem('pwa-install-dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    };

    checkInstalled();
    checkDismissed();

    const handler = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt event fired');
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
    isInstallable: isInstallable && !isDismissed && !isInstalled && Platform.OS === 'web',
    canPromptInstall: deferredPrompt !== null,
    isInstalled,
    promptInstall,
    dismissPrompt,
    resetDismissed,
  };
}
