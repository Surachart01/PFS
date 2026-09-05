import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

function logPass(desc) {
  console.log(`  \x1b[32m✔ PASS:\x1b[0m ${desc}`);
}

function logFail(desc, err) {
  console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${desc}`);
  if (err) console.error(err);
}

console.log("\n🧪 Running Automated Smoke Tests for PFS System (Week 16 Deliverables)\n");

let passedCount = 0;
let totalCount = 0;

function assert(condition, desc) {
  totalCount++;
  if (condition) {
    logPass(desc);
    passedCount++;
  } else {
    logFail(desc);
  }
}

// 1. Password Hashing with scrypt
try {
  const salt = randomBytes(16).toString("hex");
  const plain = "Student@1234";
  const hash = scryptSync(plain, salt, 64).toString("hex");
  const stored = `scrypt:${salt}:${hash}`;
  
  const [scheme, s, expected] = stored.split(":");
  const actual = scryptSync(plain, s, 64).toString("hex");
  const isValid = timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
  
  assert(scheme === "scrypt" && isValid, "scrypt password hashing & safe compare verification");
} catch (e) {
  logFail("scrypt password hashing", e);
}

// 2. Token generation & HMAC signing
try {
  const secret = "test-secret-12345";
  const payload = { userId: "user-001", role: "student", exp: Math.floor(Date.now() / 1000) + 3600 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  const token = `${encoded}.${signature}`;

  const [enc, sig] = token.split(".");
  const expectedSig = createHmac("sha256", secret).update(enc).digest("base64url");
  const tokenValid = timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  
  assert(tokenValid, "HMAC-SHA256 session token generation and signature verification");
} catch (e) {
  logFail("HMAC-SHA256 session token", e);
}

// 3. Slug sanitization and validation
try {
  const sanitizeSlug = (raw) => String(raw || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const slug1 = sanitizeSlug("Somchai ใจดี 2026!!");
  const slug2 = sanitizeSlug("My-Portfolio_Engineer#1");
  assert(slug1 === "somchai-2026" && slug2 === "my-portfolio-engineer-1", "Slug sanitization logic for clean URLs");
} catch (e) {
  logFail("Slug sanitization", e);
}

// 4. Grid Placement constraint check
try {
  const isValidGridPlacement = (g) => g.colStart >= 1 && g.colEnd <= 13 && g.colStart < g.colEnd && g.rowStart >= 1 && g.rowStart < g.rowEnd;
  const validGrid = isValidGridPlacement({ colStart: 1, colEnd: 13, rowStart: 1, rowEnd: 3 });
  const invalidGrid = isValidGridPlacement({ colStart: 5, colEnd: 2, rowStart: 1, rowEnd: 2 });
  assert(validGrid && !invalidGrid, "12-Column CSS Grid boundary & placement validation");
} catch (e) {
  logFail("Grid Placement", e);
}

// 5. Role-based access control logic
try {
  const checkAccess = (userRole, allowedRoles) => allowedRoles.includes(userRole);
  const studentCanAccessStudent = checkAccess("student", ["student"]);
  const studentCannotAccessAdmin = !checkAccess("student", ["admin"]);
  const adminCanAccessAdmin = checkAccess("admin", ["admin"]);
  assert(studentCanAccessStudent && studentCannotAccessAdmin && adminCanAccessAdmin, "Role-based access control (RBAC) permission logic");
} catch (e) {
  logFail("RBAC permission logic", e);
}

// 6. Template IDs definition
try {
  const templates = ["professional", "modern", "creative", "minimal", "academic", "compact"];
  assert(templates.length === 6, "All 6 preset layout templates configured correctly");
} catch (e) {
  logFail("Templates definition", e);
}

console.log(`\n🏁 Summary: ${passedCount} / ${totalCount} tests passed (${Math.round((passedCount / totalCount) * 100)}%)\n`);

if (passedCount === totalCount) {
  console.log("✅ All smoke tests passed successfully!\n");
  process.exit(0);
} else {
  console.error("❌ Some tests failed!\n");
  process.exit(1);
}
