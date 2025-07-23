
import type { GroceryList, Purchase } from './types';

export const mockActiveList: GroceryList = {
  id: 'list-1',
  items: [
    { id: 'item-1', name: 'Avocado', quantity: 3, checked: false },
    { id: 'item-2', name: 'Organic Bananas', quantity: 1, checked: true, notes: 'bunch' },
    { id: 'item-3', name: 'Roma Tomato', quantity: 5, checked: false },
    { id: 'item-4', name: 'Sourdough Bread', quantity: 1, checked: false, notes: 'sliced' },
    { id: 'item-5', name: 'Croissants', quantity: 4, checked: false },
    { id: 'item-6', name: 'Organic Milk', quantity: 1, checked: false, notes: '1 gallon' },
    { id: 'item-7', name: 'Large Brown Eggs', quantity: 1, checked: true, notes: 'dozen' },
    { id: 'item-8', name: 'Greek Yogurt', quantity: 2, checked: false, notes: 'plain' },
    { id: 'item-9', name: 'Kettle Cooked Chips', quantity: 1, checked: false },
  ],
};


export const mockHistory: Purchase[] = [
  {
    id: 'purchase-1',
    date: new Date('2024-05-18T14:20:00Z'),
    store: 'Super Grocer',
    items: [
      { name: 'Organic Milk', quantity: 1, price: 4.50 },
      { name: 'Large Brown Eggs', quantity: 1, price: 3.25 },
      { name: 'Sourdough Bread', quantity: 1, price: 5.99 },
    ],
  },
  {
    id: 'purchase-2',
    date: new Date('2024-05-11T18:05:00Z'),
    store: 'Grocery Mart',
    items: [
      { name: 'Avocado', quantity: 4, price: 6.00 },
      { name: 'Organic Bananas', quantity: 1, price: 2.50 },
      { name: 'Roma Tomato', quantity: 6, price: 3.00 },
      { name: 'Kettle Cooked Chips', quantity: 1, price: 3.99 },
    ],
  },
];

export const defaultCatalog: string[] = [
  "Milk", "Eggs", "Bread", "Butter", "Cheese", "Apples", "Bananas", "Oranges",
  "Chicken Breast", "Ground Beef", "Pasta", "Rice", "Cereal", "Coffee", "Tea",
  "Lettuce", "Tomatoes", "Onions", "Potatoes", "Yogurt", "Olive Oil", "Flour",
  "Sugar", "Salt", "Pepper", "Ketchup", "Mustard", "Mayonnaise", "Salsa",
  "Tortilla Chips", "Soda", "Juice", "Water Bottles", "Frozen Pizza", "Ice Cream"
];
