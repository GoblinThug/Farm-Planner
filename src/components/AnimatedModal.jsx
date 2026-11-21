import React, { useEffect, useRef, useState } from 'react';
import { Modal, Animated, Pressable, StyleSheet, View } from 'react-native';
import { motion } from '../styles/motion';
import { useTheme } from '../context/ThemeContext';

/**
 * Modal with the same fade + scale entrance as native sheet dialogs.
 * Pass `cardStyle` for navMenuCard, modalCard, confirmCard, etc.
 */
export function AnimatedModal({
  visible,
  onRequestClose,
  children,
  cardStyle,
  backdropStyle,
  dismissOnBackdropPress = true,
}) {
  const { st } = useTheme();
  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(motion.modal.enterScale)).current;
  const cardTranslateY = useRef(new Animated.Value(motion.modal.enterOffsetY)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdropOpacity.setValue(0);
      cardOpacity.setValue(0);
      cardScale.setValue(motion.modal.enterScale);
      cardTranslateY.setValue(motion.modal.enterOffsetY);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: motion.modal.backdropMaxOpacity,
          duration: motion.duration.medium,
          easing: motion.easing.out,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: motion.duration.medium,
          easing: motion.easing.out,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          ...motion.spring.gentle,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: 0,
          duration: motion.duration.medium,
          easing: motion.easing.out,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!mounted) return;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: motion.duration.fast,
        easing: motion.easing.in,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: motion.duration.fast,
        easing: motion.easing.in,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: motion.modal.enterScale,
        duration: motion.duration.fast,
        easing: motion.easing.in,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: motion.modal.enterOffsetY,
        duration: motion.duration.fast,
        easing: motion.easing.in,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, mounted, backdropOpacity, cardOpacity, cardScale, cardTranslateY]);

  if (!mounted) return null;

  const handleBackdropPress = () => {
    if (dismissOnBackdropPress && onRequestClose) onRequestClose();
  };

  return (
    <Modal transparent visible animationType="none" onRequestClose={onRequestClose} statusBarTranslucent>
      <View style={[st.modalBackdrop, backdropStyle, styles.backdropHost]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Закрыть"
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
        >
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, st.modalBackdrop, backdropStyle, { opacity: backdropOpacity }]}
          />
        </Pressable>
        <Pressable onPress={() => {}} style={styles.cardPressable}>
          <Animated.View
            style={[
              cardStyle,
              {
                opacity: cardOpacity,
                transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
              },
            ]}
          >
            {children}
          </Animated.View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropHost: {
    backgroundColor: 'transparent',
  },
  cardPressable: {
    width: '100%',
    alignSelf: 'center',
  },
});
