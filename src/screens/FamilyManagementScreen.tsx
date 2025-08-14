import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Share } from 'react-native';

import { RootState, AppDispatch } from '@store/store';
import {
  fetchFamilyMembers,
  sendFamilyInvite,
  removeFamilyMember,
  createFamily,
  leaveFamily,
} from '@store/slices/familySlice';
import { colors, spacing, typography } from '../themes';
import Button from '@components/common/Button';
import EmptyState from '@components/common/EmptyState';
import FamilyMemberCard from '@components/family/FamilyMemberCard';
import CreateFamilyModal from '@components/family/CreateFamilyModal';

const FamilyScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { familyId, members, pendingInvites, isLoading, error, isOwner } = useSelector(
    (state: RootState) => state.family
  );
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.familyId || familyId) {
      dispatch(fetchFamilyMembers());
    }
  }, [user?.familyId, familyId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchFamilyMembers());
    setRefreshing(false);
  };

  const handleCreateFamily = async (familyName: string) => {
    if (!user) return;
    
    try {
      await dispatch(createFamily({ userId: user.id, familyName })).unwrap();
      setShowCreateModal(false);
      Alert.alert('Sukces', 'Rodzina została utworzona');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się utworzyć rodziny');
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Błąd', 'Podaj adres email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      Alert.alert('Błąd', 'Podaj prawidłowy adres email');
      return;
    }

    setIsInviting(true);
    try {
      await dispatch(sendFamilyInvite({ email: inviteEmail })).unwrap();
      Alert.alert('Sukces', `Zaproszenie wysłane do ${inviteEmail}`);
      setInviteEmail('');
    } catch (error: any) {
      Alert.alert('Błąd', error.message || 'Nie udało się wysłać zaproszenia');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = (member: any) => {
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
              await dispatch(removeFamilyMember({ memberUserId: member.id })).unwrap();
              Alert.alert('Sukces', 'Członek został usunięty');
            } catch (error) {
              Alert.alert('Błąd', 'Nie udało się usunąć członka');
            }
          },
        },
      ]
    );
  };

  const handleLeaveFamily = () => {
    Alert.alert(
      'Opuść rodzinę',
      'Czy na pewno chcesz opuścić rodzinę? Stracisz dostęp do współdzielonych produktów.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Opuść',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(leaveFamily()).unwrap();
              Alert.alert('Sukces', 'Opuściłeś rodzinę');
            } catch (error: any) {
              Alert.alert('Błąd', error.message || 'Nie udało się opuścić rodziny');
            }
          },
        },
      ]
    );
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        title: 'Zaproszenie do Sprytnej Spiżarni',
        message: `Dołącz do mojej rodziny w aplikacji Sprytna Spiżarnia!\n\nPobierz aplikację i użyj mojego kodu rodziny: ${familyId}\n\nAndroid: https://play.google.com/store/apps/details?id=com.sprytnaspizarnia\niOS: https://apps.apple.com/app/sprytna-spizarnia`,
      });
    } catch (error) {
      console.log('Share cancelled:', error);
    }
  };

  if (!user?.isPro) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="crown"
          title="Funkcja PRO"
          description="Współdzielenie z rodziną jest dostępne tylko w wersji PRO"
          actionLabel="Ulepsz do PRO"
          onAction={() => {}}
        />
      </View>
    );
  }

  if (isLoading && !refreshing && members.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!familyId) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="account-group"
          title="Brak rodziny"
          description="Utwórz rodzinę, aby współdzielić produkty z bliskimi"
          actionLabel="Utwórz rodzinę"
          onAction={() => setShowCreateModal(true)}
        />
        <CreateFamilyModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateFamily}
        />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Twoja rodzina</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareInvite}
        >
          <Icon name="share-variant" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isOwner && (
        <View style={styles.inviteSection}>
          <Text style={styles.sectionTitle}>Zaproś członków rodziny</Text>
          <View style={styles.inviteInputContainer}>
            <TextInput
              style={styles.inviteInput}
              placeholder="Email członka rodziny"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.inviteButton, isInviting && styles.inviteButtonDisabled]}
              onPress={handleSendInvite}
              disabled={isInviting}
            >
              {isInviting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Icon name="send" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>
          Członkowie ({members.length})
        </Text>
        
        {members.map((member) => (
          <FamilyMemberCard
            key={member.id}
            member={member}
            isOwner={isOwner}
            currentUserId={user?.id}
            onRemove={() => handleRemoveMember(member)}
          />
        ))}
      </View>

      {pendingInvites.length > 0 && (
        <View style={styles.invitesSection}>
          <Text style={styles.sectionTitle}>
            Oczekujące zaproszenia ({pendingInvites.length})
          </Text>
          
          {pendingInvites.map((invite) => (
            <View key={invite.id} style={styles.inviteCard}>
              <Icon name="email-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.inviteEmail}>{invite.email}</Text>
              <Text style={styles.inviteStatus}>Oczekuje</Text>
            </View>
          ))}
        </View>
      )}

      {!isOwner && (
        <Button
          title="Opuść rodzinę"
          onPress={handleLeaveFamily}
          variant="outline"
          style={styles.leaveButton}
        />
      )}

      <View style={styles.infoSection}>
        <Icon name="information" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Wszyscy członkowie rodziny widzą te same produkty i mogą je edytować. 
          Zmiany synchronizują się automatycznie.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  shareButton: {
    padding: spacing.sm,
  },
  inviteSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  inviteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    ...typography.body,
  },
  inviteButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
  },
  inviteButtonDisabled: {
    opacity: 0.5,
  },
  membersSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  invitesSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inviteEmail: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  inviteStatus: {
    ...typography.caption,
    color: colors.warning,
  },
  leaveButton: {
    margin: spacing.lg,
    borderColor: colors.danger,
  },
  infoSection: {
    flexDirection: 'row',
    padding: spacing.lg,
    margin: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  infoText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default FamilyScreen;
