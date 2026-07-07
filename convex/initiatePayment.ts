import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { getNombaToken } from "./nomba";

// ============================================================================
// PAYMENT INITIATION
// ============================================================================

/**
 * Initiate a payment with Nomba (standalone action).
 * Lives in its own file to isolate the `internal` import — the generated
 * `api.d.ts` imports types from all convex modules, creating a circular
 * type reference for any file that ALSO imports from `_generated/api`.
 *
 * ⚠️ Amount calculated SERVER-SIDE using configurable rules.
 */
export const initiatePayment = action({
  args: {
    studentMatric: v.string(),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    // Cast internal to break the circular type chain through api.d.ts
    const i = internal as any;

    // 1. Validate student
    const studentRecord = await ctx.runQuery(i.paymentsInternal.validateStudent, {
      matric: args.studentMatric,
      institutionId: args.institutionId,
    });

    if (!studentRecord) {
      throw new Error(`Invalid matric: ${args.studentMatric}`);
    }
    if (studentRecord.status !== "active") {
      throw new Error(`Student ${args.studentMatric} is not active`);
    }

    // 2. Calculate fee from student's level fee items (no allocationRules needed)
    const levelFee = await ctx.runQuery(i.fees.calculateLevelFee, {
      institutionId: args.institutionId,
      level: studentRecord.level,
    });

    let amount: number;
    const feeBreakdown: {
      tuition: number;
      departmentDues: number;
      facultyDues: number;
      sugDues: number;
    } = { tuition: 0, departmentDues: 0, facultyDues: 0, sugDues: 0 };

    if (levelFee.total > 0) {
      amount = levelFee.total;
      feeBreakdown.tuition = levelFee.tuition || 0;
      feeBreakdown.departmentDues = levelFee.departmentDues || 0;
      feeBreakdown.facultyDues = levelFee.facultyDues || 0;
      feeBreakdown.sugDues = levelFee.sugDues || 0;
    } else {
      // Fallback: default amount if no fee config
      amount = 75000;
      feeBreakdown.tuition = 75000;
    }

    // Platform fee — ₦100 added on top of fee total
    const platformFee = 100;
    const netAmount = amount + platformFee;

    // Nomba fee calculation (1.5% capped at ₦2000)
    const rawTotal = Math.ceil(netAmount / (1 - 0.015));
    const rawFee = rawTotal - netAmount;
    let totalToCharge = rawTotal;
    let nombaFee = rawFee;

    if (rawFee > 2000) {
      totalToCharge = netAmount + 2000;
      nombaFee = 2000;
    }

    // 3. Get student slug data for routing
    const facultySlug = (studentRecord as any).facultySlug || "";
    const departmentSlug = (studentRecord as any).departmentSlug || "";

    if (!facultySlug) {
      throw new Error(
        `Faculty slug not set for ${args.studentMatric}. Set it in the student record (e.g., "SCIENCE") to enable payment routing.`
      );
    }

    if (!departmentSlug) {
      throw new Error(
        `Department slug not set for ${args.studentMatric}. Set it in the student record (e.g., "COMP-SCI") to enable payment routing.`
      );
    }

    // 4. Generate unique reference for idempotency
    const reference = `SPLIT-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)
      .toUpperCase()}`;

    // 5. Check for existing pending payment
    const existingPayment = await ctx.runQuery(
      i.paymentsInternal.getByMatricAndStatus,
      {
        matric: args.studentMatric,
        status: "pending",
        institutionId: args.institutionId,
      }
    );

    if (existingPayment) {
      throw new Error(
        "Pending payment already exists. Check status on dashboard."
      );
    }

    // 6. Call Nomba with totalToCharge (fee total + platform fee + transaction fee)
    const merchantId = process.env.NOMBA_MERCHANT_ID;
    const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";

    if (!merchantId) {
      throw new Error("NOMBA_MERCHANT_ID is not configured in environment variables.");
    }

    let nombaData: any;
    try {
      const token = await getNombaToken();
      console.log(`Initiating Nomba checkout order: Ref ${reference}, Amount ₦${totalToCharge}`);

      const response = await fetch(`${baseUrl}/v1/checkout/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          accountId: merchantId,
        },
        body: JSON.stringify({
          order: {
            orderReference: reference,
            customerId: args.studentMatric,
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/pay/receipt?reference=${reference}`,
            customerEmail: studentRecord.email,
            amount: totalToCharge,
            currency: "NGN",
          },
          tokenizeCard: false,
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Nomba Checkout API error response:", errorText);
        throw new Error(`Nomba Checkout API returned error status: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.code !== "00" || !result.data?.checkoutLink) {
        throw new Error(`Nomba Checkout error: ${result.description || "Unknown error"}`);
      }

      nombaData = result;
    } catch (err: any) {
      console.error("Nomba Checkout initiation failed:", err.message || err);
      throw new Error(`Payment checkout failed to initialize: ${err.message || err}`);
    }

    // 7. Save payment record — store fee total + breakdown data for webhook
    const paymentId = await ctx.runMutation(i.paymentsInternal.createPayment, {
      institutionId: args.institutionId,
      nombaTransactionId: reference, // Initially set to reference, updated to transactionId in webhook
      reference,
      studentMatric: args.studentMatric,
      faculty: studentRecord.faculty,
      department: studentRecord.department,
      level: studentRecord.level,
      amount,
      status: "pending",
      feeTuition: feeBreakdown.tuition,
      feeSugDues: feeBreakdown.sugDues,
      feeFacultyDues: feeBreakdown.facultyDues,
      feeDepartmentDues: feeBreakdown.departmentDues,
      facultySlug,
      departmentSlug,
      platformFee,
      nombaFee,
    });

    // 8. Log audit
    await ctx.runMutation(i.paymentsInternal.logAudit, {
      institutionId: args.institutionId,
      action: "PAYMENT_INITIATED",
      entityId: paymentId,
      newValue: { reference, amount: totalToCharge, matric: args.studentMatric, platformFee, nombaFee },
      success: true,
    });

    return {
      reference,
      authorisationUrl: nombaData.data.checkoutLink,
      transactionId: reference,
      expiresAt: Date.now() + 3600 * 1000,
      amount,
      platformFee,
      nombaFee,
      totalToCharge,
      feeBreakdown,
      facultySlug,
      departmentSlug,
    };
  },
});
