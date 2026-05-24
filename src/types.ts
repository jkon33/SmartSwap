export interface CryptoWallet {
  id: string;
  currency: string;
  address: string;
  label: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  label: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  cryptoWallets: CryptoWallet[];
  bankAccounts: BankAccount[];
  balances: Record<string, number>;
  createdAt: string;
}

export interface DepositDetail {
  id: string;
  type: "crypto" | "bank";
  currency: string;
  addressOrDetails: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  status: "pending" | "completed" | "failed";
  depositDetails: DepositDetail;
  withdrawDetails: {
    id: string;
    currency?: string;
    address?: string;
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    label: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Price {
  currencyPair: string; // "BTC/USD", etc
  rate: number;
  lastUpdated: string;
}
