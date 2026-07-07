const fs = require('fs');
const path = require('path');
const { ConvexHttpClient } = require('convex/browser');

// ============================================================================
// LOAD ENVIRONMENT VARIABLES
// ============================================================================
console.log("Loading .env.local...");
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  });
}

const secretKey = process.env.CLERK_SECRET_KEY;
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!secretKey) {
  console.error("❌ CLERK_SECRET_KEY is not configured in .env.local");
  process.exit(1);
}
if (!convexUrl) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not configured in .env.local");
  process.exit(1);
}

// ============================================================================
// HELPER: GET OR CREATE CLERK USER (IDEMPOTENT & RESILIENT WITH RETRIES)
// ============================================================================
async function getOrCreateClerkUser(email, password, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch("https://api.clerk.com/v1/users", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email_address: [email],
          password: password,
          skip_password_checks: true,
          skip_password_requirement: false
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`   ✅ Created user: ${email} (ID: ${data.id})`);
        return { clerkId: data.id, email, password };
      }

      // If user already exists, lookup their existing Clerk ID
      if (data.errors && data.errors.some(e => e.code === "form_identifier_exists")) {
        const lookupRes = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
          headers: {
            "Authorization": `Bearer ${secretKey}`
          },
          signal: AbortSignal.timeout(15000)
        });
        const lookupData = await lookupRes.json();
        if (lookupRes.ok && lookupData.length > 0) {
          console.log(`   ℹ️ Resolved existing user: ${email} (ID: ${lookupData[0].id})`);
          return { clerkId: lookupData[0].id, email, password };
        }
      }

      throw new Error(JSON.stringify(data));
    } catch (err) {
      console.warn(`   ⚠️ Warning: Attempt ${i + 1} for ${email} failed: ${err.message || err}. Retrying in 2.5s...`);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 2500));
    }
  }
}

// ============================================================================
// MAIN SEED RUNNER
// ============================================================================
async function run() {
  console.log("\n🚀 Starting complete FUTM seed runner...");
  
  const ADMIN_PASS = "FUTM@AdminPass123";
  const STAFF_PASS = "FUTM@StaffPass123";

  // Mapped list of temporary Guerrilla Mail emails provided by user
  const EMAILS = {
    admin: "ocjtjyse@sharklasers.com",
    finance: "ocjtjyse@guerrillamail.info",
    studentAffairs: "ocjtjyse@grr.la",
    sugExco: "ocjtjyse@guerrillamail.biz",
    
    // Faculty 1: Science
    f1Dean: "ocjtjyse@guerrillamail.com",
    f1Advisor: "ocjtjyse@guerrillamail.de",
    f1Exco: "ocjtjyse@guerrillamail.net",
    
    // Dept 1.1: Computer Science
    d11Hod: "ocjtjyse@guerrillamail.org",
    d11Advisor: "ocjtjyse@guerrillamailblock.com",
    d11Exco: "ocjtjyse@pokemail.net",
    d11Stud1: "ocjtjyse@spam4.me",
    d11Stud2: "rfpchgvx@sharklasers.com",
    
    // Dept 1.2: Mathematics
    d12Hod: "rfpchgvx@guerrillamail.info",
    d12Advisor: "rfpchgvx@grr.la",
    d12Stud1: "rfpchgvx@guerrillamail.biz",
    d12Stud2: "rfpchgvx@guerrillamail.com",
    
    // Faculty 2: Engineering
    f2Dean: "rfpchgvx@guerrillamail.de",
    f2Advisor: "rfpchgvx@guerrillamail.net",
    f2Exco: "rfpchgvx@guerrillamail.org",
    
    // Dept 2.1: Electrical Engineering
    d21Hod: "rfpchgvx@guerrillamailblock.com",
    d21Advisor: "rfpchgvx@pokemail.net",
    d21Stud1: "rfpchgvx@spam4.me",
    d21Stud2: "vndeiqiu@sharklasers.com",
    
    // Dept 2.2: Mechanical Engineering
    d22Hod: "vndeiqiu@guerrillamail.info",
    d22Advisor: "vndeiqiu@grr.la",
    d22Stud1: "vndeiqiu@guerrillamail.biz",
    d22Stud2: "vndeiqiu@guerrillamail.com",
  };

  // 1. Core Admins
  console.log("\n🔑 Creating core admins...");
  const admin = await getOrCreateClerkUser(EMAILS.admin, ADMIN_PASS);
  const finance = await getOrCreateClerkUser(EMAILS.finance, STAFF_PASS);
  const studentAffairs = await getOrCreateClerkUser(EMAILS.studentAffairs, STAFF_PASS);

  // 2. SUG Exco
  console.log("\n🎓 Creating SUG Exco user...");
  const sugExco = await getOrCreateClerkUser(EMAILS.sugExco, "FUT/2022/SUG/001");
  sugExco.matric = "FUT/2022/SUG/001";

  // 3. Faculty 1: Science
  console.log("\n📚 Provisioning Faculty 1 (Science)...");
  const f1Dean = await getOrCreateClerkUser(EMAILS.f1Dean, STAFF_PASS);
  const f1Advisor = await getOrCreateClerkUser(EMAILS.f1Advisor, STAFF_PASS);
  const f1Exco = await getOrCreateClerkUser(EMAILS.f1Exco, "FUT/2022/SCI/EXC");
  f1Exco.matric = "FUT/2022/SCI/EXC";

  // Dept 1.1: Computer Science
  console.log("   📁 Computer Science...");
  const d11Hod = await getOrCreateClerkUser(EMAILS.d11Hod, STAFF_PASS);
  const d11Advisor = await getOrCreateClerkUser(EMAILS.d11Advisor, STAFF_PASS);
  const d11Exco = await getOrCreateClerkUser(EMAILS.d11Exco, "FUT/2022/CSC/EXC");
  d11Exco.matric = "FUT/2022/CSC/EXC";
  const d11Stud1 = await getOrCreateClerkUser(EMAILS.d11Stud1, "FUT/2022/CSC/001");
  const d11Stud2 = await getOrCreateClerkUser(EMAILS.d11Stud2, "FUT/2022/CSC/002");

  // Dept 1.2: Mathematics
  console.log("   📁 Mathematics...");
  const d12Hod = await getOrCreateClerkUser(EMAILS.d12Hod, STAFF_PASS);
  const d12Advisor = await getOrCreateClerkUser(EMAILS.d12Advisor, STAFF_PASS);
  const d12Stud1 = await getOrCreateClerkUser(EMAILS.d12Stud1, "FUT/2022/MTH/001");
  const d12Stud2 = await getOrCreateClerkUser(EMAILS.d12Stud2, "FUT/2022/MTH/002");

  // 4. Faculty 2: Engineering
  console.log("\n📚 Provisioning Faculty 2 (Engineering)...");
  const f2Dean = await getOrCreateClerkUser(EMAILS.f2Dean, STAFF_PASS);
  const f2Advisor = await getOrCreateClerkUser(EMAILS.f2Advisor, STAFF_PASS);
  const f2Exco = await getOrCreateClerkUser(EMAILS.f2Exco, "FUT/2022/ENG/EXC");
  f2Exco.matric = "FUT/2022/ENG/EXC";

  // Dept 2.1: Electrical Engineering
  console.log("   📁 Electrical Engineering...");
  const d21Hod = await getOrCreateClerkUser(EMAILS.d21Hod, STAFF_PASS);
  const d21Advisor = await getOrCreateClerkUser(EMAILS.d21Advisor, STAFF_PASS);
  const d21Stud1 = await getOrCreateClerkUser(EMAILS.d21Stud1, "FUT/2022/EEE/001");
  const d21Stud2 = await getOrCreateClerkUser(EMAILS.d21Stud2, "FUT/2022/EEE/002");

  // Dept 2.2: Mechanical Engineering
  console.log("   📁 Mechanical Engineering...");
  const d22Hod = await getOrCreateClerkUser(EMAILS.d22Hod, STAFF_PASS);
  const d22Advisor = await getOrCreateClerkUser(EMAILS.d22Advisor, STAFF_PASS);
  const d22Stud1 = await getOrCreateClerkUser(EMAILS.d22Stud1, "FUT/2022/MEG/001");
  const d22Stud2 = await getOrCreateClerkUser(EMAILS.d22Stud2, "FUT/2022/MEG/002");

  // ============================================================================
  // COMMIT TO CONVEX DATABASE
  // ============================================================================
  console.log("\n💾 Inserting records into Convex Cloud DB...");
  const client = new ConvexHttpClient(convexUrl);

  const payload = {
    admin: { clerkId: admin.clerkId, email: admin.email, name: "Prof. Abdulrasheed (Admin)" },
    finance: { clerkId: finance.clerkId, email: finance.email, name: "Mr. Emeka Kalu (Finance)" },
    studentAffairs: { clerkId: studentAffairs.clerkId, email: studentAffairs.email, name: "Dr. Sarah Yusuf (Student Affairs)" },
    sugExco: { clerkId: sugExco.clerkId, email: sugExco.email, matric: sugExco.matric, name: "Comrade Chinedu Okoro" },

    faculty1: {
      name: "Faculty of Science",
      slug: "SCIENCE",
      dean: { clerkId: f1Dean.clerkId, email: f1Dean.email, name: "Prof. Florence David (Dean)" },
      advisor: { clerkId: f1Advisor.clerkId, email: f1Advisor.email, name: "Dr. James Alabi (Advisor)" },
      exco: { clerkId: f1Exco.clerkId, email: f1Exco.email, matric: f1Exco.matric, name: "Samuel Obi (Faculty Exco)" },
      depts: [
        {
          name: "Computer Science",
          slug: "COMP-SCI",
          hod: { clerkId: d11Hod.clerkId, email: d11Hod.email, name: "Dr. Bala Mohammed (HOD)" },
          advisor: { clerkId: d11Advisor.clerkId, email: d11Advisor.email, name: "Dr. Grace John (Advisor)" },
          exco: { clerkId: d11Exco.clerkId, email: d11Exco.email, matric: d11Exco.matric, name: "Tunde Ajayi (Dept Exco)" },
          students: [
            { clerkId: d11Stud1.clerkId, email: d11Stud1.email, matric: "FUT/2022/CSC/001", name: "John Doe" },
            { clerkId: d11Stud2.clerkId, email: d11Stud2.email, matric: "FUT/2022/CSC/002", name: "Jane Smith" }
          ]
        },
        {
          name: "Mathematics",
          slug: "MATHS",
          hod: { clerkId: d12Hod.clerkId, email: d12Hod.email, name: "Prof. Isaac Newton (HOD)" },
          advisor: { clerkId: d12Advisor.clerkId, email: d12Advisor.email, name: "Dr. Alan Turing (Advisor)" },
          students: [
            { clerkId: d12Stud1.clerkId, email: d12Stud1.email, matric: "FUT/2022/MTH/001", name: "Alice Green" },
            { clerkId: d12Stud2.clerkId, email: d12Stud2.email, matric: "FUT/2022/MTH/002", name: "Bob Brown" }
          ]
        }
      ]
    },

    faculty2: {
      name: "Faculty of Engineering",
      slug: "ENGINEERING",
      dean: { clerkId: f2Dean.clerkId, email: f2Dean.email, name: "Prof. Victor Benson (Dean)" },
      advisor: { clerkId: f2Advisor.clerkId, email: f2Advisor.email, name: "Dr. Thomas Edison (Advisor)" },
      exco: { clerkId: f2Exco.clerkId, email: f2Exco.email, matric: f2Exco.matric, name: "David Kojo (Faculty Exco)" },
      depts: [
        {
          name: "Electrical Engineering",
          slug: "ELECT-ENG",
          hod: { clerkId: d21Hod.clerkId, email: d21Hod.email, name: "Dr. Nikola Tesla (HOD)" },
          advisor: { clerkId: d21Advisor.clerkId, email: d21Advisor.email, name: "Dr. Marie Curie (Advisor)" },
          students: [
            { clerkId: d21Stud1.clerkId, email: d21Stud1.email, matric: "FUT/2022/EEE/001", name: "Charlie White" },
            { clerkId: d21Stud2.clerkId, email: d21Stud2.email, matric: "FUT/2022/EEE/002", name: "Diana Black" }
          ]
        },
        {
          name: "Mechanical Engineering",
          slug: "MECH-ENG",
          hod: { clerkId: d22Hod.clerkId, email: d22Hod.email, name: "Dr. Henry Ford (HOD)" },
          advisor: { clerkId: d22Advisor.clerkId, email: d22Advisor.email, name: "Dr. James Watt (Advisor)" },
          students: [
            { clerkId: d22Stud1.clerkId, email: d22Stud1.email, matric: "FUT/2022/MEG/001", name: "Ethan Hunt" },
            { clerkId: d22Stud2.clerkId, email: d22Stud2.email, matric: "FUT/2022/MEG/002", name: "Fiona Gallagher" }
          ]
        }
      ]
    }
  };

  const dbResult = await client.mutation("seed:seedDemoInstitution", payload);
  
  console.log("\n🎉 SEED SUCCESSFUL!");
  console.log(`   Institution ID: ${dbResult.institutionId}`);
  console.log("   Fee Schedule Configured: 100 Level (Tuition: 50k, SUG: 5k, Faculty: 10k, Dept: 10k)");
  console.log("   Dedicated Providus Bank virtual accounts created for all 7 wallets!");
  
  console.log("\n============================================================================");
  console.log("📋 FUTM SEEDED ACCOUNTS LOGIN DIRECTORY");
  console.log("============================================================================");
  console.log(`\n1. INSTITUTION ADMIN\n   Email: ${EMAILS.admin}\n   Password: ${ADMIN_PASS}`);
  console.log(`\n2. FINANCE OFFICER\n   Email: ${EMAILS.finance}\n   Password: ${STAFF_PASS}`);
  console.log(`\n3. STUDENT AFFAIRS\n   Email: ${EMAILS.studentAffairs}\n   Password: ${STAFF_PASS}`);
  console.log(`\n4. SUG EXCO\n   Email: ${EMAILS.sugExco}\n   Password: FUT/2022/SUG/001`);
  
  console.log("\n5. FACULTY OF SCIENCE");
  console.log(`   • DEAN: ${EMAILS.f1Dean} / ${STAFF_PASS}`);
  console.log(`   • STAFF ADVISOR: ${EMAILS.f1Advisor} / ${STAFF_PASS}`);
  console.log(`   • FACULTY EXCO: ${EMAILS.f1Exco} / FUT/2022/SCI/EXC`);
  
  console.log("   └─ Computer Science (COMP-SCI)");
  console.log(`      - HOD: ${EMAILS.d11Hod} / ${STAFF_PASS}`);
  console.log(`      - DEPT ADVISOR: ${EMAILS.d11Advisor} / ${STAFF_PASS}`);
  console.log(`      - DEPT EXCO: ${EMAILS.d11Exco} / FUT/2022/CSC/EXC`);
  console.log(`      - STUDENT 1: ${EMAILS.d11Stud1} / FUT/2022/CSC/001`);
  console.log(`      - STUDENT 2: ${EMAILS.d11Stud2} / FUT/2022/CSC/002`);

  console.log("   └─ Mathematics (MATHS)");
  console.log(`      - HOD: ${EMAILS.d12Hod} / ${STAFF_PASS}`);
  console.log(`      - DEPT ADVISOR: ${EMAILS.d12Advisor} / ${STAFF_PASS}`);
  console.log(`      - STUDENT 1: ${EMAILS.d12Stud1} / FUT/2022/MTH/001`);
  console.log(`      - STUDENT 2: ${EMAILS.d12Stud2} / FUT/2022/MTH/002`);

  console.log("\n6. FACULTY OF ENGINEERING");
  console.log(`   • DEAN: ${EMAILS.f2Dean} / ${STAFF_PASS}`);
  console.log(`   • STAFF ADVISOR: ${EMAILS.f2Advisor} / ${STAFF_PASS}`);
  console.log(`   • FACULTY EXCO: ${EMAILS.f2Exco} / FUT/2022/ENG/EXC`);
  
  console.log("   └─ Electrical Engineering (ELECT-ENG)");
  console.log(`      - HOD: ${EMAILS.d21Hod} / ${STAFF_PASS}`);
  console.log(`      - DEPT ADVISOR: ${EMAILS.d21Advisor} / ${STAFF_PASS}`);
  console.log(`      - STUDENT 1: ${EMAILS.d21Stud1} / FUT/2022/EEE/001`);
  console.log(`      - STUDENT 2: ${EMAILS.d21Stud2} / FUT/2022/EEE/002`);

  console.log("   └─ Mechanical Engineering (MECH-ENG)");
  console.log(`      - HOD: ${EMAILS.d22Hod} / ${STAFF_PASS}`);
  console.log(`      - DEPT ADVISOR: ${EMAILS.d22Advisor} / ${STAFF_PASS}`);
  console.log(`      - STUDENT 1: ${EMAILS.d22Stud1} / FUT/2022/MEG/001`);
  console.log(`      - STUDENT 2: ${EMAILS.d22Stud2} / FUT/2022/MEG/002`);
  
  console.log("\n============================================================================");
}

run().catch(err => {
  console.error("\n❌ Seeding failed:", err);
  process.exit(1);
});
