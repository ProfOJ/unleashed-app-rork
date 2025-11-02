import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    console.log('Push notifications are not available on web');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push notification permissions');
    return null;
  }
  
  return finalStatus;
}

export async function scheduleSoulCheckNotifications() {
  if (Platform.OS === 'web') {
    console.log('Notifications are not available on web');
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Soul Check Reminder ✨",
      body: "Its time to check on your souls, have a blessed day",
      sound: 'default',
      data: { type: 'soul_check' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      weekday: 7,
      hour: 7,
      minute: 0,
      repeats: true,
    },
  });
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Soul Check Reminder ✨",
      body: "Its time to check on your souls, have a blessed day",
      sound: 'default',
      data: { type: 'soul_check' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      weekday: 1,
      hour: 7,
      minute: 0,
      repeats: true,
    },
  });
  
  console.log('Soul check notifications scheduled for Saturdays and Sundays at 7 AM');
}



export async function cancelAllNotifications() {
  if (Platform.OS === 'web') {
    return;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
}
