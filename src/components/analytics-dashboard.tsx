
'use client';

import type { Purchase, PurchaseItem } from '@/lib/types';
import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/hooks/use-currency';
import { subMonths, startOfMonth, endOfMonth, eachWeek, format, getMonth, getYear, isWithinInterval } from 'date-fns';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { PieChart, ShoppingBag } from 'lucide-react';

type AnalyticsDashboardProps = {
  purchases: Purchase[];
};

type Timeframe = '3months' | '6months' | '12months';

export function AnalyticsDashboard({ purchases }: AnalyticsDashboardProps) {
  const { formatCurrency, currency } = useCurrency();
  const [timeframe, setTimeframe] = useState<Timeframe>('3months');

  const filteredPurchases = useMemo(() => {
    const now = new Date();
    const monthsToSubtract = { '3months': 3, '6months': 6, '12months': 12 }[timeframe];
    const startDate = subMonths(now, monthsToSubtract);
    return purchases.filter(p => p.date >= startDate);
  }, [purchases, timeframe]);

  const spendingMetrics = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    const thisMonthPurchases = filteredPurchases.filter(p => 
      isWithinInterval(p.date, { start: thisMonthStart, end: thisMonthEnd })
    );

    const totalSpendThisMonth = thisMonthPurchases.reduce((acc, p) => acc + p.items.reduce((itemAcc, item) => itemAcc + item.price * item.quantity, 0), 0);
    const tripsThisMonth = thisMonthPurchases.length;
    const avgTripCostThisMonth = tripsThisMonth > 0 ? totalSpendThisMonth / tripsThisMonth : 0;
    
    return { totalSpendThisMonth, tripsThisMonth, avgTripCostThisMonth };
  }, [filteredPurchases]);

  const spendingTrendData = useMemo(() => {
    const data: { [key: string]: number } = {};
    filteredPurchases.forEach(p => {
      const monthYear = format(p.date, 'MMM yyyy');
      const total = p.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      data[monthYear] = (data[monthYear] || 0) + total;
    });
    return Object.entries(data).map(([name, total]) => ({ name, total })).reverse();
  }, [filteredPurchases]);

  const habitsMetrics = useMemo(() => {
    let totalItems = 0;
    let impulseBuys = 0;
    const forgottenItemsCount: { [key: string]: number } = {};

    filteredPurchases.forEach(p => {
      if (p.originalListItems) {
        const receiptItemNames = new Set(p.items.map(i => i.name.toLowerCase()));
        
        // Impulse buys
        p.items.forEach(item => {
          const isOnOriginalList = p.originalListItems!.some(orig => orig.name.toLowerCase() === item.name.toLowerCase());
          if (!isOnOriginalList) {
            impulseBuys += 1;
          }
        });
        
        // Forgotten items
        p.originalListItems.forEach(origItem => {
          if (origItem.checked && !receiptItemNames.has(origItem.name.toLowerCase())) {
            forgottenItemsCount[origItem.name] = (forgottenItemsCount[origItem.name] || 0) + 1;
          }
        });

        totalItems += p.items.length;
      }
    });

    const plannedItems = totalItems - impulseBuys;
    const impulseBuyPercentage = totalItems > 0 ? Math.round((impulseBuys / totalItems) * 100) : 0;
    const topForgotten = Object.entries(forgottenItemsCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
    
    return { plannedItems, impulseBuys, impulseBuyPercentage, topForgotten };
  }, [filteredPurchases]);

  const allItems = useMemo(() => {
    const itemSet = new Set<string>();
    purchases.forEach(p => p.items.forEach(i => itemSet.add(i.name)));
    return Array.from(itemSet).sort();
  }, [purchases]);

  const [selectedItem, setSelectedItem] = useState<string | null>(allItems[0] || null);

  const priceWatchData = useMemo(() => {
    if (!selectedItem) return [];
    return purchases
      .map(p => {
        const item = p.items.find(i => i.name === selectedItem);
        if (item && item.price > 0) {
          return {
            date: format(p.date, 'dd MMM yyyy'),
            price: item.price,
            store: p.store,
          };
        }
        return null;
      })
      .filter(Boolean)
      .reverse();
  }, [purchases, selectedItem]);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
          <p className="font-bold">{label}</p>
          <p className="text-primary">{`Total: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };
  
  const PriceWatchTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
          <p className="font-bold">{label}</p>
          <p className="text-primary">{`Price: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-muted-foreground">{`Store: ${payload[0].payload.store}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* --- Main Column --- */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>This Month's Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(spendingMetrics.totalSpendThisMonth)}</p>
              <p className="text-muted-foreground">Total Spend</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{spendingMetrics.tripsThisMonth}</p>
              <p className="text-muted-foreground">Shopping Trips</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{formatCurrency(spendingMetrics.avgTripCostThisMonth)}</p>
              <p className="text-muted-foreground">Average Trip Cost</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Spending Rhythm</CardTitle>
                <CardDescription>Your spending totals over time.</CardDescription>
            </div>
            <Select value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="12months">12 Months</SelectItem>
                </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer>
              <AreaChart data={spendingTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                <YAxis tickFormatter={(value) => formatCurrency(value as number, {notation: 'compact'})} tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
             <CardTitle>Price Watch</CardTitle>
             <CardDescription>Track the price of an item over time across different stores.</CardDescription>
          </CardHeader>
          <CardContent>
              <Select value={selectedItem || ''} onValueChange={setSelectedItem}>
                <SelectTrigger>
                    <SelectValue placeholder="Select an item to track..." />
                </SelectTrigger>
                <SelectContent>
                    {allItems.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
            </Select>
            <div className="h-[300px] w-full mt-4">
                 {priceWatchData.length > 1 ? (
                    <ResponsiveContainer>
                        <LineChart data={priceWatchData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                           <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                           <YAxis tickFormatter={(value) => formatCurrency(value as number)} tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                           <Tooltip content={<PriceWatchTooltip />} />
                           <Legend />
                           <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name={selectedItem || 'Price'} />
                        </LineChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        <p>Not enough data to display a trend for this item.<br/>Purchase it a few more times to see the chart.</p>
                    </div>
                 )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Side Column --- */}
      <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PieChart className="w-5 h-5" /> Shopping Habits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <p className="text-2xl text-center">
                    <span className="font-bold text-primary">{100 - habitsMetrics.impulseBuyPercentage}%</span> of your items were planned
                 </p>
                 <div className="text-sm text-center text-muted-foreground">
                     ({habitsMetrics.plannedItems} planned vs. {habitsMetrics.impulseBuys} impulse buys)
                 </div>
                 
                 <div className="pt-4">
                    <h4 className="font-semibold mb-2">Frequently Forgotten</h4>
                     {habitsMetrics.topForgotten.length > 0 ? (
                        <ul className="space-y-2">
                            {habitsMetrics.topForgotten.map(([name, count]) => (
                                <li key={name} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                                    <span>{name}</span>
                                    <Badge variant="secondary">{count} times</Badge>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">You're not forgetting anything. Great job!</p>
                     )}
                 </div>
            </CardContent>
          </Card>
           <Alert>
              <ShoppingBag className="h-4 w-4" />
              <AlertTitle>Pro Tip</AlertTitle>
              <AlertDescription>
                The more you use the app and scan receipts, the more accurate and insightful this dashboard will become!
              </AlertDescription>
            </Alert>
      </div>
    </div>
  );
}
