import { Response } from "express";
import { dbStore, CryptoWallet, BankAccount } from "./dbStore";

export function addCryptoWallet(req: any, res: Response): void {
  try {
    const userId = req.user?.id;
    const { currency, address, label } = req.body;

    if (!currency || !address || !label) {
      res.status(400).json({ success: false, message: "Missing required fields (currency, address, label)." });
      return;
    }

    const user = dbStore.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const newWallet: CryptoWallet = {
      id: "wlt_" + Math.random().toString(36).substr(2, 9),
      currency,
      address,
      label,
    };

    const updatedWallets = [...user.cryptoWallets, newWallet];
    dbStore.updateUser(userId, { cryptoWallets: updatedWallets });

    res.status(200).json({
      success: true,
      message: "Crypto wallet payout destination added successfully!",
      data: newWallet,
    });
  } catch (error: any) {
    console.error("Add Crypto Wallet Error:", error);
    res.status(500).json({ success: false, message: "Failed to add crypto address." });
  }
}

export function addBankAccount(req: any, res: Response): void {
  try {
    const userId = req.user?.id;
    const { bankName, accountNumber, routingNumber, label } = req.body;

    if (!bankName || !accountNumber || !routingNumber || !label) {
      res.status(400).json({ success: false, message: "Missing required details (bankName, accountNumber, routingNumber, label)." });
      return;
    }

    const user = dbStore.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const newBank: BankAccount = {
      id: "bnk_" + Math.random().toString(36).substr(2, 9),
      bankName,
      accountNumber,
      routingNumber,
      label,
    };

    const updatedBanks = [...user.bankAccounts, newBank];
    dbStore.updateUser(userId, { bankAccounts: updatedBanks });

    res.status(200).json({
      success: true,
      message: "Bank account payout destination added successfully!",
      data: newBank,
    });
  } catch (error: any) {
    console.error("Add Bank Account Error:", error);
    res.status(500).json({ success: false, message: "Failed to add bank account destination." });
  }
}

export function getWithdrawalMethods(req: any, res: Response): void {
  try {
    const userId = req.user?.id;
    const user = dbStore.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        cryptoWallets: user.cryptoWallets,
        bankAccounts: user.bankAccounts,
        balances: user.balances,
      },
    });
  } catch (error: any) {
    console.error("Get Withdrawal Methods Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve payout profiles." });
  }
}
