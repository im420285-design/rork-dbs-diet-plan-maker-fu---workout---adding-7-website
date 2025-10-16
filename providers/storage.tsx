import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const [StorageProvider, useStorage] = createContextHook(() => {
  const getItem = useCallback(async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  }, []);

  const setItem = useCallback(async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  }, []);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  }, []);

  return useMemo(() => ({
    getItem,
    setItem,
    removeItem
  }), [getItem, setItem, removeItem]);
});