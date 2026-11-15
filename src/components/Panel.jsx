import React from 'react';
import { View } from 'react-native';
import { st } from '../styles/styles';

export function Panel({ children, style }) {
  return <View style={[st.panel, style]}>{children}</View>;
}