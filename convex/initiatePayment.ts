import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

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

    // 2. Get allocation rules and fee configuration
    const rules = await ctx.runQuery(i.paymentsInternal.getRulesForInstitution, {
      institutionId: args.institutionId,
    });

    if (rules.length === 0) {
      throw new Error("Allocation rules not configured. Contact administration.");
    }

    // 3. Calculate fee from student's level fee items
    const levelFee = await ctx.runQuery(i.fees.calculateLevelFee, {
      institutionId: args.institutionId,
      level: studentRecord.level,
    });

    let amount: number;
    let feeBreakdown: {
      tuition: number;
      departmentDues: number;
      facultyDues: number;
      sugDues: number;
    } = { tuition: 0, departmentDues: 0, facultyDues: 0, sugDues: 0 };

    if (levelFee.total > 0) {
      amount = levelFee.total;
      feeBreakdown = {
        tuition: levelFee.tuition || 0,
        departmentDues: levelFee.departmentDues || 0,
        facultyDues: levelFee.facultyDues || 0,
        sugDues: levelFee.sugDues || 0,
      };
    } else {
      // Fallback: compute total from fixed allocation rules
      const fixedTotal = rules.reduce((sum: number, r: any) => sum + r.amount, 0);
      amount = fixedTotal > 0 ? fixedTotal : 75000;
      feeBreakdown = { tuition: amount, departmentDues: 0, facultyDues: 0, sugDues: 0 };
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

    // 6. Call Nomba
    const nombaApiKey = process.env.NOMBA_API_KEY;
    const nombaBaseUrl = process.env.NOMBA_BASE_URL;

    if (!nombaApiKey || !nombaBaseUrl) {
      throw new Error("Nomba credentials not configured");
    }

    const nombaResponse = await fetch(
      `${nombaBaseUrl}/transactions/initiate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${nombaApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "NGN",
          customerName: "Student",
          customerEmail: studentRecord.email,
          description: `${studentRecord.faculty} - ${studentRecord.department} Level ${studentRecord.level}`,
          reference,
          callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nomba`,
          paymentMethods: ["card", "bank_transfer"],
          metadata: {
            studentMatric: args.studentMatric,
            faculty: studentRecord.faculty,
            department: studentRecord.department,
            level: studentRecord.level,
            institutionId: args.institutionId,
          },
        }),
      }
    );

    if (!nombaResponse.ok) {
      const errorText = await nombaResponse.text();
      console.error("Nomba API error:", errorText);
      throw new Error("Payment initiation failed. Please try again.");
    }

    const nombaData = await nombaResponse.json();

    // 7. Save payment record
    const paymentId = await ctx.runMutation(i.paymentsInternal.createPayment, {
      institutionId: args.institutionId,
      nombaTransactionId: nombaData.data.transactionId,
      reference,
      studentMatric: args.studentMatric,
      faculty: studentRecord.faculty,
      department: studentRecord.department,
      level: studentRecord.level,
      amount,
      status: "pending",
    });

    // 8. Log audit
    await ctx.runMutation(i.paymentsInternal.logAudit, {
      institutionId: args.institutionId,
      action: "PAYMENT_INITIATED",
      entityId: paymentId,
      newValue: { reference, amount, matric: args.studentMatric },
      success: true,
    });

    return {
      reference,
      authorisationUrl: nombaData.data.authorisationUrl,
      transactionId: nombaData.data.transactionId,
      expiresAt: nombaData.data.expiresAt,
      amount,
      feeBreakdown,
    };
  },
});
