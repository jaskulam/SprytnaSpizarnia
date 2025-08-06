import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';

import { RootState, AppDispatch } from '../../store/store';
import {
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
} from '../../store/slices/authSlice';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const { items: products } = useSelector((state: RootState) => state.products);

  const [authMethod, setAuthMethod] = useState<'social' | 'email' | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap();
      Alert.alert(
        'Sukces!',
        'Zalogowano pomyślnie. Twoje dane zostały przeniesione.',
        [{ text: 'OK', onPress: onSuccess }]
      );
      onClose();
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się zalogować przez Google');
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Błąd', 'Logowanie Apple jest dostępne tylko na iOS');
      return;
    }

    try {
      await dispatch(signInWithApple()).unwrap();
      Alert.alert(
        'Sukces!',
        'Zalogowano pomyślnie. Twoje dane zostały przeniesione.',
        [{ text: 'OK', onPress: onSuccess }]
      );
      onClose();
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się zalogować przez Apple');
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      Alert.alert('Błąd', 'Hasła nie są identyczne');
      return;
    }

    if (isRegistering && password.length < 6) {
      Alert.alert('Błąd', 'Hasło musi mieć co najmniej 6 znaków');
      return;
    }

    try {
      await dispatch(signInWithEmail({ email, password })).unwrap();
      Alert.alert(
        'Sukces!',
        'Zalogowano pomyślnie. Twoje dane zostały przeniesione.',
        [{ text: 'OK', onPress: onSuccess }]
      );
      onClose();
    } catch (error) {
      Alert.alert(
        'Błąd',
        isRegistering ? 'Nie udało się utworzyć konta' : 'Nieprawidłowy email lub hasło'
      );
    }
  };

  const resetForm = () => {
    setAuthMethod('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsRegistering(false);
    setShowPassword(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.backdrop}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Utwórz konto PRO</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    resetForm();
                    onClose();
                  }}
                >
                  <Icon name="close" size={24} color="#666666" />
                </TouchableOpacity>
              </View>

              {authMethod === '' && (
                <>
                  <Text style={styles.subtitle}>
                    Zaloguj się, aby korzystać z wszystkich funkcji PRO
                    i synchronizować dane między urządzeniami
                  </Text>

                  {products.length > 0 && (
                    <View style={styles.migrationInfo}>
                      <Icon name="shield-check" size={20} color="#2196F3" />
                      <Text style={styles.migrationText}>
                        Twoje {products.length} produktów zostanie automatycznie przeniesione
                      </Text>
                    </View>
                  )}

                  <View style={styles.socialButtons}>
                    <TouchableOpacity
                      style={[styles.socialButton, styles.googleButton]}
                      onPress={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <View style={styles.googleIcon}>
                        <Text style={{ color: '#4285F4', fontWeight: 'bold' }}>G</Text>
                      </View>
                      <Text style={styles.socialButtonText}>
                        Kontynuuj z Google
                      </Text>
                    </TouchableOpacity>

                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        style={[styles.socialButton, styles.appleButton]}
                        onPress={handleAppleSignIn}
                        disabled={isLoading}
                      >
                        <Icon name="apple" size={20} color="#FFFFFF" />
                        <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
                          Kontynuuj z Apple
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>lub</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity
                    style={styles.emailButton}
                    onPress={() => setAuthMethod('email')}
                  >
                    <Icon name="email-outline" size={20} color="#2196F3" />
                    <Text style={styles.emailButtonText}>
                      Zaloguj się emailem
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.features}>
                    <Text style={styles.featuresTitle}>Co zyskujesz w PRO:</Text>
                    <View style={styles.featureItem}>
                      <Icon name="check-circle" size={16} color="#4CAF50" />
                      <Text style={styles.featureText}>
                        Synchronizacja między urządzeniami
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Icon name="check-circle" size={16} color="#4CAF50" />
                      <Text style={styles.featureText}>
                        Współdzielenie z rodziną
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Icon name="check-circle" size={16} color="#4CAF50" />
                      <Text style={styles.featureText}>
                        Skaner kodów i paragonów
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Icon name="check-circle" size={16} color="#4CAF50" />
                      <Text style={styles.featureText}>
                        Nielimitowane przepisy AI
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {authMethod === 'email' && (
                <>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setAuthMethod('')}
                  >
                    <Icon name="arrow-left" size={20} color="#666666" />
                    <Text style={styles.backButtonText}>Wróć</Text>
                  </TouchableOpacity>

                  <Text style={styles.formTitle}>
                    {isRegistering ? 'Rejestracja' : 'Logowanie'}
                  </Text>

                  <View style={styles.inputContainer}>
                    <Icon name="email-outline" size={20} color="#666666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Icon name="lock-outline" size={20} color="#666666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Hasło"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    >
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#666666"
                      />
                    </TouchableOpacity>
                  </View>

                  {isRegistering && (
                    <View style={styles.inputContainer}>
                      <Icon name="lock-check-outline" size={20} color="#666666" />
                      <TextInput
                        style={styles.input}
                        placeholder="Potwierdź hasło"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                      />
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleEmailAuth}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {isRegistering ? 'Zarejestruj się' : 'Zaloguj się'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setIsRegistering(!isRegistering)}
                    disabled={isLoading}
                  >
                    <Text style={styles.switchAuthText}>
                      {isRegistering
                        ? 'Masz już konto? Zaloguj się'
                        : 'Nie masz konta? Zarejestruj się'}
                    </Text>
                  </TouchableOpacity>

                  {!isRegistering && (
                    <TouchableOpacity disabled={isLoading}>
                      <Text style={styles.forgotPasswordText}>
                        Zapomniałeś hasła?
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#2196F3" />
                  <Text style={styles.loadingText}>
                    Przenosimy Twoje dane...
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 22,
  },
  migrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  migrationText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 8,
    flex: 1,
  },
  socialButtons: {
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999999',
    fontSize: 14,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 8,
  },
  features: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333333',
  },
  passwordToggle: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  switchAuthText: {
    fontSize: 14,
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});

export default LoginModal;
