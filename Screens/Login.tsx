import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Keyboard, SafeAreaView, StatusBar, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from "react-native";
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../Services/authService';
import api from '../Services/api';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  DoctorConsultant: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginProps {
  navigation: LoginScreenNavigationProp;
}

const Login = ({ navigation }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError("");
    setLoading(true);

    console.log('Attempting login with:', { email, password: '***' });

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      console.log('Sending login request via authService...');
      const data = await authService.login(email, password);

      console.log('Login response received:', data);

      if (data.message === 'Logged in successfully') {
        const token = data.token || data.user?.id;
        if (token) {
          await AsyncStorage.setItem('userToken', token);
        }
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        console.log('Login successful, navigating to Home');
        navigation.navigate('Home');
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err: any) {
      console.error('Login error detail:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      setError(err.response?.data?.message || "Internal server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A535C" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Icon name="medical-bag" size={60} color="#4ECDC4" />
              </View>
              <Text style={styles.brandName}>Medinova</Text>
              <Text style={styles.tagline}>Your Health, Our Priority</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Login to Account</Text>

              {error ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={18} color="#FF6B6B" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputWrapper}>
                <Icon name="account" size={20} color="#1A535C" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#A0AEC0"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Icon name="lock" size={20} color="#1A535C" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#A0AEC0"
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  (pressed || loading) && styles.buttonPressed,
                  loading && { backgroundColor: '#A0AEC0' }
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </Pressable>

              <Pressable style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1A535C",
  },
  container: {
    flex: 1,
    padding: 24,
    paddingVertical: 40,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  brandName: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: "#E2E8F0",
    marginTop: 4,
    opacity: 0.8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#2D3748",
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  errorText: {
    color: '#E53E3E',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#2D3748",
  },
  button: {
    backgroundColor: "#4ECDC4",
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: "#1A535C",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 15,
  },
  signUpText: {
    color: "#4ECDC4",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default Login;