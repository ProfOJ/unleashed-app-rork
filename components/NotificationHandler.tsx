import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { registerForPushNotificationsAsync, scheduleSoulCheckNotifications } from '@/lib/notificationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function NotificationHandler() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const setupNotifications = async () => {
      const status = await registerForPushNotificationsAsync();
      if (status === 'granted') {
        await scheduleSoulCheckNotifications();
      }
    };

    setupNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      
      if (notification.request.content.data?.type === 'soul_check') {
        playChimeAndSpeak();
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      if (response.notification.request.content.data?.type === 'soul_check') {
        playChimeAndSpeak();
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const playChimeAndSpeak = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7504a26333.mp3' },
        { shouldPlay: true }
      );
      
      await sound.playAsync();
      
      setTimeout(() => {
        Speech.speak("Its time to check on your souls, have a blessed day", {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
        });
      }, 1000);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing sound or speaking:', error);
      
      Speech.speak("Its time to check on your souls, have a blessed day", {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    }
  };

  return null;
}
