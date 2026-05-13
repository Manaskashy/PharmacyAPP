import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StatusBar, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoaderScreen = ({ navigation }: { navigation: any }) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      )
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation, scaleAnim, opacityAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Animated.View style={[styles.logoContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconCircle}>
          <Icon name="medical-bag" size={80} color="#1A535C" />
        </View>
        <Text style={styles.title}>MediNova</Text>
        <Text style={styles.subtitle}>Your Health, Our Priority</Text>
      </Animated.View>

      <View style={styles.loaderContainer}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon name="loading" size={30} color="white" />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A535C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 1,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
  },
});

export default LoaderScreen;
