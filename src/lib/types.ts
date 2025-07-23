
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

export type Purchase = {
  id: string;
  date: Date;
  store: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
};
