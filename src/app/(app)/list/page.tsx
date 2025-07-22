import { GroceryListClient } from '@/components/grocery-list-client';
import { mockAisles } from '@/lib/mock-data';

export default function GroceryListPage() {
  // In a real app, you'd fetch this data from your database.
  const aisles = mockAisles;

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Grocery List</h1>
        <p className="text-muted-foreground">
          Here's your shared list. Add, check, and manage items together.
        </p>
      </header>
      <GroceryListClient initialAisles={aisles} />
    </div>
  );
}
