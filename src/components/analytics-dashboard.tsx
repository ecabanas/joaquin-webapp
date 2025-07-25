
'use client';

import type { Purchase } from '@/lib/types';
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
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrency } from '@/hooks/use-currency';
import { subMonths, startOfMonth, endOfMonth, format, isWithinInterval } from 'date-fns';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { FileText, ShoppingBag, TrendingUp, Search, Lightbulb, X as CloseIcon } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

type AnalyticsDashboardProps = {
  purchases: Purchase[];
};

type Timeframe = '3months' | '6months' | '12months';

export function AnalyticsDashboard({ purchases }: AnalyticsDashboardProps) {
  const { formatCurrency } = useCurrency();
  const [timeframe, setTimeframe] = useState<Timeframe>('6months');
  const [showInsight, setShowInsight] = useState(true);

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

    const thisMonthPurchases = purchases.filter(p => 
      isWithinInterval(p.date, { start: thisMonthStart, end: thisMonthEnd })
    );

    const totalSpendThisMonth = thisMonthPurchases.reduce((acc, p) => acc + p.items.reduce((itemAcc, item) => itemAcc + (item.price || 0) * item.quantity, 0), 0);
    
    const allTimeAvgMonthlySpend = (() => {
        const monthlySpend: {[key: string]: number} = {};
        purchases.forEach(p => {
            const monthYear = format(p.date, 'yyyy-MM');
            const total = p.items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
            monthlySpend[monthYear] = (monthlySpend[monthYear] || 0) + total;
        });
        const allMonthlyTotals = Object.values(monthlySpend);
        if (allMonthlyTotals.length === 0) return 0;
        const total = allMonthlyTotals.reduce((a, b) => a + b, 0);
        return total / allMonthlyTotals.length;
    })();
    
    let comparisonText = "That's about average for you.";
    if (allTimeAvgMonthlySpend > 0) {
        const diff = totalSpendThisMonth / allTimeAvgMonthlySpend;
        if (diff > 1.2) comparisonText = "This is slightly higher than your usual pace.";
        if (diff < 0.8) comparisonText = "You're spending less than usual this month.";
    }

    return { totalSpendThisMonth, comparisonText };
  }, [purchases]);
  

  const spendingTrendData = useMemo(() => {
    const data: { [key: string]: { total: number; planned: number; impulse: number; trips: number } } = {};
    filteredPurchases.forEach(p => {
        const monthYear = format(p.date, 'MMM yyyy');
        if (!data[monthYear]) {
            data[monthYear] = { total: 0, planned: 0, impulse: 0, trips: 0 };
        }

        let planned = 0;
        let impulse = 0;
        p.items.forEach(item => {
            const price = (item.price || 0) * item.quantity;
            const isOnOriginalList = p.originalListItems?.some(orig => orig.name.toLowerCase() === item.name.toLowerCase());
            if (p.originalListItems && !isOnOriginalList) {
                impulse += price;
            } else {
                planned += price;
            }
        });
        
        const total = planned + impulse;
        data[monthYear].total += total;
        data[monthYear].planned += planned;
        data[monthYear].impulse += impulse;
        data[monthYear].trips += 1;
    });

    return Object.entries(data).map(([name, values]) => ({ 
      name, 
      ...values, 
      avgTripCost: values.total / values.trips 
    })).reverse();
  }, [filteredPurchases]);
  

  const habitsMetrics = useMemo(() => {
    const impulseBuys: { [key: string]: number } = {};
    const forgottenItems: { [key: string]: number } = {};

    filteredPurchases.forEach(p => {
       if (p.comparison) {
          p.comparison.impulseBuys.forEach(item => {
            impulseBuys[item] = (impulseBuys[item] || 0) + 1;
          });
           p.comparison.forgottenItems.forEach(item => {
            forgottenItems[item] = (forgottenItems[item] || 0) + 1;
          });
       }
    });

    const topImpulse = Object.entries(impulseBuys).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topForgotten = Object.entries(forgottenItems).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    return { topImpulse, topForgotten };
  }, [filteredPurchases]);


  const allItems = useMemo(() => {
    const itemSet = new Set<string>();
    purchases.forEach(p => p.items.forEach(i => i.price > 0 && itemSet.add(i.name)));
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
            date: format(p.date, 'dd MMM yy'),
            price: item.price,
            store: p.store,
          };
        }
        return null;
      })
      .filter(Boolean)
      .reverse();
  }, [purchases, selectedItem]);


  const SpendingTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const { name, total, planned, impulse, trips, avgTripCost } = payload[0].payload;
      const plannedPercentage = total > 0 ? Math.round((planned / total) * 100) : 0;
      const impulsePercentage = 100 - plannedPercentage;

      return (
        <div className="p-3 bg-background/80 backdrop-blur-sm border rounded-xl shadow-lg min-w-[220px]">
          <p className="font-bold text-lg mb-2">{name}</p>
          <div className="flex items-center gap-4 mb-3">
             <RechartsPieChart width={50} height={50}>
                <Pie data={[{value: planned}, {value: impulse}]} dataKey="value" cx="50%" cy="50%" outerRadius={25} innerRadius={18}>
                    <Cell fill="hsl(var(--primary))"/>
                    <Cell fill="hsl(var(--primary) / 0.3)"/>
                </Pie>
            </RechartsPieChart>
            <div className="flex-1">
                <p className="text-primary text-xl font-bold">{formatCurrency(total)}</p>
                <div className="text-xs text-muted-foreground">
                    <span>{plannedPercentage}% Planned</span>, <span>{impulsePercentage}% Impulse</span>
                </div>
            </div>
          </div>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>Trips: <span className="font-medium text-foreground">{trips}</span></p>
            <p>Avg. Trip: <span className="font-medium text-foreground">{formatCurrency(avgTripCost)}</span></p>
          </div>
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
  
  if (purchases.length === 0) {
    return (
       <div className="text-center py-16 px-4 bg-card rounded-lg border border-dashed">
         <FileText className="mx-auto h-12 w-12 text-primary/40" strokeWidth={1.5} />
        <h3 className="mt-4 text-xl font-semibold text-foreground">No Analytics Yet</h3>
        <p className="mt-1 text-muted-foreground max-w-md mx-auto">
          Start completing shopping lists and analyzing your receipts from the History page to unlock your personal Shopping Story.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="text-center">
            <h2 className="text-lg text-muted-foreground">So far this month, you've spent</h2>
            <p className="text-5xl font-bold tracking-tight text-primary my-2">{formatCurrency(spendingMetrics.totalSpendThisMonth)}</p>
            <p className="text-muted-foreground animate-in fade-in duration-500">{spendingMetrics.comparisonText}</p>
        </div>
        
        {showInsight && (
            <Alert className="bg-primary/5 border-primary/20 relative">
                <Lightbulb className="h-4 w-4 text-primary" />
                <AlertTitle className="font-semibold text-primary/90">Pro Tip</AlertTitle>
                <AlertDescription>
                    You've forgotten to buy 'Milk' twice this month. Remember to add it to your list for the next trip!
                </AlertDescription>
                <button onClick={() => setShowInsight(false)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary/10 transition-colors">
                    <CloseIcon className="h-4 w-4 text-primary/80" />
                </button>
            </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Spending Rhythm</CardTitle>
                <CardDescription>Your spending totals and habits over time.</CardDescription>
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
          <CardContent className="h-[350px] w-full">
            {spendingTrendData.length > 0 ? (
                <ResponsiveContainer>
                <AreaChart data={spendingTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(value) => formatCurrency(value as number, {notation: 'compact'})} tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip content={<SpendingTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mb-4" />
                    <p>Not enough data for this timeframe.</p>
                </div>
            )}
          </CardContent>
        </Card>
        
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
                <CardTitle>Price Watch</CardTitle>
                <CardDescription>Track an item's price over time.</CardDescription>
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
                <div className="h-[250px] w-full mt-4">
                    {priceWatchData.length > 1 ? (
                        <ResponsiveContainer>
                            <LineChart data={priceWatchData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                            <YAxis tickFormatter={(value) => formatCurrency(value as number)} tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                            <Tooltip content={<PriceWatchTooltip />} />
                            <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} name={selectedItem || 'Price'} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                            {selectedItem ? (
                                <>
                                    <Search className="w-10 h-10 mb-2" />
                                    <p>Not enough data for <span className="font-semibold text-foreground">{selectedItem}</span>.</p>
                                    <p className="text-xs">Purchase it a few more times to see its price trend.</p>
                                </>
                            ) : (
                                <p>Select an item above to begin.</p>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Top Insights</CardTitle>
                    <CardDescription>Your most common shopping habits.</CardDescription>
                 </CardHeader>
                 <CardContent>
                     <Tabs defaultValue="forgotten">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="forgotten">Most Forgotten</TabsTrigger>
                            <TabsTrigger value="impulse">Top Impulse Buys</TabsTrigger>
                        </TabsList>
                        <TabsContent value="forgotten" className="mt-4">
                           {habitsMetrics.topForgotten.length > 0 ? (
                                <ul className="space-y-2">
                                    {habitsMetrics.topForgotten.map(([name, count]) => (
                                        <li key={name} className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                                            <span className="font-medium">{name}</span>
                                            <Badge variant="secondary">{count} times</Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">You haven't forgotten any items recently. Great job!</p>
                            )}
                        </TabsContent>
                        <TabsContent value="impulse" className="mt-4">
                             {habitsMetrics.topImpulse.length > 0 ? (
                                <ul className="space-y-2">
                                    {habitsMetrics.topImpulse.map(([name, count]) => (
                                        <li key={name} className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                                            <span className="font-medium">{name}</span>
                                            <Badge variant="secondary">{count} times</Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No impulse buys detected. Very disciplined!</p>
                            )}
                        </TabsContent>
                     </Tabs>
                 </CardContent>
            </Card>
       </div>
    </div>
  );
}

    