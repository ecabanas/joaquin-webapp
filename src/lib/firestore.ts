
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
} from 'firebase/firestore';
import { db } from './firebase';
import type { ListItem, Purchase, UserProfile } from './types';

// User Management
export async function createUserProfile(userId: string, data: Omit<UserProfile, 'workspaceId'> & { email: string }) {
  const userRef = doc(db, 'users', userId);
  
  // Create a new workspace for the user
  const workspaceRef = doc(collection(db, 'workspaces'));
  const batch = writeBatch(db);

  // Set workspace initial data (e.g., owner)
  const membersCollection = collection(db, 'workspaces', workspaceRef.id, 'members');
  const userMemberRef = doc(membersCollection, userId);
  batch.set(userMemberRef, {
    name: data.name,
    role: 'owner',
  });
  
  // Set the user profile document
  const userProfile: UserProfile = {
    name: data.name,
    photoURL: data.photoURL || `https://placehold.co/100x100?text=${data.name[0]}`,
    workspaceId: workspaceRef.id,
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


// Workspace-specific getters
const getListItemsCollection = (workspaceId: string) =>
  collection(db, 'workspaces', workspaceId, 'listItems');

const getPurchaseHistoryCollection = (workspaceId: string) =>
  collection(db, 'workspaces', workspaceId, 'purchaseHistory');

const getItemCatalogCollection = (workspaceId: string) =>
  collection(db, 'workspaces', workspaceId, 'itemCatalog');

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

// Finish shopping: archive checked items and clear them from the list
export async function finishShopping(
  workspaceId: string,
  storeName: string,
  completedBy: string
) {
  const listItemsCollection = getListItemsCollection(workspaceId);
  const q = query(listItemsCollection, where('checked', '==', true));
  
  const querySnapshot = await getDocs(q);
  const checkedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ListItem));

  if (checkedItems.length === 0) {
    console.log('No items to archive.');
    return;
  }

  const batch = writeBatch(db);

  // 1. Create a new purchase history record
  const newPurchase: Omit<Purchase, 'id' | 'date'> & { date: any } = {
    date: serverTimestamp(), // Use server timestamp for consistency
    store: storeName,
    completedBy: completedBy,
    items: checkedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: 0, // Initialize price at 0. User will add it via receipt scanner.
    })),
  };
  
  const purchaseHistoryCollection = getPurchaseHistoryCollection(workspaceId);
  const newPurchaseRef = doc(purchaseHistoryCollection); // Create a new doc with a generated ID
  batch.set(newPurchaseRef, newPurchase);


  // 2. Delete the checked items from the active list
  for (const item of checkedItems) {
    const itemRef = doc(listItemsCollection, item.id);
    batch.delete(itemRef);
  }

  // 3. Commit all the operations atomically
  await batch.commit();
}
