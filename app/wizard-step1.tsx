import { colors } from '@/constants/colors';
import { useWitness } from '@/contexts/WitnessContext';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const rolePlaceholders = [
  'Student at University of Ghana',
  'Software Developer at Nexmatics Africa',
  'Trader on Tiktok',
  'Hairdresser at Ablekuma',
  'Teacher at Ridge School',
  'Nurse at Korle-Bu',
  'Entrepreneur in Accra',
];

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function WizardStep1() {
  const router = useRouter();
  const { updateUserProfile, userProfile } = useWitness();
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.contact || '');
  const [role, setRole] = useState(userProfile?.role || '');
  const [photoUri, setPhotoUri] = useState(userProfile?.photoUri || '');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % rolePlaceholders.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);


  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!name || !phone || !role) {
      return;
    }

    setIsSaving(true);

    try {
      console.log('Saving profile to database...');
      const savedProfile = await api.witness.saveProfile({
        name,
        contact: phone,
        role,
        photoUri,
      });

      console.log('Profile saved with ID:', savedProfile.id);

      updateUserProfile({
        id: savedProfile.id,
        name,
        contact: phone,
        role,
        photoUri,
      });

      router.push('/wizard-step2' as any);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      console.error('Full error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        data: error.response?.data,
        headers: error.config?.headers,
        fullError: JSON.stringify(error, null, 2),
      });
      
      let errorMessage = `Failed to save profile\n\nURL: ${error.config?.url || 'N/A'}\nBase URL: ${error.config?.baseURL || 'N/A'}\nStatus: ${error.response?.status || 'N/A'}\nMessage: ${error.message}`;
      
      if (error?.response?.status === 404) {
        errorMessage += '\n\n⚠️ The API endpoint could not be found. This might be a configuration issue with the backend.';
      } else if (error?.message?.includes('Database is not configured')) {
        errorMessage = '⚠️ Database Setup Required\n\nThe app needs to be connected to a database. Please contact the app administrator to set up Supabase credentials.';
      } else if (error?.response?.data?.error) {
        errorMessage += `\n\nServer Error: ${error.response.data.error}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = name && phone && role;

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topBar}>
              <Image
                source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYpt5LpKnQd6tOq30nWtcdTvb8zmJ-VthfNQ&s' }}
                style={styles.logo}
                resizeMode="cover"
              />
              <Text style={styles.appName}>Unleashed</Text>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>
                Before you Go and Tell, let&apos;s know who&apos;s telling the story.
              </Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email / Phone"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="default"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={rolePlaceholders[placeholderIndex]}
                  placeholderTextColor="#94A3B8"
                  value={role}
                  onChangeText={setRole}
                  autoCapitalize="sentences"
                />
              </View>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                {photoUri ? (
                  <View style={styles.photoPreview}>
                    <Image source={{ uri: photoUri }} style={styles.photo} />
                    <View style={styles.changePhotoOverlay}>
                      <Camera size={24} color={colors.white} />
                      <Text style={styles.changePhotoText}>Change Photo</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Camera size={40} color="#64748B" strokeWidth={1.5} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, (!isValid || isSaving) && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!isValid || isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {isSaving ? 'Saving...' : 'Generate My Witness Card'}
              </Text>
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <View style={[styles.progressDot, styles.progressDotActive]} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F5E8E4',
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 12,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.primary,
    lineHeight: 34,
    textAlign: 'center',
  },
  formSection: {
    gap: 14,
    marginBottom: 24,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    position: 'relative',
  },
  input: {
    padding: 18,
    fontSize: 17,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  photoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    height: Math.max(SCREEN_HEIGHT * 0.22, 140),
    maxHeight: 240,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPreview: {
    flex: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  changePhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 28, 69, 0.8)',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  changePhotoText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  button: {
    backgroundColor: '#E53E3E',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '700' as const,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  progressDotActive: {
    backgroundColor: '#F59E0B',
  },
  bottomSpacer: {
    height: 20,
  },
});
