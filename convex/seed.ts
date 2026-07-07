import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Bootstrap the first SUPER_ADMIN user.
 *
 * This is a ONE-TIME setup mutation for bootstrapping the platform.
 * Once a SUPER_ADMIN exists, all subsequent users must be created
 * through the normal flow (createInstitutionUser for users with roles).
 *
 * After bootstrapping, sync the SUPER_ADMIN role to Clerk metadata so
 * middleware can redirect to /admin before the page loads:
 *
 *   curl -X POST https://<your-app>/api/clerk/sync-role \
 *     -H "Content-Type: application/json" \
 *     -d '{"clerkId":"user_2_xxx","isSuperAdmin":true}'
 *
 * Usage:
 *   1. Go to Clerk Dashboard → Users → Create User (email + password)
 *   2. Copy the Clerk ID (user_2_xxx) and the email
 *   3. Run this mutation via `npx convex run` or the Convex dashboard:
 *
 *      npx convex run --seed '{
 *        "clerkId": "user_2_xxx",
 *        "email": "admin@example.com"
 *      }'
 *
 *   Or paste the args directly into the Convex Dashboard data tab
 *   and call the `seed:bootstrapSuperAdmin` mutation.
 */
export const bootstrapSuperAdmin = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if a SUPER_ADMIN already exists (any user with SUPER_ADMIN in roles)
    const allUsers = await ctx.db.query("users").collect();
    const hasSuperAdmin = allUsers.some((u: any) =>
      u.roles.includes("SUPER_ADMIN"),
    );

    if (hasSuperAdmin) {
      throw new Error(
        "A SUPER_ADMIN already exists. Bootstrap is a one-time operation.",
      );
    }

    // Check if this Clerk ID is already taken
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existing) {
      throw new Error(
        `User with clerkId "${args.clerkId}" already exists. ` +
          "Use a different Clerk ID or modify the existing user's roles.",
      );
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      roles: ["SUPER_ADMIN"],
      activeRole: "SUPER_ADMIN",
      // SUPER_ADMIN has no institutionId — they are global
      institutionId: undefined,
      permissions: [],
      isActive: true,
    });

    // Log the bootstrap event
    await ctx.db.insert("auditLogs", {
      userId: args.clerkId,
      action: "USER_ROLE_CHANGED",
      entity: "users",
      entityId: userId,
      newValue: JSON.stringify({
        action: "BOOTSTRAP_SUPER_ADMIN",
        email: args.email,
        roles: ["SUPER_ADMIN"],
      }),
      timestamp: Date.now(),
      success: true,
    });

    return {
      success: true,
      userId,
      message: `SUPER_ADMIN created for ${args.email}. They can now sign in at /sign-in.`,
    };
  },
});

/**
 * Check if a SUPER_ADMIN exists in the system.
 * Useful for the sign-in page to show setup instructions.
 */
export const hasSuperAdmin = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.some((u: any) => u.roles.includes("SUPER_ADMIN"));
  },
});

/**
 * SUPER_ADMIN ONLY: Delete all institutions, their wallets, users, fees, payments,
 * sessions, and registrations — leaving only the SUPER_ADMIN user intact.
 * Run from Convex dashboard when resetting test data.
 */
export const resetInstitutions = mutation({
  handler: async (ctx) => {
    // Keep only super admin users
    const allUsers = await ctx.db.query("users").collect();
    const nonSuperAdmins = allUsers.filter(
      (u: any) => !u.roles.includes("SUPER_ADMIN")
    );
    for (const u of nonSuperAdmins) await ctx.db.delete(u._id);

    const tables = [
      "institutions",
      "institutionRegistrations",
      "wallets",
      "walletTransactions",
      "payments",
      "feeConfig",
      "academicSessions",
      "auditLogs",
      "associations",
      "withdrawalRequests",
      "studentRecords",
    ] as const;

    for (const table of tables) {
      const rows = await (ctx.db.query(table) as any).collect();
      for (const row of rows) await ctx.db.delete(row._id);
    }

    return { success: true, message: "All institution data cleared. Super admin(s) preserved." };
  },
});

/**
 * Seed a demo institution with all required structures and user scopes in a single transaction.
 */
export const seedDemoInstitution = mutation({
  args: {
    admin: v.object({ clerkId: v.string(), email: v.string() }),
    finance: v.object({ clerkId: v.string(), email: v.string() }),
    studentAffairs: v.object({ clerkId: v.string(), email: v.string() }),
    sugExco: v.object({ clerkId: v.string(), email: v.string(), matric: v.string() }),

    faculty1: v.object({
      name: v.string(),
      slug: v.string(),
      dean: v.object({ clerkId: v.string(), email: v.string() }),
      advisor: v.object({ clerkId: v.string(), email: v.string() }),
      exco: v.object({ clerkId: v.string(), email: v.string(), matric: v.string() }),
      depts: v.array(v.object({
        name: v.string(),
        slug: v.string(),
        hod: v.object({ clerkId: v.string(), email: v.string() }),
        advisor: v.object({ clerkId: v.string(), email: v.string() }),
        exco: v.optional(v.object({ clerkId: v.string(), email: v.string(), matric: v.string() })),
        students: v.array(v.object({
          clerkId: v.string(),
          email: v.string(),
          matric: v.string(),
        })),
      })),
    }),

    faculty2: v.object({
      name: v.string(),
      slug: v.string(),
      dean: v.object({ clerkId: v.string(), email: v.string() }),
      advisor: v.object({ clerkId: v.string(), email: v.string() }),
      exco: v.object({ clerkId: v.string(), email: v.string(), matric: v.string() }),
      depts: v.array(v.object({
        name: v.string(),
        slug: v.string(),
        hod: v.object({ clerkId: v.string(), email: v.string() }),
        advisor: v.object({ clerkId: v.string(), email: v.string() }),
        exco: v.optional(v.object({ clerkId: v.string(), email: v.string(), matric: v.string() })),
        students: v.array(v.object({
          clerkId: v.string(),
          email: v.string(),
          matric: v.string(),
        })),
      })),
    }),
  },
  handler: async (ctx, args) => {
    // Helper to generate account details
    const generateVA = (name: string, refType: string) => {
      const accountNumber = "99" + Math.floor(10000000 + Math.random() * 90000000).toString();
      const accountRef = `REF-VA-${refType.toUpperCase()}-${Date.now().toString().slice(-4)}`;
      return {
        bankName: "Providus Bank",
        accountNumber,
        accountName: name.slice(0, 30),
        accountRef,
      };
    };

    // 1. Create Institution
    const institutionId = await ctx.db.insert("institutions", {
      name: "Federal University of Technology, Minna",
      adminClerkId: args.admin.clerkId,
      isActive: true,
      createdAt: Date.now(),
    });

    // Create Institution Wallet
    const instVa = generateVA("FUTM Main Account", "INST");
    await ctx.db.insert("wallets", {
      institutionId,
      type: "institution",
      entityId: institutionId.toString(),
      name: "FUTM Main Wallet",
      totalCollected: 0,
      availableBalance: 0,
      minimumBalance: 0,
      transactionCount: 0,
      ...instVa,
    });

    // 2. Create SUG Association and Wallet
    const sugName = "Student Union Government";
    const sugEntityId = "sug-SUG";
    const sugAssociationId = await ctx.db.insert("associations", {
      institutionId,
      name: sugName,
      slug: "SUG",
      type: "sug",
      entityId: sugEntityId,
      staffAdvisorClerkId: undefined,
      studentExcoClerkIds: [args.sugExco.clerkId],
      isActive: true,
      createdAt: Date.now(),
    });

    const sugVa = generateVA("FUTM SUG Wallet", "SUG");
    await ctx.db.insert("wallets", {
      institutionId,
      type: "association",
      entityId: sugEntityId,
      name: "SUG Wallet",
      associationId: sugAssociationId,
      totalCollected: 0,
      availableBalance: 0,
      minimumBalance: 0,
      transactionCount: 0,
      ...sugVa,
    });

    // 3. Create General Institution Admins (Admin, Finance, Student Affairs)
    await ctx.db.insert("users", {
      clerkId: args.admin.clerkId,
      email: args.admin.email,
      roles: ["INSTITUTION_ADMIN"],
      activeRole: "INSTITUTION_ADMIN",
      institutionId,
      permissions: [],
      isActive: true,
    });

    await ctx.db.insert("users", {
      clerkId: args.finance.clerkId,
      email: args.finance.email,
      roles: ["FINANCE"],
      activeRole: "FINANCE",
      institutionId,
      permissions: [],
      isActive: true,
    });

    await ctx.db.insert("users", {
      clerkId: args.studentAffairs.clerkId,
      email: args.studentAffairs.email,
      roles: ["STUDENT_AFFAIRS"],
      activeRole: "STUDENT_AFFAIRS",
      institutionId,
      permissions: [],
      isActive: true,
    });

    // 4. Helper to Seed a Faculty
    const seedFaculty = async (facultyData: any) => {
      // Create Faculty
      const facultyId = await ctx.db.insert("faculties", {
        institutionId,
        name: facultyData.name,
        slug: facultyData.slug,
        isActive: true,
        createdAt: Date.now(),
      });

      // Create Faculty Association
      const facEntityId = `faculty-${facultyData.slug}`;
      const facAssociationId = await ctx.db.insert("associations", {
        institutionId,
        name: `${facultyData.name} Association`,
        slug: facultyData.slug,
        type: "faculty",
        entityId: facEntityId,
        staffAdvisorClerkId: facultyData.advisor.clerkId,
        studentExcoClerkIds: [facultyData.exco.clerkId],
        isActive: true,
        createdAt: Date.now(),
      });

      // Create Faculty Wallet
      const facVa = generateVA(`${facultyData.name} Wallet`, facultyData.slug);
      await ctx.db.insert("wallets", {
        institutionId,
        type: "faculty",
        entityId: facEntityId,
        name: `${facultyData.name} Wallet`,
        associationId: facAssociationId,
        totalCollected: 0,
        availableBalance: 0,
        minimumBalance: 0,
        transactionCount: 0,
        ...facVa,
      });

      // Create Dean user
      await ctx.db.insert("users", {
        clerkId: facultyData.dean.clerkId,
        email: facultyData.dean.email,
        roles: ["DEAN"],
        activeRole: "DEAN",
        institutionId,
        permissions: [facEntityId],
        facultyId,
        faculty: facultyData.name,
        isActive: true,
      });

      // Create Faculty Advisor user
      await ctx.db.insert("users", {
        clerkId: facultyData.advisor.clerkId,
        email: facultyData.advisor.email,
        roles: ["STAFF_ADVISOR"],
        activeRole: "STAFF_ADVISOR",
        institutionId,
        permissions: [],
        facultyId,
        faculty: facultyData.name,
        staffType: "academic",
        isActive: true,
      });

      // Create Faculty Exco user record
      await ctx.db.insert("users", {
        clerkId: facultyData.exco.clerkId,
        email: facultyData.exco.email,
        roles: ["STUDENT", "STUDENT_EXCO"],
        activeRole: "STUDENT",
        institutionId,
        permissions: [facultyData.exco.matric],
        facultyId,
        faculty: facultyData.name,
        isActive: true,
      });

      // Create Faculty Exco student record
      await ctx.db.insert("studentRecords", {
        institutionId,
        matric: facultyData.exco.matric,
        email: facultyData.exco.email,
        faculty: facultyData.name,
        facultySlug: facultyData.slug,
        // (Temporary department assignments, will be detailed under depts)
        department: "General " + facultyData.name,
        departmentSlug: "GEN-" + facultyData.slug,
        level: 100,
        status: "active",
      });

      // Seed Departments
      for (const deptData of facultyData.depts) {
        const departmentId = await ctx.db.insert("departments", {
          institutionId,
          facultyId,
          name: deptData.name,
          slug: deptData.slug,
          isActive: true,
          createdAt: Date.now(),
        });

        // Create Department Association
        const deptEntityId = `department-${deptData.slug}`;
        const deptAssociationId = await ctx.db.insert("associations", {
          institutionId,
          name: `${deptData.name} Association`,
          slug: deptData.slug,
          type: "department",
          entityId: deptEntityId,
          staffAdvisorClerkId: deptData.advisor.clerkId,
          studentExcoClerkIds: deptData.exco ? [deptData.exco.clerkId] : [],
          isActive: true,
          createdAt: Date.now(),
        });

        // Create Department Wallet
        const deptVa = generateVA(`${deptData.name} Wallet`, deptData.slug);
        await ctx.db.insert("wallets", {
          institutionId,
          type: "department",
          entityId: deptEntityId,
          name: `${deptData.name} Wallet`,
          associationId: deptAssociationId,
          totalCollected: 0,
          availableBalance: 0,
          minimumBalance: 0,
          transactionCount: 0,
          ...deptVa,
        });

        // Create HOD user
        await ctx.db.insert("users", {
          clerkId: deptData.hod.clerkId,
          email: deptData.hod.email,
          roles: ["HOD"],
          activeRole: "HOD",
          institutionId,
          permissions: [deptEntityId],
          facultyId,
          faculty: facultyData.name,
          departmentId,
          department: deptData.name,
          isActive: true,
        });

        // Create Dept Advisor user
        await ctx.db.insert("users", {
          clerkId: deptData.advisor.clerkId,
          email: deptData.advisor.email,
          roles: ["STAFF_ADVISOR"],
          activeRole: "STAFF_ADVISOR",
          institutionId,
          permissions: [],
          facultyId,
          faculty: facultyData.name,
          departmentId,
          department: deptData.name,
          staffType: "academic",
          isActive: true,
        });

        // Create Dept Exco user if configured
        if (deptData.exco) {
          await ctx.db.insert("users", {
            clerkId: deptData.exco.clerkId,
            email: deptData.exco.email,
            roles: ["STUDENT", "STUDENT_EXCO"],
            activeRole: "STUDENT",
            institutionId,
            permissions: [deptData.exco.matric],
            facultyId,
            faculty: facultyData.name,
            departmentId,
            department: deptData.name,
            isActive: true,
          });

          await ctx.db.insert("studentRecords", {
            institutionId,
            matric: deptData.exco.matric,
            email: deptData.exco.email,
            faculty: facultyData.name,
            facultySlug: facultyData.slug,
            department: deptData.name,
            departmentSlug: deptData.slug,
            level: 100,
            status: "active",
          });
        }

        // Create Students
        for (const stud of deptData.students) {
          await ctx.db.insert("users", {
            clerkId: stud.clerkId,
            email: stud.email,
            roles: ["STUDENT"],
            activeRole: "STUDENT",
            institutionId,
            permissions: [stud.matric],
            facultyId,
            faculty: facultyData.name,
            departmentId,
            department: deptData.name,
            isActive: true,
          });

          await ctx.db.insert("studentRecords", {
            institutionId,
            matric: stud.matric,
            email: stud.email,
            faculty: facultyData.name,
            facultySlug: facultyData.slug,
            department: deptData.name,
            departmentSlug: deptData.slug,
            level: 100,
            status: "active",
          });
        }
      }
    };

    // Seed Faculty 1 & Faculty 2
    await seedFaculty(args.faculty1);
    await seedFaculty(args.faculty2);

    // Seed SUG Exco user record
    await ctx.db.insert("users", {
      clerkId: args.sugExco.clerkId,
      email: args.sugExco.email,
      roles: ["STUDENT", "STUDENT_EXCO"],
      activeRole: "STUDENT",
      institutionId,
      permissions: [args.sugExco.matric],
      isActive: true,
    });

    await ctx.db.insert("studentRecords", {
      institutionId,
      matric: args.sugExco.matric,
      email: args.sugExco.email,
      faculty: args.faculty1.name,
      facultySlug: args.faculty1.slug,
      department: args.faculty1.depts[0].name,
      departmentSlug: args.faculty1.depts[0].slug,
      level: 100,
      status: "active",
    });

    // 5. Seed Sessions
    const sessionId = await ctx.db.insert("academicSessions", {
      institutionId,
      name: "2025/2026",
      startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      endDate: Date.now() + 300 * 24 * 60 * 60 * 1000,
      isActive: true,
      createdAt: Date.now(),
    });

    // 6. Seed Level Fee Items (for 100 Level)
    await ctx.db.insert("feeConfig", {
      institutionId,
      level: 100,
      category: "tuition",
      itemName: "Tuition Fee",
      amount: 50000,
    });

    await ctx.db.insert("feeConfig", {
      institutionId,
      level: 100,
      category: "sug_dues",
      itemName: "SUG Dues",
      amount: 5000,
    });

    await ctx.db.insert("feeConfig", {
      institutionId,
      level: 100,
      category: "faculty_dues",
      itemName: "Faculty Dues",
      amount: 10000,
    });

    await ctx.db.insert("feeConfig", {
      institutionId,
      level: 100,
      category: "department_dues",
      itemName: "Department Dues",
      amount: 10000,
    });

    return {
      success: true,
      institutionId,
      message: "Full FUTM institution seeded successfully in Convex!",
    };
  },
});

/**
 * Simulate the fee split payment process for student1 in Computer Science.
 * Creates a mock pending payment and splits it across the 4 wallets.
 */
export const simulateSplitPayment = mutation({
  handler: async (ctx) => {
    // 1. Find FUTM institution
    const institution = await ctx.db
      .query("institutions")
      .filter((q) => q.eq(q.field("name"), "Federal University of Technology, Minna"))
      .first();

    if (!institution) {
      throw new Error("Federal University of Technology, Minna is not seeded yet. Run the seeder first.");
    }

    const institutionId = institution._id;

    // 2. Find Student Record
    const student = await ctx.db
      .query("studentRecords")
      .filter((q) => q.eq(q.field("email"), "student1.compsci@futm.edu.ng"))
      .first();

    if (!student) {
      throw new Error("Student student1.compsci@futm.edu.ng not found.");
    }

    // 3. Helper to fetch wallet balances
    const getWalletBalances = async () => {
      const inst = await ctx.db
        .query("wallets")
        .filter((q) => q.and(q.eq(q.field("type"), "institution"), q.eq(q.field("institutionId"), institutionId)))
        .first();

      const sug = await ctx.db
        .query("wallets")
        .filter((q) => q.and(q.eq(q.field("type"), "association"), q.eq(q.field("name"), "SUG Wallet"), q.eq(q.field("institutionId"), institutionId)))
        .first();

      const fac = await ctx.db
        .query("wallets")
        .filter((q) => q.and(q.eq(q.field("type"), "faculty"), q.eq(q.field("entityId"), "faculty-SCIENCE"), q.eq(q.field("institutionId"), institutionId)))
        .first();

      const dept = await ctx.db
        .query("wallets")
        .filter((q) => q.and(q.eq(q.field("type"), "department"), q.eq(q.field("entityId"), "department-COMP-SCI"), q.eq(q.field("institutionId"), institutionId)))
        .first();

      return {
        institution: inst ? { id: inst._id, name: inst.name, balance: inst.availableBalance } : null,
        sug: sug ? { id: sug._id, name: sug.name, balance: sug.availableBalance } : null,
        faculty: fac ? { id: fac._id, name: fac.name, balance: fac.availableBalance } : null,
        department: dept ? { id: dept._id, name: dept.name, balance: dept.availableBalance } : null,
      };
    };

    const beforeBalances = await getWalletBalances();

    // 4. Create Mock Payment record
    const reference = `TEST-SPLIT-${Date.now()}`;
    const nombaTransactionId = `TXN-NOMBA-${Date.now()}`;
    
    const paymentId = await ctx.db.insert("payments", {
      institutionId,
      nombaTransactionId,
      reference,
      studentMatric: student.matric,
      faculty: student.faculty,
      department: student.department,
      level: student.level,
      amount: 75000,
      status: "pending",
      createdAt: Date.now(),
      feeTuition: 50000,
      feeSugDues: 5000,
      feeFacultyDues: 10000,
      feeDepartmentDues: 10000,
      facultySlug: "SCIENCE",
      departmentSlug: "COMP-SCI",
      platformFee: 100,
    });

    // Helper: credit a wallet
    const creditWallet = async (walletId: any, amount: number, reason: string) => {
      const wallet = (await ctx.db.get(walletId)) as any;
      if (!wallet) return;
      await ctx.db.patch(walletId, {
        availableBalance: (wallet.availableBalance || 0) + amount,
        totalCollected: (wallet.totalCollected || 0) + amount,
        transactionCount: (wallet.transactionCount || 0) + 1,
      });
      await ctx.db.insert("walletTransactions", {
        walletId,
        institutionId,
        paymentReference: nombaTransactionId,
        amount,
        direction: "credit",
        reason,
        timestamp: Date.now(),
      });
    };

    // 5. Simulate Webhook routing & split logic directly
    if (beforeBalances.institution) {
      await creditWallet(beforeBalances.institution.id, 50000, "tuition_received");
    }
    if (beforeBalances.sug) {
      await creditWallet(beforeBalances.sug.id, 5000, "sug_dues_received");
    }
    if (beforeBalances.faculty) {
      await creditWallet(beforeBalances.faculty.id, 10000, "faculty_dues_received");
    }
    if (beforeBalances.department) {
      await creditWallet(beforeBalances.department.id, 10000, "department_dues_received");
    }

    // Mark payment as completed
    await ctx.db.patch(paymentId, {
      status: "completed",
      completedAt: Date.now(),
    });

    const afterBalances = await getWalletBalances();

    return {
      studentName: student.email,
      matric: student.matric,
      reference,
      totalCharged: 75100,
      splitBreakdown: {
        tuition: 50000,
        sugDues: 5000,
        facultyDues: 10000,
        departmentDues: 10000,
        platformFee: 100,
      },
      beforeBalances,
      afterBalances,
    };
  },
});
