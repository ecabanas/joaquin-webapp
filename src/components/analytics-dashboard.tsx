
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
  PieChart,
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
import { useCurrency } from '@/hooks/use-currency';
import { subMonths, startOfMonth, endOfMonth, format, isWithinInterval } from 'date-fns';
import { Badge } from './ui/badge';
import { FileText, Search, Trophy, Users, AlertCircle, ShoppingBasket } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


type AnalyticsDashboardProps = {
  purchases: Purchase[];
};

type Timeframe = '3months' | '6months' | '12months';

const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}


export function AnalyticsDashboard({ purchases }: AnalyticsDashboardProps) {
  const { formatCurrency } = useCurrency();
  const [timeframe, setTimeframe] = useState<Timeframe>('6months');

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
    const data: { [key: string]: { total: number; trips: number, impulseCount: number, plannedCount: number } } = {};
    filteredPurchases.forEach(p => {
        const monthYear = format(p.date, 'MMM yyyy');
        if (!data[monthYear]) {
            data[monthYear] = { total: 0, trips: 0, impulseCount: 0, plannedCount: 0 };
        }

        const total = p.items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
        data[monthYear].total += total;
        data[monthYear].trips += 1;

        if (p.comparison) {
          data[monthYear].impulseCount += p.comparison.impulseBuys.length;
          // Planned items = total items on receipt - impulse buys
          const plannedItems = p.items.length - p.comparison.impulseBuys.length;
          data[monthYear].plannedCount += Math.max(0, plannedItems);
        } else {
          // If no comparison, assume all items were planned
          data[monthYear].plannedCount += p.items.length;
        }
    });

    return Object.entries(data).map(([name, values]) => {
      const totalItems = values.plannedCount + values.impulseCount;
      const plannedPercentage = totalItems > 0 ? (values.plannedCount / totalItems) * 100 : 100;
      
      return { 
        name, 
        total: values.total,
        trips: values.trips,
        avgTripCost: values.trips > 0 ? values.total / values.trips : 0,
        donutData: [
          { name: 'Planned', value: plannedPercentage },
          { name: 'Impulse', value: 100 - plannedPercentage },
        ]
      }
    }).reverse();
  }, [filteredPurchases]);
  
  const topShoppers = useMemo(() => {
    const shopperCounts: { [name: string]: number } = {};
    filteredPurchases.forEach(p => {
      shopperCounts[p.completedBy] = (shopperCounts[p.completedBy] || 0) + 1;
    });
    return Object.entries(shopperCounts).sort((a, b) => b[1] - a[1]);
  }, [filteredPurchases]);

  const topForgottenItems = useMemo(() => {
    const itemCounts: { [name: string]: number } = {};
    filteredPurchases.forEach(p => {
        p.comparison?.forgottenItems.forEach(item => {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        });
    });
    return Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
  }, [filteredPurchases]);

  const topImpulseBuys = useMemo(() => {
    const itemCounts: { [name: string]: number } = {};
    filteredPurchases.forEach(p => {
        p.comparison?.impulseBuys.forEach(item => {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        });
    });
    return Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
  }, [filteredPurchases]);


  const allItems = useMemo(() => {
    const itemSet = new Set<string>();
    purchases.forEach(p => p.items.forEach(i => (i.price || 0) > 0 && itemSet.add(i.name)));
    return Array.from(itemSet).sort();
  }, [purchases]);

  const [selectedItem, setSelectedItem] = useState<string | null>(allItems[0] || null);

  const priceWatchData = useMemo(() => {
    if (!selectedItem) return [];
    return purchases
      .map(p => {
        const item = p.items.find(i => i.name === selectedItem);
        if (item && (item.price || 0) > 0) {
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
      const { name, total, trips, avgTripCost, donutData } = payload[0].payload;
      const plannedPercentage = Math.round(donutData[0].value);

      return (
        <div className="p-3 bg-background/80 backdrop-blur-sm border rounded-xl shadow-lg min-w-[220px]">
          <p className="font-bold text-lg mb-2">{name}</p>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
                <p className="text-primary text-2xl font-bold">{formatCurrency(total)}</p>
                <div className="text-xs space-y-1 text-muted-foreground mt-1">
                  <p>Trips: <span className="font-medium text-foreground">{trips}</span></p>
                  <p>Avg. Trip: <span className="font-medium text-foreground">{formatCurrency(avgTripCost)}</span></p>
                </div>
            </div>
             <div className="relative h-20 w-20">
               <PieChart width={80} height={80}>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={24}
                  outerRadius={32}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  <Cell fill="hsl(var(--primary))" opacity={0.8} />
                  <Cell fill="hsl(var(--accent))" />
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">{plannedPercentage}<span className="text-xs text-muted-foreground">%</span></span>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary/80"></span> Planned</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent"></span> Impulse</div>
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

  const hasComparisonData = useMemo(() => {
    return purchases.some(p => p.comparison);
  }, [purchases]);
  
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
  
  const InsightListItem = ({ item, count, icon: Icon }: { item: string, count: number, icon: React.ElementType }) => (
    <li className="flex justify-between items-center bg-muted/50 p-2.5 rounded-md">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-primary/80" />
        <span className="font-medium">{item}</span>
      </div>
      <Badge variant="secondary" className="text-base">{count}</Badge>
    </li>
  );
  
  const InsightEmptyState = ({ title, description }: { title: string, description: string }) => (
    <div className="text-center py-8 px-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
    </div>
  );

  return (
    <div className="space-y-6">
        <div className="text-center">
            <h2 className="text-lg text-muted-foreground">So far this month, you've spent</h2>
            <p className="text-5xl font-bold tracking-tight text-primary my-2">{formatCurrency(spendingMetrics.totalSpendThisMonth)}</p>
            <p className="text-muted-foreground animate-in fade-in duration-500">{spendingMetrics.comparisonText}</p>
        </div>
        
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
                    <Users className="w-12 h-12 mb-4" />
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
                    {priceWatchData && priceWatchData.length > 1 ? (
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
                    <CardDescription>Habits and highlights from your shopping trips.</CardDescription>
                 </CardHeader>
                 <CardContent>
                     <Tabs defaultValue="shoppers" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="shoppers"><Users className="mr-2 h-4 w-4" /> Shoppers</TabsTrigger>
                            <TabsTrigger value="forgotten"><AlertCircle className="mr-2 h-4 w-4" /> Forgotten</TabsTrigger>
                            <TabsTrigger value="impulse"><ShoppingBasket className="mr-2 h-4 w-4" /> Impulse</TabsTrigger>
                        </TabsList>
                        <TabsContent value="shoppers" className="mt-4">
                            {topShoppers.length > 0 ? (
                                <ul className="space-y-3">
                                    {topShoppers.map(([name, count], index) => (
                                        <li key={name} className="flex justify-between items-center bg-muted/50 p-2.5 rounded-md">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {index === 0 && <Trophy className="w-5 h-5 text-amber-400" />}
                                                <Badge variant="secondary" className="text-base">{count} {count === 1 ? 'trip' : 'trips'}</Badge>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                               <InsightEmptyState title="No Trips Yet" description="Complete a shopping trip to see who the top shoppers are." />
                            )}
                        </TabsContent>
                        <TabsContent value="forgotten" className="mt-4">
                            {!hasComparisonData ? (
                               <InsightEmptyState title="No Data for Insights" description="Analyze a receipt from your history to see which items you forget most often." />
                            ) : topForgottenItems.length > 0 ? (
                                <ul className="space-y-3">
                                    {topForgottenItems.slice(0, 5).map(([name, count]) => (
                                        <InsightListItem key={name} item={name} count={count} icon={AlertCircle} />
                                    ))}
                                </ul>
                            ) : (
                               <InsightEmptyState title="Nothing Forgotten!" description="You've remembered to buy everything from your lists. Great job!" />
                            )}
                        </TabsContent>
                        <TabsContent value="impulse" className="mt-4">
                            {!hasComparisonData ? (
                                <InsightEmptyState title="No Data for Insights" description="Analyze a receipt from your history to discover your top impulse buys." />
                            ) : topImpulseBuys.length > 0 ? (
                                <ul className="space-y-3">
                                    {topImpulseBuys.slice(0, 5).map(([name, count]) => (
                                       <InsightListItem key={name} item={name} count={count} icon={ShoppingBasket} />
                                    ))}
                                </ul>
                            ) : (
                                <InsightEmptyState title="No Impulse Buys" description="You're sticking to the list! Excellent discipline." />
                            )}
                        </TabsContent>
                    </Tabs>
                 </CardContent>
            </Card>
       </div>
    </div>
  );
}
