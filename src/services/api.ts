const API_BASE = "/api";

function getHeaders() {
  const token = localStorage.getItem("smartswap_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "An unexpected error occurred.");
  }

  return payload.data as T;
}

export const api = {
  auth: {
    async register(name: string, email: string, password: string): Promise<{ token: string; user: any }> {
      return request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
    },

    async login(email: string, password: string): Promise<{ token: string; user: any }> {
      return request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },

    async getMe(): Promise<any> {
      return request("/auth/me");
    },
  },

  user: {
    async addCryptoWallet(currency: string, address: string, label: string): Promise<any> {
      return request("/user/wallet", {
        method: "POST",
        body: JSON.stringify({ currency, address, label }),
      });
    },

    async addBankAccount(bankName: string, accountNumber: string, routingNumber: string, label: string): Promise<any> {
      return request("/user/bank", {
        method: "POST",
        body: JSON.stringify({ bankName, accountNumber, routingNumber, label }),
      });
    },

    async getWithdrawalMethods(): Promise<any> {
      return request("/user/withdraw-methods");
    },
  },

  swap: {
    async getQuote(fromCurrency: string, toCurrency: string, amount: number): Promise<any> {
      return request(`/swap/quote?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&amount=${amount}`);
    },

    async createSwap(fromCurrency: string, toCurrency: string, fromAmount: number, withdrawMethodId: string): Promise<any> {
      return request("/swap/transact", {
        method: "POST",
        body: JSON.stringify({ fromCurrency, toCurrency, fromAmount, withdrawMethodId }),
      });
    },

    async getHistory(): Promise<any> {
      return request("/swap/history");
    },
  },

  admin: {
    async getAllUsers(): Promise<any[]> {
      return request("/admin/users");
    },

    async getAllTransactions(): Promise<any[]> {
      return request("/admin/transactions");
    },

    async updateTransactionStatus(id: string, status: "completed" | "failed"): Promise<any> {
      return request(`/admin/transactions/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
    },

    async addDepositDetail(type: "crypto" | "bank", currency: string, addressOrDetails: string): Promise<any> {
      return request("/admin/deposit", {
        method: "POST",
        body: JSON.stringify({ type, currency, addressOrDetails }),
      });
    },

    async updateDepositDetailStatus(id: string, isActive: boolean): Promise<any> {
      return request(`/admin/deposit/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ isActive }),
      });
    },

    async syncPrices(): Promise<any[]> {
      return request("/admin/sync-prices", {
        method: "POST",
      });
    },
  },
};
