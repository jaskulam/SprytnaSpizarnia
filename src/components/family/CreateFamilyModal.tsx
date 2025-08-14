import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../themes';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const CreateFamilyModal: React.FC<Props> = ({ visible, onClose, onConfirm }) => {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    onConfirm(trimmed);
    setName('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Utwórz rodzinę</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nazwa rodziny"
            style={styles.input}
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnOutline]}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>Anuluj</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.btn}>
              <Text style={[styles.btnText, styles.btnTextOnPrimary]}>Utwórz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  container: { width: '100%', maxWidth: 420, backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg },
  title: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, ...typography.body },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg },
  btn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 8, marginLeft: spacing.sm },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  btnText: { ...typography.bodyBold },
  btnTextOnPrimary: { color: colors.white },
  btnTextPrimary: { color: colors.primary },
});

export default CreateFamilyModal;
