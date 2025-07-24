
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
} from 'firebase/firestore';
import { db } from './firebase';
import type { ListItem, Purchase } from './types';

const getListItemsCollection = (workspaceId: string) =>
  collection(db, 'workspaces', workspaceId, 'listItems');

const getPurchaseHistoryCollection = (workspaceId: string) =>
  collection(db, 'workspaces', workspaceId, 'purchaseHistory');

// Get real-time updates for the active grocery list
export function getListItems(
  workspaceId: string,
  callback: (items: ListItem[]) => void
) {
  const itemsCollection = getListItemsCollection(workspaceId);
  const unsubscribe = onSnapshot(itemsCollection, (snapshot) => {
    const items = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ListItem)
    );
    callback(items);
  });
  return unsubscribe;
}

// Add a new item to the active list
export async function addListItem(
  workspaceId: string,
  item: Omit<ListItem, 'id'>
) {
  const itemsCollection = getListItemsCollection(workspaceId);
  await addDoc(itemsCollection, item);
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
  const newPurchase: Omit<Purchase, 'id'> = {
    date: new Date(), // Will be converted to Firestore Timestamp
    store: storeName,
    completedBy: completedBy,
    items: checkedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: Number((Math.random() * 10 + 1).toFixed(2)), // Mock price for now
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
