import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState, AppDispatch } from '../store/store';
import { RootStackParamList } from '../navigation/AppNavigator';
import { signOut } from '../store/slices/authSlice';
import {
  updateNotificationSettings,
  updateDisplaySettings,
  updatePrivacySettings,
} from '../store/slices/preferencesSlice';
import LoginModal from '../components/auth/LoginModal';
import FamilyManager from '../components/auth/FamilyManager';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user, isAnonymous, isPro } = useSelector((state: RootState) => state.auth);
  const { preferences } = useSelector((state: RootState) => state.preferences);
  const { ecoStats } = useSelector((state: RootState) => state.stats);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFamilyManager, setShowFamilyManager] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Wyloguj się',
      isAnonymous
        ? 'W wersji darmowej stracisz dostęp do swoich danych po wylogowaniu.'
        : 'Czy na pewno chcesz się wylogować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Wyloguj',
          style: 'destructive',
          onPress: () => dispatch(signOut()),
        },
      ]
    );
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Icon name={icon} size={24} color="#666666" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Icon name="chevron-right" size={24} color="#999999" />)}
    </TouchableOpacity>
  );

  const renderToggle = (
    icon: string,
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    renderSettingItem(
      icon,
      title,
      undefined,
      undefined,
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: '#81C784' }}
        thumbColor={value ? '#4CAF50' : '#F5F5F5'}
      />
    )
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Account Section */}
      {renderSection('Konto', (
        <>
          <View style={styles.accountInfo}>
            <View style={styles.accountAvatar}>
              <Icon name="account-circle" size={60} color="#E0E0E0" />
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>{user?.displayName || 'Użytkownik'}</Text>
              <Text style={styles.accountEmail}>
                {isAnonymous ? 'Konto anonimowe' : user?.email}
              </Text>
              <View style={styles.accountBadge}>
                <Icon
                  name={isPro ? 'crown' : 'account'}
                  size={16}
                  color={isPro ? '#FFC107' : '#666666'}
                />
                <Text style={[styles.accountBadgeText, isPro && styles.proBadgeText]}>
                  {isPro ? 'PRO' : 'Darmowe'}
                </Text>
              </View>
            </View>
          </View>

          {!isPro && renderSettingItem(
            'crown',
            'Ulepsz do PRO',
            'Odblokuj wszystkie funkcje',
            () => navigation.navigate('Subscription')
          )}

          {isAnonymous && renderSettingItem(
            'login',
            'Zaloguj się',
            'Synchronizuj dane między urządzeniami',
            () => setShowLoginModal(true)
          )}

          {!isAnonymous && renderSettingItem(
            'logout',
            'Wyloguj się',
            undefined,
            handleSignOut
          )}
        </>
      ))}

      {/* Family Section (PRO) */}
      {isPro && renderSection('Rodzina', (
        <>
          {renderSettingItem(
            'account-group',
            'Zarządzaj rodziną',
            user?.familyId ? 'Współdzielisz spiżarnię' : 'Zaproś członków rodziny',
            () => setShowFamilyManager(true)
          )}
        </>
      ))}

      {/* Notifications */}
      {renderSection('Powiadomienia', (
        <>
          {renderToggle(
            'bell',
            'Przypomnienia o dacie ważności',
            preferences.notifications.expiryReminders,
            (value) => dispatch(updateNotificationSettings({ expiryReminders: value }))
          )}
          
          {isPro && (
            <>
              {renderToggle(
                'account-multiple',
                'Powiadomienia rodzinne',
                preferences.notifications.familyUpdates,
                (value) => dispatch(updateNotificationSettings({ familyUpdates: value }))
              )}
              
              {renderToggle(
                'calendar-check',
                'Cotygodniowe podsumowanie',
                preferences.notifications.weeklyReport,
                (value) => dispatch(updateNotificationSettings({ weeklyReport: value }))
              )}
              
              {renderToggle(
                'lightbulb',
                'Sugestie przepisów',
                preferences.notifications.recipeSuggestions,
                (value) => dispatch(updateNotificationSettings({ recipeSuggestions: value }))
              )}
            </>
          )}
        </>
      ))}

      {/* Display */}
      {renderSection('Wyświetlanie', (
        <>
          {renderSettingItem(
            'view-grid',
            'Domyślny widok',
            preferences.display.defaultView === 'grid' ? 'Siatka' : 'Lista',
            () => {
              const newView = preferences.display.defaultView === 'grid' ? 'list' : 'grid';
              dispatch(updateDisplaySettings({ defaultView: newView }));
            }
          )}
          
          {renderToggle(
            'eye-check',
            'Pokaż szacowane daty',
            preferences.display.showEstimatedDates,
            (value) => dispatch(updateDisplaySettings({ showEstimatedDates: value }))
          )}
        </>
      ))}

      {/* Stats (PRO) */}
      {isPro && ecoStats && renderSection('Statystyki', (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="currency-usd" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>{ecoStats.moneySaved.toFixed(2)} zł</Text>
            <Text style={styles.statLabel}>Zaoszczędzone</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="leaf" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>{ecoStats.co2Reduced.toFixed(1)} kg</Text>
            <Text style={styles.statLabel}>CO₂ zredukowane</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="water" size={32} color="#2196F3" />
            <Text style={styles.statValue}>{ecoStats.waterSaved.toFixed(0)} L</Text>
            <Text style={styles.statLabel}>Wody zaoszczędzone</Text>
          </View>
        </View>
      ))}

      {/* Privacy */}
      {isPro && renderSection('Prywatność', (
        <>
          {renderToggle(
            'share',
            'Udostępniaj statystyki rodzinie',
            preferences.privacy.shareStatsWithFamily,
            (value) => dispatch(updatePrivacySettings({ shareStatsWithFamily: value }))
          )}
          
          {renderToggle(
            'account-multiple-check',
            'Przepisy społeczności',
            preferences.privacy.allowCommunityRecipes,
            (value) => dispatch(updatePrivacySettings({ allowCommunityRecipes: value }))
          )}
        </>
      ))}

      {/* Other */}
      {renderSection('Inne', (
        <>
          {renderSettingItem(
            'trophy',
            'Osiągnięcia',
            'Zobacz swoje postępy',
            () => navigation.navigate('Achievements')
          )}
          
          {renderSettingItem(
            'bell-ring',
            'Historia powiadomień',
            undefined,
            () => navigation.navigate('Notifications')
          )}
          
          {renderSettingItem(
            'help-circle',
            'Pomoc i wsparcie',
            undefined,
            () => {/* Open help */}
          )}
          
          {renderSettingItem(
            'information',
            'O aplikacji',
            'Wersja 3.0.0',
            () => {/* Show about */}
          )}
        </>
      ))}

      {/* Modals */}
      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          Alert.alert('Sukces', 'Zalogowano pomyślnie!');
        }}
      />

      {showFamilyManager && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Zarządzanie rodziną</Text>
              <TouchableOpacity onPress={() => setShowFamilyManager(false)}>
                <Icon name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            <FamilyManager />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  accountAvatar: {
    marginRight: 16,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  accountEmail: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  accountBadgeText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  proBadgeText: {
    color: '#FFC107',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
});

export default SettingsScreen;
