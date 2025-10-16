import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { User, Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import Colors from '@/constants/colors';

interface Props {
  mode: 'signin' | 'signup';
  onSuccess: () => void;
}

export default function AuthForm({ mode, onSuccess }: Props) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (mode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'الاسم مطلوب';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let success = false;

      if (mode === 'signin') {
        success = await signIn(formData.email.trim(), formData.password);
      } else {
        success = await signUp(formData.email.trim(), formData.password, formData.name.trim());
      }

      if (success) {
        onSuccess();
      }
    } catch {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'signin' 
            ? 'أدخل بياناتك للمتابعة' 
            : 'أنشئ حسابك الجديد'
          }
        </Text>
      </View>

      <View style={styles.form}>
        {mode === 'signup' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الاسم الكامل</Text>
            <View style={[styles.inputContainer, errors.name && styles.inputError]}>
              <User size={20} color={Colors.light.gray[500]} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="أدخل اسمك الكامل"
                autoCapitalize="words"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <View style={[styles.inputContainer, errors.email && styles.inputError]}>
            <Mail size={20} color={Colors.light.gray[500]} />
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>كلمة المرور</Text>
          <View style={[styles.inputContainer, errors.password && styles.inputError]}>
            <Lock size={20} color={Colors.light.gray[500]} />
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="أدخل كلمة المرور"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color={Colors.light.gray[500]} />
              ) : (
                <Eye size={20} color={Colors.light.gray[500]} />
              )}
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {mode === 'signup' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>تأكيد كلمة المرور</Text>
            <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
              <Lock size={20} color={Colors.light.gray[500]} />
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholder="أعد إدخال كلمة المرور"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color={Colors.light.gray[500]} />
                ) : (
                  <Eye size={20} color={Colors.light.gray[500]} />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>
        )}

        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          testID="submit-auth"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>
              {mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
            </Text>
          )}
        </TouchableOpacity>

        {mode === 'signin' && (
          <TouchableOpacity
            style={styles.googleButton}
            onPress={async () => {
              try {
                setIsLoading(true);
                const ok = await signInWithGoogle();
                if (ok) onSuccess();
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            testID="google-signin"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={styles.googleContent}>
                <Chrome size={20} color="white" />
                <Text style={styles.googleText}>المتابعة بحساب Google</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.gray[500],
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    marginLeft: 12,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  googleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});