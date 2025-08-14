import React from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../themes';
import Button from '../common/Button';

interface MigrationModalProps {
  visible: boolean;
  productCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const MigrationModal: React.FC<MigrationModalProps> = ({
  visible,
  productCount,
  onConfirm,
  onCancel,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconContainer}>
            <Icon name="cloud-sync" size={60} color={colors.primary} />
          </View>

          <Text style={styles.title}>Przenieś swoje dane</Text>

          <Text style={styles.description}>
            Masz obecnie <Text style={styles.highlight}>{productCount} produktów</Text> zapisanych lokalnie.
          </Text>

          <Text style={styles.description}>
            Po zalogowaniu wszystkie Twoje dane zostaną automatycznie przeniesione na konto PRO i zsynchronizowane w chmurze.
          </Text>

          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.benefitText}>Dane bezpieczne w chmurze</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.benefitText}>Dostęp z wielu urządzeń</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.benefitText}>Współdzielenie z rodziną</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Anuluj" onPress={onCancel} variant="outline" style={styles.button} />
            <Button
              title="Kontynuuj"
              onPress={onConfirm}
              style={styles.button}
              icon={<Icon name="arrow-right" size={20} color={colors.white} />}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  highlight: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  benefits: {
    marginVertical: spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default MigrationModal;
