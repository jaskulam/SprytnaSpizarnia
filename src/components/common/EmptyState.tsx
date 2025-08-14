import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../themes';

interface Props {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<Props> = ({ icon, title, description, actionLabel, onAction }) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={48} color={colors.primary} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} style={styles.button}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.lg },
  title: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' },
  description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
  button: { marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  buttonText: { ...typography.bodyBold, color: colors.white },
});

export default EmptyState;
