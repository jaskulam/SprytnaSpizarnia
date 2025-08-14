export interface User {
  id: string;
  email: string | null;
  displayName: string;
  isAnonymous: boolean;
  provider?: 'google' | 'apple' | 'email' | 'anonymous';
  photoURL?: string | null;
  isPro: boolean;
  familyId?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    expiryWarnings: boolean;
    familyUpdates: boolean;
    weeklyReport: boolean;
  };
  defaultLocation: string;
  theme: 'light' | 'dark' | 'system';
  language: 'pl' | 'en';
}

export interface FamilyMember {
  id: string;
  email: string;
  displayName: string;
  status: 'active' | 'pending';
  invitedAt: Date;
  joinedAt?: Date;
  role: 'owner' | 'member';
}
