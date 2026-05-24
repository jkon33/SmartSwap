import { Response } from "express";
import { dbStore } from "./dbStore";
import { forcePriceSync } from "./priceService";

export function getAllUsers(req: any, res: Response): void {
  try {
    const users = dbStore.getUsers();
    // Exclude password hashes for safety
    const safeUsers = users.map(({ passwordHash, ...rest }) => rest);

    res.status(200).json({
      success: true,
      data: safeUsers,
    });
  } catch (error: any) {
    console.error("Admin Get Users Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve user accounts." });
  }
}

export function getAllTransactions(req: any, res: Response): void {
  try {
    const transactions = dbStore.getTransactions();

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    console.error("Admin Get Transactions Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve transaction records." });
  }
}

export function updateTransactionStatus(req: any, res: Response): void {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status || !["pending", "completed", "failed"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid transaction reference or state." });
      return;
    }

    const tx = dbStore.getTransactionById(id);
    if (!tx) {
      res.status(404).json({ success: false, message: "Transaction record was not found." });
      return;
    }

    if (tx.status !== "pending") {
      res.status(400).json({ success: false, message: `Transaction is already finalized as: ${tx.status}` });
      return;
    }

    const updatedTx = dbStore.updateTransactionStatus(id, status);

    res.status(200).json({
      success: true,
      message: `Transaction state successfully updated to: ${status}!`,
      data: updatedTx,
    });
  } catch (error: any) {
    console.error("Admin Update Transaction Error:", error);
    res.status(500).json({ success: false, message: "Failed to update transaction status." });
  }
}

export function addDepositDetail(req: any, res: Response): void {
  try {
    const { type, currency, addressOrDetails } = req.body;

    if (!type || !currency || !addressOrDetails) {
      res.status(400).json({ success: false, message: "Missing required fields (type, currency, addressOrDetails)." });
      return;
    }

    const newDeposit = dbStore.createDepositDetail({
      type,
      currency,
      addressOrDetails,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Admin deposit method successfully configured!",
      data: newDeposit,
    });
  } catch (error: any) {
    console.error("Add Deposit Detail Error:", error);
    res.status(500).json({ success: false, message: "Failed to set up deposit method." });
  }
}

export function updateDepositDetailStatus(req: any, res: Response): void {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400).json({ success: false, message: "isActive state must be boolean." });
      return;
    }

    const updated = dbStore.updateDepositDetail(id, { isActive });
    if (!updated) {
      res.status(404).json({ success: false, message: "Deposit method not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Deposit active state updated to: ${isActive}`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Update Deposit Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to modify deposit active state." });
  }
}

export async function syncPrices(req: any, res: Response): Promise<void> {
  try {
    const updatedPrices = await forcePriceSync();

    res.status(200).json({
      success: true,
      message: "External rates manually synchronised and broadcast successfully!",
      data: updatedPrices,
    });
  } catch (error: any) {
    console.error("Admin Sync Prices Error:", error);
    res.status(500).json({ success: false, message: "Price synchronization failed." });
  }
}
