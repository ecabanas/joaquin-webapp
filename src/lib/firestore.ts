
import {
  collection,
  addDoc,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDoc,
  orderBy,
  Timestamp,
  setDoc,
  limit,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import type { ListItem, Purchase, PurchaseItem, UserProfile, WorkspaceMember, Invite } from './types';
import { customAlphabet } from 'nanoid';

// User Management
export async function createUserProfile(userId: string, data: Omit<UserProfile, 'workspaceId' | 'currency'> & { email: string }) {
  const userRef = doc(db, 'users', userId);
  
  // Create a new workspace for the user
  const workspaceRef = doc(collection(db, 'workspaces'));
  const batch = writeBatch(db);

  // Set workspace initial data (e.g., owner)
  const membersCollection = collection(db, 'workspaces', workspaceRef.id, 'members');
  const userMemberRef = doc(membersCollection, userId);
  batch.set(userMemberRef, {
    name: data.name,
    email: data.email,
    photoURL: data.photoURL || `https://placehold.co/100x100?text=${data.name[0]}`,
    role: 'owner',
  });
  
  // Set the user profile document
  const userProfile: UserProfile = {
    name: data.name,
    photoURL: data.photoURL || `https://placehold.co/100x100?text=${data.name[0]}`,
    workspaceId: workspaceRef.id,
    currency: 'USD', // Default currency
  };
  batch.set(userRef, userProfile);

  await batch.commit();
  
  // Seed the new workspace's item catalog
  await seedInitialCatalog(workspaceRef.id);
  
  return userProfile;
}

export function getUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void
) {
  const userDocRef = doc(db, 'users', userId);
  const unsubscribe = onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserProfile);
    } else {
      callback(null);
    }
  });
  return unsubscribe;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, updates);
}


// Workspace-specific getters
const getListItemsCollection = (workspaceId: string) =>
  collection(db, 'workspaces', workspaceId, 'listItems');

const getPurchaseHistoryCollection = (workspaceId: string) =>
  collection(db, 'workspaces', workspaceId, 'purchaseHistory');

const getItemCatalogCollection = (workspaceId: string) =>
  collection(db, 'workspaces', workspaceId, 'itemCatalog');

const getMembersCollection = (workspaceId: string) =>
  collection(db, 'workspaces', workspaceId, 'members');

const getInvitesCollection = (workspaceId: string) =>
  collection(db, 'workspaces', workspaceId, 'invites');


const defaultCatalogData = [
  'Leche', 'Pan', 'Atún', 'Salmón', 'Yoghurt', 'Plátanos', 'Café', 'Bien dormir', 'Pasta', 'Miel', 
  'Crema de cacahuetes', 'Manzanas', 'Espinacas', 'Mostaza', 'Pasta de dientes', 'Champú', 
  'Mermelada', 'Queso feta', 'Mozzarella', 'Olivas', 'Lentejas bote', 'Garbanzos bote', 
  'Queso rallado', 'Huevos', 'Mantequilla', 'Arroz', 'Tomates', 'Pepino', 'Cebollas', 
  'Patatas', 'Boniato', 'Aceite de oliva', 'Vinagre', 'Sal', 'Bacon', 'Queso requesón', 
  'Papel de cocina', 'Papel de baño', 'Frankfurts', 'Carne picada', 'Pollo', 'Chocolate negro', 
  'Tofu', 'Tomate frito', 'Leche de coco', 'Pimiento verde', 'Brócoli'
];

export async function seedInitialCatalog(workspaceId: string) {
  const catalogCollection = getItemCatalogCollection(workspaceId);
  const snapshot = await getDocs(catalogCollection);
  if (snapshot.empty) {
    console.log(`Seeding initial item catalog for workspace ${workspaceId}...`);
    const batch = writeBatch(db);
    defaultCatalogData.forEach(name => {
      const docRef = doc(catalogCollection);
      batch.set(docRef, { name });
    });
    await batch.commit();
    console.log('Catalog seeded.');
  }
}

// Get real-time updates for the item catalog
export function getItemCatalog(
  workspaceId: string,
  callback: (items: string[]) => void
) {
  const itemsCollection = getItemCatalogCollection(workspaceId);
  const q = query(itemsCollection, orderBy('name'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => doc.data().name as string);
    callback(items);
  });
  return unsubscribe;
}

// Get real-time updates for the active grocery list
export function getListItems(
  workspaceId: string,
  callback: (items: ListItem[]) => void
) {
  const itemsCollection = getListItemsCollection(workspaceId);
  const q = query(itemsCollection, orderBy('name'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ListItem)
    );
    callback(items);
  });
  return unsubscribe;
}

// Get real-time updates for purchase history
export function getPurchaseHistory(
  workspaceId: string,
  callback: (purchases: Purchase[]) => void
) {
  const historyCollection = getPurchaseHistoryCollection(workspaceId);
  const q = query(historyCollection, orderBy('date', 'desc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const purchases = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Convert Firestore Timestamp to JavaScript Date object
      const purchaseDate = data.date instanceof Timestamp ? data.date.toDate() : new Date();
      return { id: doc.id, ...data, date: purchaseDate } as Purchase;
    });
    callback(purchases);
  });
  return unsubscribe;
}

// Add a new item to the active list and potentially the catalog
export async function addListItem(
  workspaceId: string,
  item: Omit<ListItem, 'id'>,
  currentCatalog: string[]
) {
  const itemsCollection = getListItemsCollection(workspaceId);
  await addDoc(itemsCollection, item);

  // Add to catalog if it's a new item
  const catalogCollection = getItemCatalogCollection(workspaceId);
  const normalizedItemName = item.name.toLowerCase();
  const isInCatalog = currentCatalog.some(catalogItem => catalogItem.toLowerCase() === normalizedItemName);
  
  if (!isInCatalog) {
    console.log(`Adding new item to catalog: ${item.name}`);
    await addDoc(catalogCollection, { name: item.name });
  }
}

// Update an existing item on the list
export async function updateListItem(
  workspaceId: string,
  itemId: string,
  updates: Partial<ListItem>
) {
  const itemDoc = doc(getListItemsCollection(workspaceId), itemId);
  await updateDoc(itemDoc, updates);
}

// Delete an item from the list
export async function deleteListItem(workspaceId: string, itemId: string) {
  const itemDoc = doc(getListItemsCollection(workspaceId), itemId);
  await deleteDoc(itemDoc);
}

// Finish shopping: archive the entire list to a purchase record and clear the active list.
export async function finishShopping(workspaceId: string, completedBy: string, activeListItems: ListItem[]): Promise<string | null> {
  if (activeListItems.length === 0) {
    console.log('No items to archive.');
    return null;
  }
  
  const checkedItems = activeListItems.filter(item => item.checked);
  if (checkedItems.length === 0) {
    console.log('No checked items to archive.');
    // Maybe show a toast to the user? For now, just return.
    return null;
  }
  
  const batch = writeBatch(db);

  // 1. Create a new purchase history record
  const purchaseHistoryCollection = getPurchaseHistoryCollection(workspaceId);
  const newPurchaseRef = doc(purchaseHistoryCollection);
  
  const purchasedItems: PurchaseItem[] = checkedItems.map(item => ({
    name: item.name,
    quantity: item.quantity,
    price: 0, // Price is unknown at this stage
  }));
  
  batch.set(newPurchaseRef, {
    date: serverTimestamp(),
    store: 'Unknown Store', // Will be updated via receipt analysis
    completedBy: completedBy,
    items: purchasedItems,
    originalItems: checkedItems.map(item => ({ name: item.name, quantity: item.quantity })),
  });
  
  // 2. Delete the purchased items from the active list
  const listItemsCollection = getListItemsCollection(workspaceId);
  for (const item of checkedItems) {
    const itemDocRef = doc(listItemsCollection, item.id);
    batch.delete(itemDocRef);
  }

  await batch.commit();
  return newPurchaseRef.id;
}


// Update an entire purchase record
export async function updatePurchase(
  workspaceId: string,
  purchaseId: string,
  updates: Partial<Pick<Purchase, 'store' | 'items' | 'comparison'>>
) {
  const purchaseDocRef = doc(getPurchaseHistoryCollection(workspaceId), purchaseId);
  await updateDoc(purchaseDocRef, updates);
}

// Delete a purchase record
export async function deletePurchase(workspaceId: string, purchaseId: string) {
  const purchaseDocRef = doc(getPurchaseHistoryCollection(workspaceId), purchaseId);
  await deleteDoc(purchaseDocRef);
}


// Sharing & Invitations
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 24);

export async function createInvite(workspaceId: string, email: string): Promise<string> {
    const invitesCollection = getInvitesCollection(workspaceId);

    // Check if an invite for this email already exists
    const q = query(invitesCollection, where('email', '==', email), limit(1));
    const existingInvites = await getDocs(q);
    if (!existingInvites.empty) {
        throw new Error('An invitation for this email address already exists.');
    }

    const token = nanoid();
    await addDoc(invitesCollection, {
        email,
        token,
        createdAt: serverTimestamp(),
    });

    // In a browser environment, window.location.origin can be used.
    // For server-side or other environments, you might need a config variable.
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9002';
    const inviteUrl = `${origin}/signup?inviteToken=${token}`;
    return inviteUrl;
}

export function getInvitesForWorkspace(workspaceId: string, callback: (invites: Invite[]) => void) {
    const invitesCollection = getInvitesCollection(workspaceId);
    const q = query(invitesCollection, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const invites = snapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id,
                ...data,
                // Ensure token is always a string
                token: data.token || '', 
            } as Invite
        });
        callback(invites);
    });
}

export async function deleteInvite(workspaceId: string, inviteId: string) {
    const inviteDocRef = doc(getInvitesCollection(workspaceId), inviteId);
    await deleteDoc(inviteDocRef);
}

export function getMembersForWorkspace(workspaceId: string, callback: (members: WorkspaceMember[]) => void) {
    const membersCollection = getMembersCollection(workspaceId);

    return onSnapshot(membersCollection, (snapshot) => {
        const members = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                photoURL: data.photoURL,
                role: data.role,
            } as WorkspaceMember;
        });
        callback(members);
    });
}

export async function acceptInvite(inviteToken: string, newUser: { id: string; name: string; email: string, photoURL: string }): Promise<UserProfile> {
    // This is a cross-collection query, which is inefficient.
    // A better schema would be a top-level `invites` collection.
    // Given the current schema, we have to query all workspaces.
    const workspacesQuery = query(collection(db, 'workspaces'));
    const workspacesSnapshot = await getDocs(workspacesQuery);

    let foundInvite = null;
    let workspaceId = '';

    for (const workspaceDoc of workspacesSnapshot.docs) {
        const invitesCollection = getInvitesCollection(workspaceDoc.id);
        const inviteQ = query(invitesCollection, where('token', '==', inviteToken), limit(1));
        const inviteSnapshot = await getDocs(inviteQ);
        if (!inviteSnapshot.empty) {
            foundInvite = inviteSnapshot.docs[0];
            workspaceId = workspaceDoc.id;
            break;
        }
    }

    if (!foundInvite) {
        throw new Error('Invalid or expired invitation token.');
    }

    const inviteData = foundInvite.data();
    if (inviteData.email.toLowerCase() !== newUser.email.toLowerCase()) {
        throw new Error('This invitation is for a different email address.');
    }
    
    // Use a transaction to ensure atomicity
    const userProfile = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', newUser.id);
        const memberRef = doc(getMembersCollection(workspaceId), newUser.id);

        // 1. Create the user's profile
        const profile: UserProfile = {
            name: newUser.name,
            photoURL: newUser.photoURL || `https://placehold.co/100x100?text=${newUser.name[0]}`,
            workspaceId: workspaceId,
            currency: 'USD',
        };
        transaction.set(userRef, profile);

        // 2. Add the user to the workspace's members subcollection
        transaction.set(memberRef, {
            name: newUser.name,
            email: newUser.email,
            photoURL: profile.photoURL,
            role: 'member',
        });

        // 3. Delete the invitation
        transaction.delete(foundInvite.ref);
        
        return profile;
    });
    
    return userProfile;
}
