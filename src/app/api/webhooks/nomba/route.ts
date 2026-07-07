import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

function getConvexClient(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  }
  return new ConvexHttpClient(url);
}

/**
 * Verify Nomba webhook signature using HMAC-SHA256.
 */
function verifyNombaSignature(payload: string, signature: string): boolean {
  const secret = process.env.NOMBA_WEBHOOK_SECRET;
  if (!secret) {
    console.error("NOMBA_WEBHOOK_SECRET not configured");
    return false;
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  const bodyText = await request.text();
  let body: any;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Verify signature except for mock transaction simulations
  const signature = request.headers.get("x-nomba-signature");
  const isMock = body?.data?.transactionId?.startsWith("MOCK-TXN-");

  if (!isMock) {
    if (!signature) {
      console.error("Missing X-Nomba-Signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    if (!verifyNombaSignature(bodyText, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Unauthorized: invalid signature" },
        { status: 401 }
      );
    }
  }

  try {
    const { event, data } = body;

    if (event !== "transaction.completed") {
      console.log(`Ignoring event type: ${event}`);
      return NextResponse.json({ received: true });
    }

    // ⚠️ IDEMPOTENCY CHECK
    const txnRef = data.reference || data.transactionId;

    const client = getConvexClient();

    // Check if it's a direct virtual account transfer first
    const virtualAccountNumber = data.virtualAccountNumber || data.accountNumber;
    if (virtualAccountNumber) {
      const wallet = await client.query(api.wallets.getWalletByAccountNumber, {
        accountNumber: virtualAccountNumber,
      });

      if (wallet) {
        console.log(`✓ Webhook matches virtual account: ${virtualAccountNumber}. Crediting wallet: ${wallet.name}`);
        await client.mutation(api.wallets.creditWalletDirectly, {
          walletId: wallet._id,
          amount: data.amount,
          paymentReference: data.transactionId || data.reference || `VA-${Date.now()}`,
          reason: "direct_bank_transfer",
        });

        return NextResponse.json({
          success: true,
          reason: "direct_virtual_account_transfer_credited",
          walletName: wallet.name,
        });
      }
    }

    const existingTxn = await client.query(api.payments.getPaymentByReference, {
      reference: txnRef,
    });

    if (existingTxn && existingTxn.status === "completed") {
      console.log(`✓ Already processed: ${txnRef}`);
      return NextResponse.json({ already_processed: true });
    }

    if (!existingTxn) {
      console.error(`Payment not found: ${txnRef}`);
      return NextResponse.json({ error: "Payment record not found" });
    }

    // ⚠️ AMOUNT VERIFICATION — allow the total charged to be >= the fee amount (platform fee adds on top)
    if (existingTxn.amount > data.amount) {
      console.error(
        `Amount insufficient: DB fee ₦${existingTxn.amount} vs webhook ₦${data.amount}`
      );
      await client.mutation(api.paymentsInternal.logAudit, {
        institutionId: existingTxn.institutionId,
        action: "PAYMENT_FAILED",
        entityId: existingTxn._id,
        newValue: { error: "Amount mismatch" },
        success: false,
      });
      return NextResponse.json({ error: "Amount mismatch" });
    }

    // Use fee breakdown stored on the payment record at creation time
    const breakdown = {
      tuition: (existingTxn as any).feeTuition || existingTxn.amount,
      sugDues: (existingTxn as any).feeSugDues || 0,
      facultyDues: (existingTxn as any).feeFacultyDues || 0,
      departmentDues: (existingTxn as any).feeDepartmentDues || 0,
    };

    // Get slug data from payment record
    const facultySlug = (existingTxn as any).facultySlug || "";
    const departmentSlug = (existingTxn as any).departmentSlug || "";
    const platformFee = (existingTxn as any).platformFee || Math.max(0, data.amount - existingTxn.amount);
    const nombaFee = data.fee || data.transaction?.fee || 0;

    // Route payment to the 4 wallets using feeConfig-based routing
    const allocation = await client.mutation(api.payments.routePayment, {
      institutionId: existingTxn.institutionId,
      paymentId: existingTxn._id,
      nombaTransactionId: data.transactionId,
      feeBreakdown: breakdown,
      facultySlug,
      departmentSlug,
      platformFee,
      nombaFee,
    });

    console.log(`✓ Payment routed: ${txnRef} → wallets updated`, allocation);

    // Asynchronously trigger instant platform fee payout to platform owner
    try {
      console.log(`Triggering instant platform fee payout for payment reference: ${txnRef}`);
      await client.action(api.nomba.payoutPlatformFeeAction, {
        paymentReference: txnRef,
      });
    } catch (payoutErr) {
      console.error("Instant platform fee payout failed:", payoutErr);
      // Do not block webhook success response if payout fails
    }

    return NextResponse.json({
      success: true,
      allocation,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal processing error" });
  }
}
