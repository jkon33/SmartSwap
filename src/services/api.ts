import { Capacitor } from "@capacitor/core";

export const getApiBase = () => {
  // 1. Check for custom backend override in localStorage first
  if (typeof window !== "undefined") {
    const savedUrl = localStorage.getItem("smartswap_backend_url");
    if (savedUrl) {
      // Invalidate old broken pre-release URLs if present
      if (savedUrl.includes("ais-pre-p632kafgq6545hshnzdulb")) {
        localStorage.removeItem("smartswap_backend_url");
      } else {
        const cleanUrl = savedUrl.trim().replace(/\/+$/, "");
        return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
      }
    }
  }

  // 2. Explicitly check Vite env variable if provided
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
  }

  // 3. Fallback only if running natively in compiled mobile container (Capacitor Android / iOS)
  if (typeof window !== "undefined") {
    try {
      const isNativeMobile = Capacitor.isNativePlatform() && Capacitor.getPlatform() !== "web";
      if (isNativeMobile) {
        return "https://ais-dev-p632kafgq6545hshnzdulb-371764684561.europe-west2.run.app/api";
      }
    } catch {
      // ignore
    }
  }

  // 4. Default for web browsers, previews, and local dev
  return "/api";
};

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
  const base = getApiBase();
  const url = `${base}${path}`;

  try {
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
  } catch (err: any) {
    // If request failed and we were trying a custom/remote base, fallback to local relative /api
    if (base !== "/api") {
      try {
        const fallbackUrl = `/api${path}`;
        const fallbackRes = await fetch(fallbackUrl, {
          ...options,
          headers: {
            ...getHeaders(),
            ...(options.headers || {}),
          },
        });
        if (fallbackRes.ok) {
          const payload = await fallbackRes.json();
          if (payload.success !== false) {
            return payload.data as T;
          }
        }
      } catch {
        // continue to throw original error
      }
    }
    throw err;
  }
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

    async verifyCode(email: string, code: string): Promise<any> {
      return request("/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
    },

    async resendCode(email: string): Promise<any> {
      return request("/auth/resend-code", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
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
    async getPrices(): Promise<any[]> {
      return request("/prices");
    },

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

  assets: {
    async list(): Promise<any[]> {
      return request("/assets");
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

    async addAsset(code: string, name: string, type: "crypto" | "fiat", rateToUSD: number, iconBg?: string): Promise<any> {
      return request("/admin/assets", {
        method: "POST",
        body: JSON.stringify({ code, name, type, rateToUSD, iconBg }),
      });
    },

    async updateAsset(code: string, updates: { name?: string; isActive?: boolean; rateToUSD?: number; iconBg?: string }): Promise<any> {
      return request(`/admin/assets/${code}`, {
        method: "POST",
        body: JSON.stringify(updates),
      });
    },
  },
};
