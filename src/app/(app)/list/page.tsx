import { GroceryListClient } from '@/components/grocery-list-client';
import { mockAisles } from '@/lib/mock-data';

export default function GroceryListPage() {
  // In a real app, you'd fetch this data from your database.
  const aisles = mockAisles;

  return (
    <div className="max-w-2xl mx-auto">
      <header className="space-y-1 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Grocery List</h1>
        <p className="text-muted-foreground">
          A shared list to keep your shopping organized.
        </p>
      </header>
      <GroceryListClient initialAisles={aisles} />
    </div>
  );
}
