import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Dimensions, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { login, isLoading, error } = useAuthStore();

  useEffect(() => {
    if (error) {
      setLocalError(error);
      useAuthStore.setState({ error: null });
    }
  }, [error]);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (localError) {
      setLocalError(null);
      useAuthStore.setState({ error: null });
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (localError) {
      setLocalError(null);
      useAuthStore.setState({ error: null });
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const result = await login(email, password);
  };

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFillObject} backgroundColor="#05030D" />
      {/* Approximating the glowing background blobs using soft gradients */}
      <View style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.4)', 'rgba(79, 141, 255, 0.2)', 'transparent']}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        
        {/* Header - Language Pill */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.languagePill}>
            <Ionicons name="globe-outline" size={12} color="#F0F0F0" />
            <Text style={styles.languageText}>EN</Text>
            <Ionicons name="chevron-down" size={12} color="#F0F0F0" />
          </TouchableOpacity>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>See yourself in a new style.</Text>
        </View>

        {/* Card Overlay */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.03)']}
          style={styles.card}
        >
          <Text style={styles.loginTitle}>Login</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.70)" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter Your Email"
              placeholderTextColor="rgba(255, 255, 255, 0.70)"
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.70)" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="rgba(255, 255, 255, 0.70)"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="rgba(255, 255, 255, 0.70)"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forget password?</Text>
          </TouchableOpacity>

          {localError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{localError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.continueButtonWrapper}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6366F1', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButton}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or </Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={{ width: 20, height: 20 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={20} color="rgba(242, 242, 242, 0.90)" />
            </TouchableOpacity>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Floating Icons (Scissor & Comb image) */}
        {/* Positioned after card to overlap it properly */}
        <View style={styles.floatingIcons}>
          <Image 
            source={require('../../assets/barbershop.png')} 
            style={styles.floatingImage}
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05030D',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 25,
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(241.27, 241.27, 241.27, 0.70)',
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  languageText: {
    color: '#F0F0F0',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.36,
  },
  welcomeContainer: {
    paddingHorizontal: 30,
    paddingTop: 30,
    zIndex: 10,
  },
  welcomeTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '400',
  },
  floatingIcons: {
    position: 'absolute',
    right: 15,
    top: height * 0.18,
    zIndex: 10,
    elevation: 10,
  },
  floatingImage: {
    width: 180,
    height: 180,
  },
  card: {
    flex: 1,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginTop: height * 0.1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 20,
  },
  loginTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 16,
    fontWeight: '400',
    outlineStyle: 'none',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    flex: 1,
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  continueButtonWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 10,
  },
  continueButton: {
    height: 59,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(221, 221, 221, 0.50)',
  },
  orText: {
    color: 'rgba(255, 255, 255, 0.70)',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.70)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  signupText: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 14,
    letterSpacing: 0.42,
  },
  signupLink: {
    color: '#8339FB',
    fontSize: 14,
    letterSpacing: 0.42,
  },
});
