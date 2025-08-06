import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo, useState } from 'react';
import { RootState, AppDispatch } from '../store/store';
import { 
  createFamily,
  joinFamily,
  leaveFamily,
  inviteFamilyMember,
  removeFamilyMember,
  updateFamilySettings,
  fetchFamilyMembers,
  acceptFamilyInvite,
  declineFamilyInvite
} from '../store/slices/familySlice';
import { FamilyMember, FamilyInvite, FamilySettings, FamilyRole } from '../types/models';

export interface UseFamilyReturn {
  // State
  family: {
    id: string | null;
    name: string;
    members: FamilyMember[];
    settings: FamilySettings;
    invites: FamilyInvite[];
  };
  currentMember: FamilyMember | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createNewFamily: (name: string, settings?: Partial<FamilySettings>) => Promise<string>;
  joinExistingFamily: (inviteCode: string) => Promise<void>;
  leaveFamilyGroup: () => Promise<void>;
  inviteMember: (email: string, role?: FamilyRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateSettings: (settings: Partial<FamilySettings>) => Promise<void>;
  loadFamilyMembers: () => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;
  
  // Computed values
  isOwner: boolean;
  isAdmin: boolean;
  canInviteMembers: boolean;
  canManageSettings: boolean;
  canRemoveMembers: boolean;
  memberCount: number;
  activeMembers: FamilyMember[];
  pendingInvites: FamilyInvite[];
  familyStatistics: {
    totalProducts: number;
    totalRecipes: number;
    totalShoppingLists: number;
    memberActivity: Record<string, number>;
  };
}

export const useFamily = (): UseFamilyReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const familyState = useSelector((state: RootState) => state.family);
  const { user } = useSelector((state: RootState) => state.auth);
  const { products } = useSelector((state: RootState) => state.products);
  const { recipes } = useSelector((state: RootState) => state.recipes);
  const { lists } = useSelector((state: RootState) => state.shopping);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current user's family member data
  const currentMember = useMemo(() => 
    familyState.family?.members.find(member => member.userId === user?.uid) || null
  , [familyState.family?.members, user?.uid]);

  // Permission checks
  const isOwner = currentMember?.role === 'owner';
  const isAdmin = currentMember?.role === 'admin' || isOwner;
  const canInviteMembers = isAdmin || familyState.family?.settings?.allowMemberInvites;
  const canManageSettings = isOwner;
  const canRemoveMembers = isAdmin;

  // Active members (not pending)
  const activeMembers = useMemo(() => 
    familyState.family?.members.filter(member => member.status === 'active') || []
  , [familyState.family?.members]);

  // Pending invites
  const pendingInvites = useMemo(() => 
    familyState.family?.invites.filter(invite => invite.status === 'pending') || []
  , [familyState.family?.invites]);

  // Family statistics
  const familyStatistics = useMemo(() => {
    const memberActivity: Record<string, number> = {};
    
    // Count products by member
    products.forEach(product => {
      if (product.ownerId) {
        memberActivity[product.ownerId] = (memberActivity[product.ownerId] || 0) + 1;
      }
    });
    
    // Count recipes by member
    recipes.forEach(recipe => {
      if (recipe.authorId) {
        memberActivity[recipe.authorId] = (memberActivity[recipe.authorId] || 0) + 1;
      }
    });

    return {
      totalProducts: products.length,
      totalRecipes: recipes.length,
      totalShoppingLists: lists.length,
      memberActivity,
    };
  }, [products, recipes, lists]);

  // Create new family
  const createNewFamily = useCallback(async (name: string, settings?: Partial<FamilySettings>) => {
    setIsProcessing(true);
    try {
      const familyId = await dispatch(createFamily({ 
        name, 
        ownerId: user?.uid || '',
        settings 
      })).unwrap();
      return familyId;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, user?.uid]);

  // Join existing family
  const joinExistingFamily = useCallback(async (inviteCode: string) => {
    setIsProcessing(true);
    try {
      await dispatch(joinFamily({ 
        inviteCode,
        userId: user?.uid || '',
        userName: user?.displayName || 'Unknown User'
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, user?.uid, user?.displayName]);

  // Leave family
  const leaveFamilyGroup = useCallback(async () => {
    if (!familyState.family?.id || !user?.uid) return;
    
    setIsProcessing(true);
    try {
      await dispatch(leaveFamily({ 
        familyId: familyState.family.id,
        userId: user.uid
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, familyState.family?.id, user?.uid]);

  // Invite family member
  const inviteMember = useCallback(async (email: string, role: FamilyRole = 'member') => {
    if (!familyState.family?.id || !canInviteMembers) return;
    
    setIsProcessing(true);
    try {
      await dispatch(inviteFamilyMember({ 
        familyId: familyState.family.id,
        email,
        role,
        invitedBy: user?.uid || ''
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, familyState.family?.id, canInviteMembers, user?.uid]);

  // Remove family member
  const removeMember = useCallback(async (memberId: string) => {
    if (!familyState.family?.id || !canRemoveMembers) return;
    
    setIsProcessing(true);
    try {
      await dispatch(removeFamilyMember({ 
        familyId: familyState.family.id,
        memberId
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, familyState.family?.id, canRemoveMembers]);

  // Update family settings
  const updateSettings = useCallback(async (settings: Partial<FamilySettings>) => {
    if (!familyState.family?.id || !canManageSettings) return;
    
    setIsProcessing(true);
    try {
      await dispatch(updateFamilySettings({ 
        familyId: familyState.family.id,
        settings
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, familyState.family?.id, canManageSettings]);

  // Load family members
  const loadFamilyMembers = useCallback(async () => {
    if (!familyState.family?.id) return;
    
    try {
      await dispatch(fetchFamilyMembers({ 
        familyId: familyState.family.id 
      })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch, familyState.family?.id]);

  // Accept family invite
  const acceptInvite = useCallback(async (inviteId: string) => {
    setIsProcessing(true);
    try {
      await dispatch(acceptFamilyInvite({ 
        inviteId,
        userId: user?.uid || ''
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, user?.uid]);

  // Decline family invite
  const declineInvite = useCallback(async (inviteId: string) => {
    setIsProcessing(true);
    try {
      await dispatch(declineFamilyInvite({ 
        inviteId,
        userId: user?.uid || ''
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, user?.uid]);

  return {
    // State
    family: {
      id: familyState.family?.id || null,
      name: familyState.family?.name || '',
      members: familyState.family?.members || [],
      settings: familyState.family?.settings || {} as FamilySettings,
      invites: familyState.family?.invites || [],
    },
    currentMember,
    isLoading: familyState.loading || isProcessing,
    error: familyState.error,
    
    // Actions
    createNewFamily,
    joinExistingFamily,
    leaveFamilyGroup,
    inviteMember,
    removeMember,
    updateSettings,
    loadFamilyMembers,
    acceptInvite,
    declineInvite,
    
    // Computed values
    isOwner,
    isAdmin,
    canInviteMembers,
    canManageSettings,
    canRemoveMembers,
    memberCount: activeMembers.length,
    activeMembers,
    pendingInvites,
    familyStatistics,
  };
};
