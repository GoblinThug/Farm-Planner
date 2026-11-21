import { Easing } from 'react-native';

export const motion = {
  duration: {
    fast: 200,
    medium: 280,
    slow: 360,
  },
  easing: {
    out: Easing.out(Easing.cubic),
    in: Easing.in(Easing.cubic),
    inOut: Easing.inOut(Easing.cubic),
  },
  spring: {
    gentle: { friction: 9, tension: 72 },
    snappy: { friction: 8, tension: 110 },
  },
  screen: {
    enterOffsetY: 12,
    enterScale: 0.98,
  },
  modal: {
    enterScale: 0.94,
    enterOffsetY: 16,
    backdropMaxOpacity: 1,
  },
};