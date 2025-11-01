import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { X, Download } from 'lucide-react-native';
import { usePWAInstall } from '@/lib/usePWAInstall';

export function PWAInstallBanner() {
  const { isInstallable, promptInstall, dismissPrompt } = usePWAInstall();

  if (!isInstallable || Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Download size={20} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Install App</Text>
          <Text style={styles.subtitle}>Install for quick access and a better experience</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={promptInstall}
            style={styles.installButton}
            accessibilityLabel="Install app"
          >
            <Text style={styles.installButtonText}>Install</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={dismissPrompt}
            style={styles.closeButton}
            accessibilityLabel="Dismiss install banner"
          >
            <X size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  installButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  installButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4F46E5',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
