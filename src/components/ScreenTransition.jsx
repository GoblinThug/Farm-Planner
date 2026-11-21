import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { motion } from '../styles/motion';

/** Animates main tab content when `transitionKey` changes (tab or profile). */
export function ScreenTransition({ transitionKey, children }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(motion.screen.enterOffsetY);
    scale.setValue(motion.screen.enterScale);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.medium,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: motion.duration.medium,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        ...motion.spring.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, [transitionKey, opacity, translateY, scale]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      {children}
    </Animated.View>
  );
}