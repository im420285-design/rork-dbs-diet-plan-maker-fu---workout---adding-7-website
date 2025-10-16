import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';
import { useStorage } from '@/providers/storage';
import { Alert, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const { getItem, setItem, removeItem } = useStorage();
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const GOOGLE_DISCOVERY = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  } as const;

  // Simple hash function for passwords (not secure for production)
  const hashPassword = useCallback((password: string): string => {
    return btoa(password); // Base64 encoding - replace with proper hashing in production
  }, []);

  const verifyPassword = useCallback((password: string, hashedPassword: string): boolean => {
    return hashPassword(password) === hashedPassword;
  }, [hashPassword]);

  const loadUsers = useCallback(async (): Promise<User[]> => {
    try {
      const stored = await getItem('users');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }, [getItem]);

  const saveUsers = useCallback(async (users: User[]): Promise<void> => {
    try {
      await setItem('users', JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }, [setItem]);

  const loadCurrentUser = useCallback(async (): Promise<void> => {
    try {
      const stored = await getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored) as User;
        setAuthState({
          currentUser: user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [getItem]);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const users = await loadUsers();
      
      // Check if user already exists
      if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        Alert.alert('خطأ', 'البريد الإلكتروني موجود بالفعل');
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        password: hashPassword(password),
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await saveUsers(users);
      await setItem('currentUser', JSON.stringify(newUser));

      setAuthState({
        currentUser: newUser,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert('خطأ', 'فشل في إنشاء الحساب');
      return false;
    }
  }, [loadUsers, saveUsers, setItem, hashPassword]);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const users = await loadUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user || !verifyPassword(password, user.password)) {
        Alert.alert('خطأ', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return false;
      }

      await setItem('currentUser', JSON.stringify(user));

      setAuthState({
        currentUser: user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Error signing in:', error);
      Alert.alert('خطأ', 'فشل في تسجيل الدخول');
      return false;
    }
  }, [loadUsers, setItem, verifyPassword]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await removeItem('currentUser');
      setAuthState({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [removeItem]);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS !== 'web') {
        Alert.alert('غير مدعوم مؤقتًا', 'تسجيل Google يعمل على الويب الآن داخل Expo Go. سنفعل الدعم على الهاتف لاحقًا.');
        return false;
      }
      console.log('[Auth] Google sign-in start');
      const redirectUri = window.location.origin + '/redirect';
      console.log('[Auth] redirectUri:', redirectUri);

      const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      if (!clientId) {
        console.warn('[Auth] Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
        Alert.alert('إعداد مفقود', 'برجاء ضبط متغير EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
        return false;
      }
      console.log('[Auth] Using clientId:', clientId?.slice(0, 8) + '...');

      await WebBrowser.warmUpAsync();

      const authUrl = `${GOOGLE_DISCOVERY.authorizationEndpoint}?${new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: 'openid email profile',
        prompt: 'select_account',
      }).toString()}`;
      console.log('[Auth] authUrl built');

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      console.log('[Auth] browser result:', result.type);
      const returnedUrl = result.type === 'success' ? result.url : null;
      if (!returnedUrl) {
        console.warn('[Auth] No returned URL');
        return false;
      }

      const hash = returnedUrl.split('#')[1] ?? '';
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token') ?? '';
      if (!accessToken) {
        console.warn('[Auth] No access_token in URL hash');
        Alert.alert('فشل المصادقة', 'لم يتم استلام رمز الوصول');
        return false;
      }

      console.log('[Auth] Fetching user info');
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userInfoRes.ok) {
        Alert.alert('خطأ', 'تعذر جلب بيانات المستخدم من Google');
        return false;
      }
      const profile = (await userInfoRes.json()) as {
        sub?: string;
        email?: string;
        name?: string;
        picture?: string;
      };

      const email = profile.email ?? '';
      if (!email) {
        Alert.alert('خطأ', 'لم تُعد Google بريدًا إلكترونيًا صالحًا');
        return false;
      }

      const users = await loadUsers();
      let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      console.log('[Auth] Existing user?', !!user);

      if (!user) {
        user = {
          id: profile.sub ?? Date.now().toString(),
          email: email.toLowerCase(),
          password: '',
          name: profile.name ?? email.split('@')[0],
          createdAt: new Date().toISOString(),
        } satisfies User;
        users.push(user);
        await saveUsers(users);
      }

      await setItem('currentUser', JSON.stringify(user));
      setAuthState({ currentUser: user, isAuthenticated: true, isLoading: false });
      console.log('[Auth] Google sign-in success');
      return true;
    } catch (error) {
      console.error('Error in Google sign-in:', error);
      Alert.alert('خطأ', 'فشل تسجيل الدخول عبر Google');
      return false;
    } finally {
      try { await WebBrowser.coolDownAsync(); } catch {}
    }
  }, [loadUsers, saveUsers, setItem]);

  return useMemo(() => ({
    ...authState,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  }), [authState, signUp, signIn, signOut, signInWithGoogle]);
});