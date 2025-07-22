import { ReceiptAnalyzer } from "@/components/receipt-analyzer";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { ScanLine } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function HistoryPage() {
  const purchases = mockHistory;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <header className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight">Purchase History</h1>
          <p className="text-muted-foreground">
            Review past purchases and analyze new receipts.
          </p>
        </header>
        <ReceiptAnalyzer />
      </div>

      <div className="space-y-4">
        {purchases.map((purchase, index) => (
          <Card key={purchase.id}>
            <CardHeader>
              <CardTitle className="text-xl">{purchase.store}</CardTitle>
              <CardDescription>
                {purchase.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {purchase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{item.name} <span className="text-xs"> (x{item.quantity})</span></span>
                    <span>{formatCurrency(item.price)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <Separator />
            <CardFooter className="pt-4 flex justify-between font-bold">
              <span>Total</span>
               <span>
                {formatCurrency(purchase.items.reduce((acc, item) => acc + item.price * item.quantity, 0))}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
