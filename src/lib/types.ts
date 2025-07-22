export type GroceryItem = {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  checked: boolean;
};

export type Aisle = {
  id: string;
  name: string;
  items: GroceryItem[];
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
