import { ReceiptAnalyzer } from "@/components/receipt-analyzer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockHistory } from "@/lib/mock-data";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function HistoryPage() {
  const purchases = mockHistory.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <header className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight">Purchase History</h1>
          <p className="text-muted-foreground">
            Review past purchases and analyze new receipts.
          </p>
        </header>
        <ReceiptAnalyzer />
      </div>

      <div className="grid gap-6">
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="shadow-sm">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">{purchase.store}</CardTitle>
                <CardDescription>
                  {purchase.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </div>
               <div className="text-right">
                  <p className="text-2xl font-bold">
                    {formatCurrency(purchase.items.reduce((acc, item) => acc + item.price * item.quantity, 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {purchase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex justify-between items-center text-base">
                    <span className="text-foreground">{item.name} <span className="text-sm text-muted-foreground"> (x{item.quantity})</span></span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
