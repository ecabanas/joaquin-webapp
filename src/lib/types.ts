
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

export type OriginalItem = {
  name: string;
  quantity: number;
};

export type Purchase = {
  id: string;
  date: Date;
  store: string;
  completedBy: string;
  items: PurchaseItem[];
  originalItems?: OriginalItem[];
  comparison?: {
    forgottenItems: string[];
    impulseBuys: string[];
  };
};

export type UserProfile = {
  name: string;
  photoURL: string;
  workspaceId: string;
  currency?: string;
};

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  role: 'owner' | 'member';
}

export type Invite = {
  id: string;
  email: string;
  token: string;
  createdAt: Date;
}
