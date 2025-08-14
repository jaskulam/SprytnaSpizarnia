import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  error: Error;
  onRetry: () => void;
  showSupport?: boolean;
}

const InitializationErrorScreen: React.FC<Props> = ({ error, onRetry, showSupport }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nie udało się zainicjalizować aplikacji</Text>
      <Text style={styles.message}>Spróbuj ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z pomocą.</Text>
      {__DEV__ && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Szczegóły (DEV):</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}
      <TouchableOpacity onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonText}>Spróbuj ponownie</Text>
      </TouchableOpacity>
      {showSupport && (
        <Text style={styles.support}>Wsparcie: support@sprytnaspizarnia.pl</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8, color: '#333' },
  message: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  errorBox: { backgroundColor: '#FFEBEE', padding: 12, borderRadius: 8, width: '100%', marginBottom: 16 },
  errorTitle: { fontWeight: '700', color: '#B71C1C', marginBottom: 4 },
  errorText: { color: '#B71C1C' },
  button: { backgroundColor: '#2196F3', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#FFF', fontWeight: '600' },
  support: { marginTop: 12, color: '#999' },
});

export default InitializationErrorScreen;
