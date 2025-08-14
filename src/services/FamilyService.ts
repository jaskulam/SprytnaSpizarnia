import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import { FamilyMember, FamilyInvite } from '../types/family';

class FamilyService {
  private familiesCollection = firestore().collection('families');
  private invitesCollection = firestore().collection('familyInvites');

  async createFamily(userId: string, familyName: string): Promise<string> {
    try {
      const familyRef = await this.familiesCollection.add({
        name: familyName,
        ownerId: userId,
        members: [
          {
            userId,
            role: 'owner',
            joinedAt: firestore.FieldValue.serverTimestamp(),
          },
        ],
        createdAt: firestore.FieldValue.serverTimestamp(),
        settings: {
          allowMemberInvites: true,
          requireOwnerApproval: false,
        },
      });

      await firestore().collection('users').doc(userId).update({
        familyId: familyRef.id,
        familyRole: 'owner',
      });

      return familyRef.id;
    } catch (error) {
      console.error('Error creating family:', error);
      throw error;
    }
  }

  async sendInvite(
    familyId: string,
    inviterUserId: string,
    inviteeEmail: string,
  ): Promise<void> {
    try {
      const existingUser = await firestore()
        .collection('users')
        .where('email', '==', inviteeEmail)
        .where('familyId', '==', familyId)
        .get();

      if (!existingUser.empty) {
        throw new Error('Użytkownik jest już członkiem rodziny');
      }

      const existingInvite = await this.invitesCollection
        .where('email', '==', inviteeEmail)
        .where('familyId', '==', familyId)
        .where('status', '==', 'pending')
        .get();

      if (!existingInvite.empty) {
        throw new Error('Zaproszenie już zostało wysłane');
      }

      const inviteRef = await this.invitesCollection.add({
        familyId,
        inviterUserId,
        email: inviteeEmail,
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
        expiresAt: firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      });

      const sendInviteEmail = functions().httpsCallable('sendFamilyInviteEmail');
      const inviterSnap = await firestore().collection('users').doc(inviterUserId).get();
      await sendInviteEmail({
        inviteId: inviteRef.id,
        email: inviteeEmail,
        inviterName: inviterSnap.data()?.displayName,
      });
    } catch (error) {
      console.error('Error sending invite:', error);
      throw error;
    }
  }

  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    try {
      const familyDoc = await this.familiesCollection.doc(familyId).get();
      if (!familyDoc.exists) {
        throw new Error('Rodzina nie istnieje');
      }

      const memberIds = familyDoc.data()?.members.map((m: any) => m.userId) || [];
      if (memberIds.length === 0) return [];

      const usersSnapshot = await firestore()
        .collection('users')
        .where(firestore.FieldPath.documentId(), 'in', memberIds)
        .get();

      const members: FamilyMember[] = [];
      const familyMembers = familyDoc.data()?.members || [];

      usersSnapshot.docs.forEach((doc) => {
        const userData = doc.data();
        const memberInfo = familyMembers.find((m: any) => m.userId === doc.id);

        members.push({
          id: doc.id,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          status: 'active',
          joinedAt: memberInfo?.joinedAt?.toDate?.() || new Date(),
          role: memberInfo?.role || 'member',
        });
      });

      return members;
    } catch (error) {
      console.error('Error fetching family members:', error);
      throw error;
    }
  }

  async getPendingInvites(familyId: string): Promise<FamilyInvite[]> {
    try {
      const snapshot = await this.invitesCollection
        .where('familyId', '==', familyId)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc) =>
        ({
          id: doc.id,
          ...(doc.data() as any),
          createdAt: (doc.data() as any)?.createdAt?.toDate?.(),
          expiresAt: (doc.data() as any)?.expiresAt?.toDate?.(),
        }) as FamilyInvite,
      );
    } catch (error) {
      console.error('Error fetching invites:', error);
      return [];
    }
  }

  async acceptInvite(inviteId: string, userId: string): Promise<void> {
    try {
      const inviteDoc = await this.invitesCollection.doc(inviteId).get();
      if (!inviteDoc.exists) {
        throw new Error('Zaproszenie nie istnieje');
      }

      const invite = inviteDoc.data() as any;
      if (invite?.status !== 'pending') {
        throw new Error('Zaproszenie już zostało wykorzystane');
      }

      await firestore().runTransaction(async (transaction) => {
        transaction.update(inviteDoc.ref, {
          status: 'accepted',
          acceptedAt: firestore.FieldValue.serverTimestamp(),
          acceptedByUserId: userId,
        });

        const familyRef = this.familiesCollection.doc(invite.familyId);
        transaction.update(familyRef, {
          members: firestore.FieldValue.arrayUnion({
            userId,
            role: 'member',
            joinedAt: firestore.FieldValue.serverTimestamp(),
          }),
        });

        const userRef = firestore().collection('users').doc(userId);
        transaction.update(userRef, {
          familyId: invite.familyId,
          familyRole: 'member',
        });
      });
    } catch (error) {
      console.error('Error accepting invite:', error);
      throw error;
    }
  }

  async removeMember(familyId: string, memberUserId: string, requesterId: string): Promise<void> {
    try {
      const familyDoc = await this.familiesCollection.doc(familyId).get();
      if (familyDoc.data()?.ownerId !== requesterId) {
        throw new Error('Tylko właściciel może usuwać członków');
      }

      if (memberUserId === requesterId) {
        throw new Error('Nie możesz usunąć siebie jako właściciela');
      }

      await firestore().runTransaction(async (transaction) => {
        const familyRef = this.familiesCollection.doc(familyId);
        const familyData = (await transaction.get(familyRef)).data();
        const updatedMembers = familyData?.members?.filter((m: any) => m.userId !== memberUserId) || [];

        transaction.update(familyRef, { members: updatedMembers });

        const userRef = firestore().collection('users').doc(memberUserId);
        transaction.update(userRef, {
          familyId: firestore.FieldValue.delete(),
          familyRole: firestore.FieldValue.delete(),
        });
      });
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  async leaveFamily(userId: string, familyId: string): Promise<void> {
    try {
      const familyDoc = await this.familiesCollection.doc(familyId).get();
      if (familyDoc.data()?.ownerId === userId) {
        throw new Error('Właściciel nie może opuścić rodziny. Przekaż własność innemu członkowi.');
      }

      await firestore().runTransaction(async (transaction) => {
        const familyRef = this.familiesCollection.doc(familyId);
        const familyData = (await transaction.get(familyRef)).data();
        const updatedMembers = familyData?.members?.filter((m: any) => m.userId !== userId) || [];

        transaction.update(familyRef, { members: updatedMembers });

        const userRef = firestore().collection('users').doc(userId);
        transaction.update(userRef, {
          familyId: firestore.FieldValue.delete(),
          familyRole: firestore.FieldValue.delete(),
        });
      });
    } catch (error) {
      console.error('Error leaving family:', error);
      throw error;
    }
  }

  subscribeFamilyUpdates(
    familyId: string,
    onUpdate: (members: FamilyMember[]) => void,
    onError: (error: Error) => void,
  ): () => void {
    return this.familiesCollection.doc(familyId).onSnapshot(
      async (snapshot) => {
        if (!snapshot.exists) {
          onError(new Error('Rodzina nie istnieje'));
          return;
        }
        try {
          const members = await this.getFamilyMembers(familyId);
          onUpdate(members);
        } catch (error) {
          onError(error as Error);
        }
      },
      onError,
    );
  }
}

export default new FamilyService();
