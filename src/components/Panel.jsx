import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function Panel({ children, style }) {
  const { st } = useTheme();
  return <View style={[st.panel, style]}>{children}</View>;
}
