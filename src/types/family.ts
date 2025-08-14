export type FamilyRole = 'owner' | 'member';
export type FamilyMemberStatus = 'active' | 'pending' | 'removed';
export type FamilyInviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface FamilyMember {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  status: FamilyMemberStatus;
  role: FamilyRole;
  joinedAt?: Date;
  invitedAt?: Date;
}

export interface FamilyInvite {
  id: string;
  familyId: string;
  inviterUserId: string;
  email: string;
  status: FamilyInviteStatus;
  createdAt?: Date;
  expiresAt?: Date;
  acceptedAt?: Date;
  acceptedByUserId?: string;
}
