import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type UserProfile = {
  id?: string;
  name: string;
  contact: string;
  role: string;
  photoUri?: string;
  country?: string;
  district?: string;
  assembly?: string;
};

export type TestimonyData = {
  tellOnline: boolean;
  tellInPerson: boolean;
  goWorkplace: boolean;
  goSchool: boolean;
  goNeighborhood: boolean;
  heard: string[];
  seen: string[];
  experienced: string[];
};

const STORAGE_KEY = '@go_and_tell_data';

export const [WitnessProvider, useWitness] = createContextHook(() => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [testimony, setTestimony] = useState<TestimonyData>({
    tellOnline: false,
    tellInPerson: false,
    goWorkplace: false,
    goSchool: false,
    goNeighborhood: false,
    heard: [],
    seen: [],
    experienced: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.userProfile) setUserProfile(data.userProfile);
        if (data.testimony) setTestimony(data.testimony);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = useCallback(async (profile?: UserProfile, testimonyData?: TestimonyData) => {
    try {
      const dataToSave = {
        userProfile: profile || userProfile,
        testimony: testimonyData || testimony,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [userProfile, testimony]);

  const updateUserProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    saveData(profile, testimony);
  }, [testimony, saveData]);

  const updateTestimony = useCallback((data: Partial<TestimonyData>) => {
    const updated = { ...testimony, ...data };
    setTestimony(updated);
    saveData(userProfile!, updated);
  }, [testimony, userProfile, saveData]);

  const reset = useCallback(async () => {
    setUserProfile(null);
    setTestimony({
      tellOnline: false,
      tellInPerson: false,
      goWorkplace: false,
      goSchool: false,
      goNeighborhood: false,
      heard: [],
      seen: [],
      experienced: [],
    });
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return useMemo(() => ({
    userProfile,
    testimony,
    isLoading,
    updateUserProfile,
    updateTestimony,
    reset,
  }), [userProfile, testimony, isLoading, updateUserProfile, updateTestimony, reset]);
});
