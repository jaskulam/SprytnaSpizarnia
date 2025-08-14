import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppDispatch, RootState } from '@/store/store';
import { signInAnonymously, signInWithGoogle, signInWithApple, signInWithEmail, registerWithEmail } from '@/store/slices/authSlice';
import { colors, spacing, typography } from '@/themes';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { isLoading } = useSelector((s: RootState) => s.auth);
  const anonymousProductCount = useSelector((s: RootState) => s.products.items.length);

  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    dispatch(signInAnonymously()).catch(() => {
      Alert.alert('Błąd', 'Nie udało się utworzyć konta tymczasowego');
    });
  }, [dispatch]);

  const withMigrationInfo = async (fn: () => Promise<any>) => {
    // For now just proceed; migration handled in AuthService link flows
    return fn();
  };

  const onGoogle = async () => {
    try {
      await withMigrationInfo(() => dispatch(signInWithGoogle()).unwrap());
      Alert.alert('Sukces', 'Zalogowano pomyślnie.');
    } catch (e: any) {
      if (e?.code !== 'CANCELLED') Alert.alert('Błąd', 'Nie udało się zalogować przez Google');
    }
  };
  const onApple = async () => {
    if (Platform.OS !== 'ios') return Alert.alert('Błąd', 'Dostępne tylko na iOS');
    try {
      await withMigrationInfo(() => dispatch(signInWithApple()).unwrap());
      Alert.alert('Sukces', 'Zalogowano pomyślnie.');
    } catch (e: any) {
      if (e?.name !== 'CANCELLED') Alert.alert('Błąd', 'Nie udało się zalogować przez Apple');
    }
  };
  const onEmail = async () => {
    if (!email || !password) return Alert.alert('Błąd', 'Wypełnij wszystkie pola');
    try {
      if (isRegistering) {
        await dispatch(registerWithEmail({ email, password })).unwrap();
      } else {
        await dispatch(signInWithEmail({ email, password })).unwrap();
      }
      Alert.alert('Sukces', 'Zalogowano pomyślnie.');
    } catch (e: any) {
      Alert.alert('Błąd', isRegistering ? 'Nie udało się utworzyć konta' : 'Nieprawidłowy email lub hasło');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Icon name="food-variant" size={80} color={colors.white} />
        <Text style={styles.appName}>Sprytna Spiżarnia</Text>
        <Text style={styles.tagline}>Zarządzaj datami ważności z łatwością</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>{showEmail ? 'Logowanie email' : 'Utwórz konto PRO'}</Text>
        <Text style={styles.subtitle}>Synchronizuj dane i współdziel z rodziną</Text>

        {anonymousProductCount > 0 && (
          <View style={styles.migrationInfo}>
            <Icon name="information" size={20} color={colors.primary} />
            <Text style={styles.migrationText}>Twoje {anonymousProductCount} produktów zostanie automatycznie przeniesione</Text>
          </View>
        )}

        {!showEmail ? (
          <View style={{ marginBottom: spacing.xl }}>
            <TouchableOpacity style={styles.googleButton} onPress={onGoogle} disabled={isLoading}>
              <View style={styles.googleIcon}>
                <Icon name="google" size={20} color="#4285F4" />
              </View>
              <Text style={styles.socialButtonText}>Kontynuuj z Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.appleButton} onPress={onApple} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color={colors.white} /> : <Icon name="apple" size={20} color={colors.white} />}
                <Text style={[styles.socialButtonText, { color: colors.white, marginLeft: spacing.sm }]}>Kontynuuj z Apple</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.linkButton} onPress={() => setShowEmail(true)}>
              <Text style={styles.linkButtonText}>Zaloguj się emailem</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.inputRow}>
              <Icon name="email-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.inputRow}>
              <Icon name="lock-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Hasło"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={onEmail} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitButtonText}>{isRegistering ? 'Zarejestruj się' : 'Zaloguj się'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
              <Text style={styles.switchAuthText}>{isRegistering ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowEmail(false)}>
              <Text style={styles.backText}>Wróć do opcji logowania</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.skipButton} onPress={() => (navigation as any).goBack()}>
          <Text style={styles.skipButtonText}>Kontynuuj bez logowania</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1 },
  header: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg, backgroundColor: colors.primary },
  appName: { ...typography.h1, color: colors.white, marginTop: spacing.md },
  tagline: { ...typography.body, color: colors.white, opacity: 0.9, marginTop: spacing.sm, textAlign: 'center' },
  formContainer: { flex: 1, padding: spacing.lg, backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, paddingTop: spacing.xl },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  migrationInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, padding: spacing.md, borderRadius: 8, marginBottom: spacing.lg },
  migrationText: { ...typography.body, color: colors.primary, marginLeft: spacing.sm, flex: 1 },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: spacing.md, marginBottom: spacing.md },
  googleIcon: { marginRight: spacing.sm },
  socialButtonText: { ...typography.bodyBold, color: colors.textPrimary },
  appleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.black, borderRadius: 8, paddingVertical: spacing.md, marginBottom: spacing.md },
  linkButton: { alignItems: 'center', paddingVertical: spacing.sm },
  linkButtonText: { ...typography.body, color: colors.primary },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md },
  input: { flex: 1, marginLeft: spacing.sm, ...typography.body, color: colors.textPrimary },
  submitButton: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 8, alignItems: 'center', marginTop: spacing.md },
  submitButtonText: { ...typography.bodyBold, color: colors.white },
  switchAuthText: { ...typography.body, color: colors.primary, textAlign: 'center', marginTop: spacing.md },
  backText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  skipButton: { alignItems: 'center', paddingVertical: spacing.md },
  skipButtonText: { ...typography.body, color: colors.textSecondary },
});

export default LoginScreen;
