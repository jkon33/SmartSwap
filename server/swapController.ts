import { Response } from "express";
import { dbStore, Transaction } from "./dbStore";
import { calculateSwapRate } from "./priceService";

export function getQuote(req: any, res: Response): void {
  try {
    const { fromCurrency, toCurrency, amount } = req.query;

    if (!fromCurrency || !toCurrency || !amount) {
      res.status(400).json({ success: false, message: "Missing query parameters: fromCurrency, toCurrency, amount." });
      return;
    }

    const parsedAmount = parseFloat(amount as string);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ success: false, message: "Invalid amount entered. Must be greater than 0." });
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

    const parsedAmount = parseFloat(fromAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ success: false, message: "Amount must be a positive number." });
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
