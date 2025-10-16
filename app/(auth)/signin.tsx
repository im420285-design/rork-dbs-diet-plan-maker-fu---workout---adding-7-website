import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AuthForm from '@/components/AuthForm';
import Colors from '@/constants/colors';

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSuccess = () => {
    router.replace('/(tabs)/home');
  };

  const navigateToSignUp = () => {
    router.push('/(auth)/signup');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <AuthForm mode="signin" onSuccess={handleSuccess} />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>ليس لديك حساب؟ </Text>
        <TouchableOpacity onPress={navigateToSignUp}>
          <Text style={styles.footerLink}>إنشاء حساب جديد</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: Colors.light.gray[600],
    fontSize: 16,
  },
  footerLink: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});