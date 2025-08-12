import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FamilyManagementScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zarządzanie rodziną</Text>
      <Text style={styles.text}>Ta sekcja jest w przygotowaniu.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  text: { color: '#666' },
});

export default FamilyManagementScreen;
