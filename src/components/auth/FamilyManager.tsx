import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import Clipboard from '@react-native-clipboard/clipboard';

import { RootState, AppDispatch } from '../../store/store';
import {
  fetchFamily,
  sendInvite,
  removeFromFamily,
  generateInviteCode,
  updateMemberRole,
} from '../../store/slices/familySlice';
import { FamilyMember, InviteCode } from '../../types/models';
import { formatRelativeDate, formatExpiryDate } from '../../utils/dateHelpers';

const FamilyManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { family, isLoading, error } = useSelector((state: RootState) => state.family);
  const { user } = useSelector((state: RootState) => state.auth);

  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [currentInviteCode, setCurrentInviteCode] = useState<InviteCode | null>(null);

  useEffect(() => {
    if (user?.familyId) {
      dispatch(fetchFamily(user.familyId));
    }
  }, [dispatch, user?.familyId]);

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Błąd', 'Podaj adres email');
      return;
    }

    if (!family) return;

    try {
      await dispatch(sendInvite({
        familyId: family.id,
        email: inviteEmail.trim()
      })).unwrap();

      Alert.alert('Sukces', 'Zaproszenie zostało wysłane');
      setInviteEmail('');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się wysłać zaproszenia');
    }
  };

  const handleGenerateInviteCode = async () => {
    if (!family) return;

    try {
      const code = await dispatch(generateInviteCode(family.id)).unwrap();
      setCurrentInviteCode(code);
      setShowInviteCode(true);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się wygenerować kodu');
    }
  };

  const handleShareInviteCode = async () => {
    if (!currentInviteCode) return;

    try {
      await Share.share({
        message: `Dołącz do mojej rodziny w Sprytnej Spiżarni!\n\nKod zaproszenia: ${currentInviteCode.code}\n\nPobierz aplikację i użyj tego kodu, aby uzyskać dostęp do wspólnej spiżarni.`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleCopyInviteCode = () => {
    if (!currentInviteCode) return;
    
    Clipboard.setString(currentInviteCode.code);
    Alert.alert('Skopiowano', 'Kod zaproszenia został skopiowany do schowka');
  };

  const handleRemoveMember = (memberId: string) => {
    if (!family) return;

    const member = family.members.find(m => m.userId === memberId);
    if (!member) return;

    Alert.alert(
      'Usuń członka rodziny',
      `Czy na pewno chcesz usunąć ${member.displayName} z rodziny?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(removeFromFamily({
                familyId: family.id,
                userId: memberId
              })).unwrap();
              Alert.alert('Sukces', 'Członek rodziny został usunięty');
            } catch (error) {
              Alert.alert('Błąd', 'Nie udało się usunąć członka rodziny');
            }
          }
        }
      ]
    );
  };

  const handleChangeRole = (memberId: string, newRole: 'admin' | 'member') => {
    if (!family) return;

    const member = family.members.find(m => m.userId === memberId);
    if (!member) return;

    Alert.alert(
      'Zmień rolę',
      `Czy chcesz ${newRole === 'admin' ? 'nadać' : 'odebrać'} uprawnienia administratora dla ${member.displayName}?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Zmień',
          onPress: async () => {
            try {
              await dispatch(updateMemberRole({
                familyId: family.id,
                userId: memberId,
                role: newRole
              })).unwrap();
            } catch (error) {
              Alert.alert('Błąd', 'Nie udało się zmienić roli');
            }
          }
        }
      ]
    );
  };

  const renderMember = ({ item }: { item: FamilyMember }) => {
    const isCurrentUser = item.userId === user?.id;
    const isOwner = item.role === 'owner';
    const currentUserRole = family?.members.find(m => m.userId === user?.id)?.role;
    const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

    return (
      <View style={styles.memberItem}>
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>
              {item.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.memberDetails}>
            <View style={styles.memberHeader}>
              <Text style={styles.memberName}>
                {item.displayName}
                {isCurrentUser && ' (Ty)'}
              </Text>
              {item.role !== 'member' && (
                <View style={[
                  styles.roleBadge,
                  item.role === 'owner' && styles.ownerBadge
                ]}>
                  <Text style={styles.roleBadgeText}>
                    {item.role === 'owner' ? 'Właściciel' : 'Admin'}
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={styles.memberEmail}>{item.email}</Text>
            <Text style={styles.memberJoinDate}>
              Dołączył: {formatRelativeDate(item.joinedAt)}
            </Text>
          </View>
        </View>

        {canManage && !isCurrentUser && !isOwner && (
          <View style={styles.memberActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleChangeRole(
                item.userId,
                item.role === 'admin' ? 'member' : 'admin'
              )}
            >
              <Icon
                name={item.role === 'admin' ? 'account-remove' : 'account-star'}
                size={20}
                color="#666666"
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRemoveMember(item.userId)}
            >
              <Icon name="delete-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const Switch = ({ value, onValueChange }: { value: boolean; onValueChange: (value: boolean) => void }) => {
    return (
      <TouchableOpacity
        style={[styles.switch, value && styles.switchActive]}
        onPress={() => onValueChange(!value)}
      >
        <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
      </TouchableOpacity>
    );
  };

  if (!family) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="account-group-outline" size={80} color="#E0E0E0" />
        <Text style={styles.emptyText}>Nie należysz do żadnej rodziny</Text>
        <TouchableOpacity style={styles.createFamilyButton}>
          <Text style={styles.createFamilyButtonText}>Utwórz rodzinę</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Invite Section */}
      <View style={styles.inviteSection}>
        <Text style={styles.sectionTitle}>Zaproś do rodziny</Text>
        
        <View style={styles.inviteInputContainer}>
          <TextInput
            style={styles.inviteInput}
            placeholder="Adres email"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={handleSendInvite}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.inviteCodeButton}
          onPress={handleGenerateInviteCode}
        >
          <Icon name="ticket-outline" size={20} color="#2196F3" />
          <Text style={styles.inviteCodeButtonText}>
            Wygeneruj kod zaproszenia
          </Text>
        </TouchableOpacity>
      </View>

      {/* Members List */}
      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>
          Członkowie rodziny ({family.members.length})
        </Text>
        
        <FlatList
          data={family.members}
          keyExtractor={(item) => item.userId}
          renderItem={renderMember}
          contentContainerStyle={styles.membersList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Ustawienia rodziny</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="share-variant" size={20} color="#666666" />
            <Text style={styles.settingLabel}>Udostępnianie list zakupów</Text>
          </View>
          <Switch
            value={family.settings.shareShoppingLists}
            onValueChange={() => {}}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="calendar-sync" size={20} color="#666666" />
            <Text style={styles.settingLabel}>Udostępnianie planów posiłków</Text>
          </View>
          <Switch
            value={family.settings.shareMealPlans}
            onValueChange={() => {}}
          />
        </TouchableOpacity>
      </View>

      {/* Invite Code Modal */}
      {showInviteCode && currentInviteCode && (
        <View style={styles.inviteCodeModal}>
          <View style={styles.inviteCodeContent}>
            <Text style={styles.inviteCodeTitle}>Kod zaproszenia</Text>
            
            <View style={styles.inviteCodeDisplay}>
              <Text style={styles.inviteCode}>{currentInviteCode.code}</Text>
            </View>

            <Text style={styles.inviteCodeInfo}>
              Ważny do: {formatExpiryDate(currentInviteCode.expiresAt)}
            </Text>

            <View style={styles.inviteCodeActions}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyInviteCode}
              >
                <Icon name="content-copy" size={20} color="#2196F3" />
                <Text style={styles.copyButtonText}>Kopiuj</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareInviteCode}
              >
                <Icon name="share-variant" size={20} color="#4CAF50" />
                <Text style={styles.shareButtonText}>Udostępnij</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowInviteCode(false)}
            >
              <Text style={styles.closeModalButtonText}>Zamknij</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    marginTop: 16,
    marginBottom: 24,
  },
  createFamilyButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFamilyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inviteSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  inviteInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  inviteInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  inviteButton: {
    width: 48,
    height: 48,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
  },
  inviteCodeButtonText: {
    fontSize: 16,
    color: '#2196F3',
    marginLeft: 8,
  },
  membersSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  membersList: {
    padding: 16,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
  },
  memberDetails: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  roleBadge: {
    marginLeft: 8,
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ownerBadge: {
    backgroundColor: '#4CAF50',
  },
  roleBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666666',
  },
  memberJoinDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  inviteCodeModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  inviteCodeContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  inviteCodeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  inviteCodeDisplay: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  inviteCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    letterSpacing: 2,
  },
  inviteCodeInfo: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inviteCodeActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#2196F3',
    marginLeft: 6,
    fontSize: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 16,
  },
  closeModalButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeModalButtonText: {
    fontSize: 16,
    color: '#999999',
  },
  // Switch styles
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#4CAF50',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 0 }],
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
});

export default FamilyManager;
