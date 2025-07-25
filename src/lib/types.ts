
export type ListItem = {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  checked: boolean;
};

export type GroceryList = {
  id: string;
  items: ListItem[];
};

export type PurchaseItem = {
  name: string;
  quantity: number;
  price: number;
};

export type Purchase = {
  id: string;
  date: Date;
  store: string;
  completedBy: string;
  items: PurchaseItem[];
};

export type UserProfile = {
  name: string;
  photoURL: string;
  workspaceId: string;
  currency?: string;
};
