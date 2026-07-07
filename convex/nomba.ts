import { v } from "convex/values";
import { action } from "./_generated/server";

// Centralized in-memory token cache for Action container reuse
let cachedToken: string | null = null;
let tokenExpiryTime = 0;

/**
 * Helper to fetch Nomba OAuth 2.0 Access Token.
 */
export async function getNombaToken(): Promise<string> {
  const clientId = process.env.NOMBA_CLIENT_ID;
  const clientSecret = process.env.NOMBA_CLIENT_SECRET;
  const merchantId = process.env.NOMBA_MERCHANT_ID;
  const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";

  if (!clientId || !clientSecret || !merchantId) {
    throw new Error(
      "Missing Nomba configuration. Please set NOMBA_CLIENT_ID, NOMBA_CLIENT_SECRET, and NOMBA_MERCHANT_ID."
    );
  }

  // Use cached token if valid
  if (cachedToken && Date.now() < tokenExpiryTime - 60000) {
    return cachedToken;
  }

  console.log("Fetching new Nomba access token...");
  const response = await fetch(`${baseUrl}/v1/auth/token/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accountId: merchantId,
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Nomba Auth Failed:", errText);
    throw new Error(`Failed to authenticate with Nomba API: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.code !== "00" || !result.data?.access_token) {
    throw new Error(`Nomba Auth Error: ${result.description || "Unknown error"}`);
  }

  cachedToken = result.data.access_token;
  // Parse expiration time
  tokenExpiryTime = new Date(result.data.expiresAt).getTime();
  return cachedToken!;
}

// ============================================================================
// CONVEX ACTIONS
// ============================================================================

/**
 * Action to create a real Dedicated Virtual Account on Nomba.
 */
export const createVirtualAccount = action({
  args: {
    accountRef: v.string(),
    accountName: v.string(),
  },
  handler: async (ctx, args) => {
    const merchantId = process.env.NOMBA_MERCHANT_ID!;
    const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
    const token = await getNombaToken();

    console.log(`Creating virtual account: ${args.accountName} (Ref: ${args.accountRef})`);

    const response = await fetch(`${baseUrl}/v1/accounts/virtual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        accountId: merchantId,
      },
      body: JSON.stringify({
        accountRef: args.accountRef,
        accountName: args.accountName,
        currency: "NGN",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Virtual Account Creation Failed:", errText);
      throw new Error(`Nomba Virtual Account creation failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.code !== "00") {
      throw new Error(`Nomba Virtual Account error: ${result.description || "Unknown error"}`);
    }

    return {
      bankAccountNumber: result.data.bankAccountNumber,
      bankName: result.data.bankName,
      bankAccountName: result.data.bankAccountName,
    };
  },
});

/**
 * Action to lookup bank account details (verify recipient).
 */
export const lookupBankAccount = action({
  args: {
    accountNumber: v.string(),
    bankCode: v.string(),
  },
  handler: async (ctx, args) => {
    const merchantId = process.env.NOMBA_MERCHANT_ID!;
    const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
    const token = await getNombaToken();

    console.log(`Looking up account number: ${args.accountNumber} in bank: ${args.bankCode}`);

    const response = await fetch(`${baseUrl}/v1/transfers/bank/lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        accountId: merchantId,
      },
      body: JSON.stringify({
        accountNumber: args.accountNumber,
        bankCode: args.bankCode,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Bank Account Lookup Failed:", errText);
      throw new Error(`Bank account lookup failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.code !== "00") {
      throw new Error(`Nomba Lookup error: ${result.description || "Unknown error"}`);
    }

    return {
      accountNumber: result.data.accountNumber,
      accountName: result.data.accountName,
    };
  },
});

/**
 * Action to perform a real-world bank transfer (payout).
 */
export const executeBankPayout = action({
  args: {
    amount: v.number(),
    accountNumber: v.string(),
    accountName: v.string(),
    bankCode: v.string(),
    merchantTxRef: v.string(),
    narration: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const merchantId = process.env.NOMBA_MERCHANT_ID!;
    const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
    const token = await getNombaToken();

    console.log(
      `Executing payout of ₦${args.amount} to ${args.accountName} (${args.accountNumber}, Bank Code: ${args.bankCode})`
    );

    const response = await fetch(`${baseUrl}/v2/transfers/bank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        accountId: merchantId,
      },
      body: JSON.stringify({
        amount: args.amount,
        accountNumber: args.accountNumber,
        accountName: args.accountName,
        bankCode: args.bankCode,
        merchantTxRef: args.merchantTxRef,
        senderName: "Split Platform",
        narration: args.narration || "Split Wallet Transfer",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Bank Transfer Payout Failed:", errText);
      throw new Error(`Nomba Bank Transfer failed: ${response.statusText}`);
    }

    const result = await response.json();
    // Nomba uses code '00' or description 'SUCCESS' / 'PROCESSING' for valid payouts
    if (result.code !== "00" && result.code !== "200") {
      throw new Error(`Nomba Payout error: ${result.description || "Unknown error"}`);
    }

    return {
      success: true,
      transferId: result.data?.id || args.merchantTxRef,
      fee: result.data?.fee || 0,
      status: result.data?.status || "SUCCESS",
    };
  },
});

/**
 * Action to instantly payout the ₦100 platform fee to the platform owner's bank account.
 * This is triggered upon successful payment webhook verification.
 */
export const payoutPlatformFeeAction = action({
  args: {
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    const platformBankCode = process.env.PLATFORM_OWNER_BANK_CODE;
    const platformAccountNumber = process.env.PLATFORM_OWNER_ACCOUNT_NUMBER;
    const platformAccountName = process.env.PLATFORM_OWNER_ACCOUNT_NAME;

    if (!platformBankCode || !platformAccountNumber || !platformAccountName) {
      console.warn("⚠️ Platform owner bank details not configured. Skipping automated platform fee transfer.");
      return { success: false, reason: "credentials_not_set" };
    }

    const merchantTxRef = `PFEE-${args.paymentReference}-${Date.now().toString().slice(-4)}`;

    try {
      const merchantId = process.env.NOMBA_MERCHANT_ID!;
      const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
      const token = await getNombaToken();

      console.log(`Instantly paying out ₦100 platform fee to ${platformAccountName} (${platformAccountNumber})`);

      const response = await fetch(`${baseUrl}/v2/transfers/bank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          accountId: merchantId,
        },
        body: JSON.stringify({
          amount: 100, // ₦100 platform fee
          accountNumber: platformAccountNumber,
          accountName: platformAccountName,
          bankCode: platformBankCode,
          merchantTxRef: merchantTxRef,
          senderName: "Split Commission",
          narration: `Split Platform Fee - Ref: ${args.paymentReference}`,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Instant platform fee payout failed:", errText);
        return { success: false, reason: "api_error", details: errText };
      }

      const result = await response.json();
      return {
        success: true,
        transferId: result.data?.id || merchantTxRef,
      };
    } catch (err: any) {
      console.error("Error executing instant platform fee payout:", err.message || err);
      return { success: false, reason: "error", error: err.message || err };
    }
  },
});
