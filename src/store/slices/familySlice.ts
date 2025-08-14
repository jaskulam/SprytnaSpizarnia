import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import familyService from '../../services/FamilyService';
import { FamilyMember, FamilyInvite } from '../../types/family';
import { RootState } from '../store';

interface FamilyState {
  familyId: string | null;
  members: FamilyMember[];
  pendingInvites: FamilyInvite[];
  isLoading: boolean;
  error: string | null;
  isOwner: boolean;
}

const initialState: FamilyState = {
  familyId: null,
  members: [],
  pendingInvites: [],
  isLoading: false,
  error: null,
  isOwner: false,
};

// Async thunks
export const createFamily = createAsyncThunk(
  'family/create',
  async ({ userId, familyName }: { userId: string; familyName: string }) => {
    const familyId = await familyService.createFamily(userId, familyName);
    return { familyId, userId };
  },
);

export const fetchFamilyMembers = createAsyncThunk(
  'family/fetchMembers',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const familyId = state.auth.user?.familyId || state.family.familyId;
    const userId = state.auth.user?.id || null;

    if (!familyId) throw new Error('Nie jesteś członkiem żadnej rodziny');

    const members = await familyService.getFamilyMembers(familyId);
    const invites = await familyService.getPendingInvites(familyId);

    return { members, invites, familyId, userId };
  },
);

export const sendFamilyInvite = createAsyncThunk(
  'family/sendInvite',
  async ({ email }: { email: string }, { getState }) => {
    const state = getState() as RootState;
    const familyId = state.auth.user?.familyId || state.family.familyId;
    const userId = state.auth.user?.id;

    if (!familyId || !userId) throw new Error('Błąd autoryzacji');

    await familyService.sendInvite(familyId, userId, email);
    return email;
  },
);

export const removeFamilyMember = createAsyncThunk(
  'family/removeMember',
  async ({ memberUserId }: { memberUserId: string }, { getState }) => {
    const state = getState() as RootState;
    const familyId = state.auth.user?.familyId || state.family.familyId;
    const requesterId = state.auth.user?.id;

    if (!familyId || !requesterId) throw new Error('Błąd autoryzacji');

    await familyService.removeMember(familyId, memberUserId, requesterId);
    return memberUserId;
  },
);

export const leaveFamily = createAsyncThunk('family/leave', async (_, { getState }) => {
  const state = getState() as RootState;
  const familyId = state.auth.user?.familyId || state.family.familyId;
  const userId = state.auth.user?.id;

  if (!familyId || !userId) throw new Error('Błąd autoryzacji');

  await familyService.leaveFamily(userId, familyId);
});

export const acceptInvite = createAsyncThunk(
  'family/acceptInvite',
  async ({ inviteId }: { inviteId: string }, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;

    if (!userId) throw new Error('Błąd autoryzacji');

    await familyService.acceptInvite(inviteId, userId);
  },
);

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    setFamilyData: (
      state,
      action: PayloadAction<{ familyId: string; members: FamilyMember[]; userId: string }>,
    ) => {
      state.familyId = action.payload.familyId;
      state.members = action.payload.members;
      state.isOwner = action.payload.members.some(
        (m) => m.id === action.payload.userId && m.role === 'owner',
      );
    },
    clearFamily: (state) => {
      state.familyId = null;
      state.members = [];
      state.pendingInvites = [];
      state.isOwner = false;
      state.error = null;
    },
    updateMemberStatus: (
      state,
      action: PayloadAction<{ memberId: string; status: FamilyMember['status'] }>,
    ) => {
      const member = state.members.find((m) => m.id === action.payload.memberId);
      if (member) {
        member.status = action.payload.status;
      }
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
        state.familyId = action.payload.familyId;
        state.isOwner = true;
      })
      .addCase(createFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd tworzenia rodziny';
      });

    // Fetch members
    builder
      .addCase(fetchFamilyMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFamilyMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload.members;
        state.pendingInvites = action.payload.invites;
        state.familyId = action.payload.familyId;
        if (action.payload.userId) {
          state.isOwner = action.payload.members.some(
            (m) => m.id === action.payload.userId && m.role === 'owner',
          );
        }
      })
      .addCase(fetchFamilyMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd pobierania członków rodziny';
      });

    // Send invite
    builder
      .addCase(sendFamilyInvite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendFamilyInvite.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendFamilyInvite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd wysyłania zaproszenia';
      });

    // Remove member
    builder
      .addCase(removeFamilyMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFamilyMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = state.members.filter((m) => m.id !== action.payload);
      })
      .addCase(removeFamilyMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd usuwania członka';
      });

    // Leave family
    builder.addCase(leaveFamily.fulfilled, (state) => {
      state.familyId = null;
      state.members = [];
      state.pendingInvites = [];
      state.isOwner = false;
    });
  },
});

export const { setFamilyData, clearFamily, updateMemberStatus } = familySlice.actions;
export default familySlice.reducer;
