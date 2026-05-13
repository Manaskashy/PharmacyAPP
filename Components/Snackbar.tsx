import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  duration?: number;
}

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.4;

const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  type = 'info',
  onDismiss,
  duration = 4000,
}) => {
  const [isRendered, setIsRendered] = useState(visible);
  const translateY = useRef(new Animated.Value(100)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // PanResponder to handle swiping
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
          // Swipe far enough, dismiss
          Animated.timing(translateX, {
            toValue: gestureState.dx > 0 ? width : -width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => handleHide());
        } else {
          // Snap back to center
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 10,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      translateX.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleHide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      handleHide();
    }
  }, [visible]);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsRendered(false);
      onDismiss();
    });
  };

  if (!isRendered) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#2F855A';
      case 'error': return '#C53030';
      case 'info': return '#1A535C';
      default: return '#2D3748';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'info': return 'information';
      default: return 'bell';
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.snackbar,
          {
            backgroundColor: getBackgroundColor(),
            transform: [{ translateY }, { translateX }],
            opacity,
          },
        ]}
      >
        <Icon name={getIcon()} size={22} color="white" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.text} numberOfLines={2}>
            {message}
          </Text>
          <Text style={styles.swipeHint}>Swipe to dismiss</Text>
        </View>
        <TouchableOpacity onPress={handleHide} style={styles.closeBtn}>
          <Icon name="close" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  snackbar: {
    width: width - 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  swipeHint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});

export default Snackbar;
