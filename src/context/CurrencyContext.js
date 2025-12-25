import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

const CURRENCIES = {
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rate: 1, countries: ['GH'] },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.062, countries: ['US'] },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.058, countries: ['FR', 'DE', 'IT', 'ES', 'NL', 'BE'] },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.050, countries: ['GB'] },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 95.5, countries: ['NG'] },
  XOF: { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc', rate: 38.5, countries: ['SN', 'CI', 'BF', 'ML', 'NE'] },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 1.15, countries: ['ZA'] },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 8.5, countries: ['KE'] },
};

const COUNTRY_TO_CURRENCY = {
  GH: 'GHS',
  US: 'USD',
  GB: 'GBP',
  NG: 'NGN',
  ZA: 'ZAR',
  KE: 'KES',
  SN: 'XOF',
  CI: 'XOF',
  BF: 'XOF',
  ML: 'XOF',
  NE: 'XOF',
  FR: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('GHS');
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    initializeCurrency();
  }, [user]);

  const initializeCurrency = async () => {
    try {
      setLoading(true);

      if (user?.currency) {
        setCurrency(user.currency);
        setLoading(false);
        return;
      }

      const savedCurrency = await SecureStore.getItemAsync('userCurrency');
      if (savedCurrency && CURRENCIES[savedCurrency]) {
        setCurrency(savedCurrency);
        setLoading(false);
        return;
      }

      const detectedCountry = await detectUserLocation();
      if (detectedCountry) {
        setCountry(detectedCountry);
        const countryCurrency = COUNTRY_TO_CURRENCY[detectedCountry] || 'GHS';
        setCurrency(countryCurrency);
        await SecureStore.setItemAsync('userCurrency', countryCurrency);
      } else {

        setCurrency('GHS');
      }
    } catch (error) {
      console.error('Error initializing currency:', error);
      setCurrency('GHS');
    } finally {
      setLoading(false);
    }
  };

  const detectUserLocation = async () => {
    try {

      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Invalid JSON response');
      }

      if (data.country_code) {
        return data.country_code;
      }
    } catch (error) {

      try {
        const response = await fetch('https://ip-api.com/json/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          return null;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return null;
        }

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          return null;
        }

        if (data.countryCode) {
          return data.countryCode;
        }
      } catch (err) {

        return null;
      }
    }
    return null;
  };

  const updateCurrency = async (newCurrency) => {
    if (!CURRENCIES[newCurrency]) {
      console.error('Invalid currency:', newCurrency);
      return;
    }

    setCurrency(newCurrency);
    await SecureStore.setItemAsync('userCurrency', newCurrency);

  };

  const convertPrice = (amount, fromCurrency = 'GHS') => {
    if (currency === fromCurrency) {
      return amount;
    }

    const fromRate = CURRENCIES[fromCurrency]?.rate || 1;
    const toRate = CURRENCIES[currency]?.rate || 1;

    const baseAmount = amount / fromRate;
    const convertedAmount = baseAmount * toRate;

    return Math.round(convertedAmount * 100) / 100;
  };

  const formatPrice = (amount, fromCurrency = 'GHS') => {
    const convertedAmount = convertPrice(amount, fromCurrency);
    const currencyData = CURRENCIES[currency];
    const symbol = currencyData?.symbol || currency;

    if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
      return `${symbol}${convertedAmount.toFixed(2)}`;
    } else {
      return `${symbol} ${convertedAmount.toFixed(2)}`;
    }
  };

  const formatPriceValue = (amount, fromCurrency = 'GHS') => {

    return convertPrice(amount, fromCurrency).toFixed(2);
  };

  const getCurrencyData = () => {
    return CURRENCIES[currency] || CURRENCIES.GHS;
  };

  const getAvailableCurrencies = () => {
    return Object.values(CURRENCIES);
  };

  const value = {
    currency,
    country,
    loading,
    updateCurrency,
    convertPrice,
    formatPrice,
    formatPriceValue,
    getCurrencyData,
    getAvailableCurrencies,
    currencies: CURRENCIES,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

