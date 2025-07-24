
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const { userProfile, updateProfile, loading } = useAuth();
  
  // Load currency from user profile on mount
  useEffect(() => {
    if (userProfile?.currency) {
      setCurrencyState(userProfile.currency as Currency);
    }
  }, [userProfile?.currency]);

  // Update profile when currency changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (userProfile) {
      updateProfile({ currency: newCurrency });
    }
  };

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }, [currency]);

  const value = {
    currency,
    setCurrency,
    formatCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
