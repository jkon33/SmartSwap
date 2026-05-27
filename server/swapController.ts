import { Response } from "express";
import { dbStore, Transaction } from "./dbStore";
import { calculateSwapRate } from "./priceService";
import { GoogleGenAI } from "@google/genai";
import { parseAndValidateAmount } from "./security";

let genAIClient: any = null;
function getGenAI() {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined under environment secrets. Please verify your settings.");
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

export function getQuote(req: any, res: Response): void {
  try {
    const { fromCurrency, toCurrency, amount } = req.query;

    if (!fromCurrency || !toCurrency || !amount) {
      res.status(400).json({ success: false, message: "Missing query parameters: fromCurrency, toCurrency, amount." });
      return;
    }

    const { valid, parsed: parsedAmount, error } = parseAndValidateAmount(amount, "exchange amount");
    if (!valid) {
      res.status(400).json({ success: false, message: error || "Invalid quantity specified." });
      return;
    }

    const rate = calculateSwapRate(fromCurrency as string, toCurrency as string);
    const toAmount = parsedAmount * rate;

    res.status(200).json({
      success: true,
      data: {
        fromCurrency,
        toCurrency,
        fromAmount: parsedAmount,
        toAmount: Number(toAmount.toFixed(8)),
        rate,
      },
    });
  } catch (error: any) {
    console.error("Get Quote Error:", error);
    res.status(500).json({ success: false, message: "Failed to calculate exchange quote." });
  }
}

export function createSwapTransaction(req: any, res: Response): void {
  try {
    const userId = req.user?.id;
    const { fromCurrency, toCurrency, fromAmount, withdrawMethodId } = req.body;

    if (!fromCurrency || !toCurrency || !fromAmount || !withdrawMethodId) {
      res.status(400).json({ success: false, message: "Missing fields (fromCurrency, toCurrency, fromAmount, withdrawMethodId)." });
      return;
    }

    const { valid, parsed: parsedAmount, error } = parseAndValidateAmount(fromAmount, "funding allocation");
    if (!valid) {
      res.status(400).json({ success: false, message: error || "Invalid swap amount." });
      return;
    }

    const user = dbStore.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User profile not found." });
      return;
    }

    // Balance validation
    const currentBalance = user.balances[fromCurrency] || 0;
    if (currentBalance < parsedAmount) {
      res.status(400).json({
        success: false,
        message: `Insufficient funds. Your simulated ${fromCurrency} balance is ${currentBalance.toFixed(5)}, but you tried to swap ${parsedAmount.toFixed(5)}.`,
      });
      return;
    }

    // Payout withdrawal info
    let withdrawDetails = user.cryptoWallets.find((w) => w.id === withdrawMethodId);
    if (!withdrawDetails) {
      withdrawDetails = user.bankAccounts.find((b) => b.id === withdrawMethodId) as any;
    }

    if (!withdrawDetails) {
      res.status(400).json({ success: false, message: "Selected withdrawal method or payout profile was not found." });
      return;
    }

    // Admin deposit address selection
    const adminDeposits = dbStore.getDepositDetails();
    let depositDetails = adminDeposits.find((d) => d.currency === fromCurrency && d.isActive);

    if (!depositDetails) {
      // Create dynamically if not seeded / deactivated
      depositDetails = dbStore.createDepositDetail({
        type: ["USD", "EUR", "GBP"].includes(fromCurrency) ? "bank" : "crypto",
        currency: fromCurrency,
        addressOrDetails: ["USD", "EUR", "GBP"].includes(fromCurrency) 
          ? `Temp Admin ${fromCurrency} Bank Account: SS-MOCK-9921`
          : `Temp Admin ${fromCurrency} Wallet: 0xMOCK_ADDR_DYNAMIC_KEY_SS_2026`,
        isActive: true,
      });
    }

    // Rate locking
    const rate = calculateSwapRate(fromCurrency, toCurrency);
    const toAmount = parsedAmount * rate;

    const newTx = dbStore.createTransaction({
      userId,
      userEmail: user.email,
      fromCurrency,
      toCurrency,
      fromAmount: parsedAmount,
      toAmount: Number(toAmount.toFixed(8)),
      rate,
      status: "pending",
      depositDetails,
      withdrawDetails,
    });

    res.status(201).json({
      success: true,
      message: "Swap transaction initiated successfully!",
      data: newTx,
    });
  } catch (error: any) {
    console.error("Create Transaction Error:", error);
    res.status(500).json({ success: false, message: "Failed to create swap transaction." });
  }
}

export function getUserTransactions(req: any, res: Response): void {
  try {
    const userId = req.user?.id;
    const transactions = dbStore.getTransactionsByUserId(userId);
    
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    console.error("Get User Transactions Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transaction histories." });
  }
}

export async function getAiAdvice(req: any, res: Response): Promise<void> {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;

    if (!fromCurrency || !toCurrency) {
      res.status(400).json({ success: false, message: "Missing fromCurrency or toCurrency for generating AI advice." });
      return;
    }

    const ai = getGenAI();
    const prompt = `You are an elite financial technology advisor and asset trading strategist for the SmartSwap multi-asset swapping network. 
Provide a concise, professional, and visually engaging analysis/advice for a user wishing to swap ${amount ? amount : "any"} ${fromCurrency} into ${toCurrency}.

Your advice should match these styling and safety requirements:
1. State the profile and utility of ${fromCurrency} vs ${toCurrency} (Cryptocurrency vs Fiat dynamics if applicable).
2. Offer 3 actionable, highly professional insights (e.g., market sentiment, volume characteristics, stablecoin vs token attributes, or structural economic indicators for fiat).
3. Do not give direct speculation or make specific price guarantees. Use clear, balanced risk terminology.
4. Conclude with a supportive sandbox disclaimer stating that SmartSwap is a fully functional testing protocol and all assets are sandbox simulation credits.
5. Format the output with clear, professional markdown headings, bullet points, and dynamic bolding so it looks sleek when rendered. Avoid long blocks of text. Keep it focused, high impact and scanable under 200 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.status(200).json({
      success: true,
      data: {
        advice: response.text,
      },
    });
  } catch (error: any) {
    console.error("AI Advice Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to generate AI swapping advice." });
  }
}
