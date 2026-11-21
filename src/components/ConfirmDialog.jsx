import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AnimatedModal } from './AnimatedModal';
import { useTheme } from '../context/ThemeContext';

/**
 * In-app confirmation / notice card (replaces system Alert where needed).
 * tone: 'neutral' | 'ok' | 'warn' | 'danger'
 */
export function ConfirmDialog({
  visible,
  onRequestClose,
  eyebrow = 'ПРИЛОЖЕНИЕ',
  title,
  message,
  icon = 'info',
  tone = 'neutral',
  primaryLabel = 'Понятно',
  onPrimary,
  secondaryLabel,
  onSecondary,
}) {
  const { st, palette } = useTheme();

  const iconColor =
    tone === 'ok' ? palette.greenDark : tone === 'warn' || tone === 'danger' ? palette.danger : palette.brown;
  const iconWrapExtra =
    tone === 'ok' ? st.confirmIconWrapOk : tone === 'warn' || tone === 'danger' ? st.confirmIconWrapWarn : null;
  const primaryStyle = tone === 'danger' ? st.confirmDelete : st.confirmPrimary;
  const primaryTextStyle = tone === 'danger' ? st.confirmDeleteText : st.confirmPrimaryText;

  const handlePrimary = () => {
    if (onPrimary) onPrimary();
    else onRequestClose?.();
  };

  const handleSecondary = () => {
    if (onSecondary) onSecondary();
    else onRequestClose?.();
  };

  return (
    <AnimatedModal visible={visible} onRequestClose={onRequestClose} cardStyle={st.confirmCard}>
      <View style={[st.confirmIconWrap, iconWrapExtra]}>
        <Feather name={icon} size={24} color={iconColor} />
      </View>
      {eyebrow ? <Text style={st.confirmEyebrow}>{eyebrow}</Text> : null}
      <Text style={st.confirmTitle}>{title}</Text>
      {message ? <Text style={st.confirmMessage}>{message}</Text> : null}
      <View style={[st.confirmActions, !secondaryLabel && st.confirmSingleAction]}>
        {secondaryLabel ? (
          <TouchableOpacity onPress={handleSecondary} style={st.confirmCancel} activeOpacity={0.85}>
            <Text style={st.confirmCancelText}>{secondaryLabel}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={handlePrimary} style={primaryStyle} activeOpacity={0.85}>
          <Text style={primaryTextStyle}>{primaryLabel}</Text>
        </TouchableOpacity>
      </View>
    </AnimatedModal>
  );
}
