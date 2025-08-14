import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { FamilyMember } from '../../types/family';
import { colors, spacing, typography } from '../../themes';

interface FamilyMemberCardProps {
  member: FamilyMember;
  isOwner: boolean;
  currentUserId?: string;
  onRemove: () => void;
}

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  isOwner,
  currentUserId,
  onRemove,
}) => {
  const isCurrentUser = member.id === currentUserId;
  const canRemove = isOwner && !isCurrentUser && member.role !== 'owner';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        {member.photoURL ? (
          <Image source={{ uri: member.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{getInitials(member.displayName || member.email)}</Text>
          </View>
        )}
        
        <View style={styles.info}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{member.displayName || member.email}</Text>
            {isCurrentUser && (
              <Text style={styles.youBadge}>(Ty)</Text>
            )}
            {member.role === 'owner' && (
              <View style={styles.ownerBadge}>
                <Icon name="crown" size={12} color={colors.warning} />
              </View>
            )}
          </View>
          <Text style={styles.email}>{member.email}</Text>
          <Text style={styles.joinDate}>
            Dołączył: {member.joinedAt ? member.joinedAt.toLocaleDateString('pl-PL') : '-'}
          </Text>
        </View>
      </View>

      {canRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
        >
          <Icon name="account-remove" size={24} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  info: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  youBadge: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  ownerBadge: {
    marginLeft: spacing.xs,
  },
  email: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  joinDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    padding: spacing.sm,
  },
});

export default FamilyMemberCard;
