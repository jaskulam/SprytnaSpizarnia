import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Family, FamilyMember, FamilyInvite, FamilySettings, FamilyRole } from '../../types/models';
import { FirestoreService } from '../../services/firebase/firestore';
import { CloudFunctionsService } from '../../services/firebase/functions';
import { RootState } from '../store';

interface FamilyState {
  family: Family | null;
  members: FamilyMember[];
  invites: FamilyInvite[];
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}

const initialState: FamilyState = {
  family: null,
  members: [],
  invites: [],
  isLoading: false,
  error: null,
  lastSync: null,
};

// Async Thunks
export const createFamily = createAsyncThunk(
  'family/create',
  async ({ 
    name, 
    ownerId, 
    settings 
  }: { 
    name: string; 
    ownerId: string; 
    settings?: Partial<FamilySettings> 
  }) => {
    const familyData: Omit<Family, 'id'> = {
      name,
      ownerId,
      members: [
        {
          userId: ownerId,
          role: 'owner',
          joinedAt: new Date(),
          status: 'active',
        }
      ],
      settings: {
        allowMemberInvites: true,
        shareProducts: true,
        shareRecipes: true,
        shareShoppingLists: true,
        notifications: true,
        ...settings,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const family = await FirestoreService.createFamily(familyData);
    return family;
  }
);

export const joinFamily = createAsyncThunk(
  'family/join',
  async ({ 
    inviteCode, 
    userId, 
    userName 
  }: { 
    inviteCode: string; 
    userId: string; 
    userName: string 
  }) => {
    const result = await CloudFunctionsService.joinFamily(inviteCode, userId, userName);
    
    if (result.success) {
      const family = await FirestoreService.getFamily(result.familyId);
      return family;
    }
    
    throw new Error('Failed to join family');
  }
);

export const leaveFamily = createAsyncThunk(
  'family/leave',
  async ({ 
    familyId, 
    userId 
  }: { 
    familyId: string; 
    userId: string 
  }) => {
    const family = await FirestoreService.getFamily(familyId);
    if (!family) throw new Error('Family not found');
    
    const updatedMembers = family.members.filter(member => member.userId !== userId);
    
    await FirestoreService.updateFamily(familyId, {
      members: updatedMembers,
      updatedAt: new Date(),
    });
    
    return userId;
  }
);

export const inviteFamilyMember = createAsyncThunk(
  'family/inviteMember',
  async ({ 
    familyId, 
    email, 
    role = 'member',
    invitedBy 
  }: { 
    familyId: string; 
    email: string; 
    role?: FamilyRole;
    invitedBy: string;
  }) => {
    const family = await FirestoreService.getFamily(familyId);
    if (!family) throw new Error('Family not found');
    
    const result = await CloudFunctionsService.sendFamilyInvite(
      familyId, 
      email, 
      family.name, 
      role
    );
    
    const invite: FamilyInvite = {
      id: result.inviteId,
      familyId,
      email,
      role,
      invitedBy,
      inviteCode: result.inviteCode,
      status: 'pending',
      expiresAt: result.expiresAt,
      createdAt: new Date(),
    };
    
    return invite;
  }
);

export const removeFamilyMember = createAsyncThunk(
  'family/removeMember',
  async ({ 
    familyId, 
    memberId 
  }: { 
    familyId: string; 
    memberId: string 
  }) => {
    const family = await FirestoreService.getFamily(familyId);
    if (!family) throw new Error('Family not found');
    
    const updatedMembers = family.members.filter(member => member.userId !== memberId);
    
    await FirestoreService.updateFamily(familyId, {
      members: updatedMembers,
      updatedAt: new Date(),
    });
    
    return memberId;
  }
);

export const updateFamilySettings = createAsyncThunk(
  'family/updateSettings',
  async ({ 
    familyId, 
    settings 
  }: { 
    familyId: string; 
    settings: Partial<FamilySettings> 
  }) => {
    const family = await FirestoreService.getFamily(familyId);
    if (!family) throw new Error('Family not found');
    
    const updatedSettings = { ...family.settings, ...settings };
    
    await FirestoreService.updateFamily(familyId, {
      settings: updatedSettings,
      updatedAt: new Date(),
    });
    
    return { familyId, settings: updatedSettings };
  }
);

export const fetchFamilyMembers = createAsyncThunk(
  'family/fetchMembers',
  async ({ familyId }: { familyId: string }) => {
    const family = await FirestoreService.getFamily(familyId);
    if (!family) throw new Error('Family not found');
    
    return family.members;
  }
);

export const acceptFamilyInvite = createAsyncThunk(
  'family/acceptInvite',
  async ({ 
    inviteId, 
    userId 
  }: { 
    inviteId: string; 
    userId: string 
  }) => {
    // This would be implemented based on your invite system
    // For now, we'll simulate the acceptance
    return { inviteId, userId };
  }
);

export const declineFamilyInvite = createAsyncThunk(
  'family/declineInvite',
  async ({ 
    inviteId, 
    userId 
  }: { 
    inviteId: string; 
    userId: string 
  }) => {
    // This would be implemented based on your invite system
    return { inviteId, userId };
  }
);

// Main slice
const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    setFamily: (state, action: PayloadAction<Family | null>) => {
      state.family = action.payload;
      state.members = action.payload?.members || [];
    },
    
    setMembers: (state, action: PayloadAction<FamilyMember[]>) => {
      state.members = action.payload;
      if (state.family) {
        state.family.members = action.payload;
      }
    },
    
    addMember: (state, action: PayloadAction<FamilyMember>) => {
      state.members.push(action.payload);
      if (state.family) {
        state.family.members.push(action.payload);
      }
    },
    
    removeMember: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.members = state.members.filter(member => member.userId !== userId);
      if (state.family) {
        state.family.members = state.family.members.filter(member => member.userId !== userId);
      }
    },
    
    updateMember: (state, action: PayloadAction<{ userId: string; updates: Partial<FamilyMember> }>) => {
      const { userId, updates } = action.payload;
      
      const memberIndex = state.members.findIndex(member => member.userId === userId);
      if (memberIndex !== -1) {
        state.members[memberIndex] = { ...state.members[memberIndex], ...updates };
      }
      
      if (state.family) {
        const familyMemberIndex = state.family.members.findIndex(member => member.userId === userId);
        if (familyMemberIndex !== -1) {
          state.family.members[familyMemberIndex] = { 
            ...state.family.members[familyMemberIndex], 
            ...updates 
          };
        }
      }
    },
    
    addInvite: (state, action: PayloadAction<FamilyInvite>) => {
      state.invites.push(action.payload);
    },
    
    removeInvite: (state, action: PayloadAction<string>) => {
      state.invites = state.invites.filter(invite => invite.id !== action.payload);
    },
    
    updateInvite: (state, action: PayloadAction<{ id: string; updates: Partial<FamilyInvite> }>) => {
      const { id, updates } = action.payload;
      const inviteIndex = state.invites.findIndex(invite => invite.id === id);
      if (inviteIndex !== -1) {
        state.invites[inviteIndex] = { ...state.invites[inviteIndex], ...updates };
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    clearFamily: (state) => {
      state.family = null;
      state.members = [];
      state.invites = [];
    },
  },
  
  extraReducers: (builder) => {
    // Create family
    builder
      .addCase(createFamily.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFamily.fulfilled, (state, action) => {
        state.isLoading = false;
        state.family = action.payload;
        state.members = action.payload.members;
        state.lastSync = new Date();
      })
      .addCase(createFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create family';
      });
    
    // Join family
    builder
      .addCase(joinFamily.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinFamily.fulfilled, (state, action) => {
        state.isLoading = false;
        state.family = action.payload;
        state.members = action.payload.members;
        state.lastSync = new Date();
      })
      .addCase(joinFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to join family';
      });
    
    // Leave family
    builder
      .addCase(leaveFamily.fulfilled, (state, action) => {
        const userId = action.payload;
        state.members = state.members.filter(member => member.userId !== userId);
        if (state.family) {
          state.family.members = state.family.members.filter(member => member.userId !== userId);
        }
      })
      .addCase(leaveFamily.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to leave family';
      });
    
    // Invite member
    builder
      .addCase(inviteFamilyMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(inviteFamilyMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invites.push(action.payload);
      })
      .addCase(inviteFamilyMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to send invite';
      });
    
    // Remove member
    builder
      .addCase(removeFamilyMember.fulfilled, (state, action) => {
        const memberId = action.payload;
        state.members = state.members.filter(member => member.userId !== memberId);
        if (state.family) {
          state.family.members = state.family.members.filter(member => member.userId !== memberId);
        }
      })
      .addCase(removeFamilyMember.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to remove member';
      });
    
    // Update settings
    builder
      .addCase(updateFamilySettings.fulfilled, (state, action) => {
        const { settings } = action.payload;
        if (state.family) {
          state.family.settings = settings;
        }
      })
      .addCase(updateFamilySettings.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update settings';
      });
    
    // Fetch members
    builder
      .addCase(fetchFamilyMembers.fulfilled, (state, action) => {
        state.members = action.payload;
        if (state.family) {
          state.family.members = action.payload;
        }
        state.lastSync = new Date();
      })
      .addCase(fetchFamilyMembers.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch members';
      });
  },
});

export const {
  setFamily,
  setMembers,
  addMember,
  removeMember,
  updateMember,
  addInvite,
  removeInvite,
  updateInvite,
  clearError,
  clearFamily,
} = familySlice.actions;

export default familySlice.reducer;
