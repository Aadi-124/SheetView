/**
 * ============================================================
 *          MongoDB Transactions in Node.js
 * ============================================================
 *
 * What is a Transaction?
 * ----------------------
 * A transaction groups multiple operations so that either ALL
 * of them succeed (commit) or NONE of them apply (abort).
 * This is known as ACID compliance.
 *
 * Real-world example: Bank transfer
 *   - Debit Alice's account  ─┐ Both must succeed
 *   - Credit Bob's account   ─┘ or neither should apply
 *
 * Requirements:
 *   - MongoDB must be running as a Replica Set or Sharded Cluster
 *   - Standalone MongoDB does NOT support transactions
 *   - npm install mongoose
 * ============================================================
 */

const mongoose = require("mongoose");

// ─────────────────────────────────────────────
// 1. DATABASE CONNECTION
// ─────────────────────────────────────────────
const MONGO_URI = "mongodb://localhost:27017/bankDB"; // Must be a Replica Set URI

async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");
}

// ─────────────────────────────────────────────
// 2. SCHEMA & MODEL
// ─────────────────────────────────────────────
const accountSchema = new mongoose.Schema({
  name: String,
  balance: Number,
});

const Account = mongoose.model("Account", accountSchema);

// ─────────────────────────────────────────────
// 3. SEED DATA (Run once to set up accounts)
// ─────────────────────────────────────────────
async function seedAccounts() {
  await Account.deleteMany({});
  await Account.insertMany([
    { name: "Alice", balance: 1000 },
    { name: "Bob", balance: 500 },
  ]);
  console.log("✅ Accounts seeded: Alice=$1000, Bob=$500");
}

// ─────────────────────────────────────────────
// 4. METHOD 1: Manual Transaction (try/catch)
// ─────────────────────────────────────────────
/**
 * You manually control startTransaction, commitTransaction, abortTransaction.
 * Useful when you need fine-grained control over the transaction flow.
 */
async function transferManual(senderName, receiverName, amount) {
  console.log("\n--- Method 1: Manual Transaction ---");

  const session = await mongoose.startSession(); // Step 1: Create session
  session.startTransaction();                     // Step 2: Start transaction

  try {
    // Step 3: All operations MUST receive { session } option
    const sender = await Account.findOne({ name: senderName }).session(session);
    const receiver = await Account.findOne({ name: receiverName }).session(session);

    if (!sender || !receiver) throw new Error("Account not found");
    if (sender.balance < amount) throw new Error("Insufficient balance");

    // Debit sender
    await Account.updateOne(
      { name: senderName },
      { $inc: { balance: -amount } },
      { session } // ← CRITICAL: pass session to every operation
    );
    console.log(`   💸 Debited $${amount} from ${senderName} (not committed yet)`);

    // ❌ Simulated error — e.g., network failure, validation error, server crash
    // This happens AFTER debit but BEFORE credit.
    // Without a transaction, Alice would lose money and Bob would never receive it.
    // WITH a transaction, the debit above is ROLLED BACK automatically on abort.
    throw new Error("🔥 Simulated server crash mid-transfer!");

    // Credit receiver (never reached because of the error above)
    await Account.updateOne(
      { name: receiverName },
      { $inc: { balance: +amount } },
      { session } // ← CRITICAL: pass session to every operation
    );

    // Step 4: Commit — saves all changes permanently
    await session.commitTransaction();
    console.log(`✅ Transferred $${amount} from ${senderName} to ${receiverName}`);

  } catch (error) {
    // Step 5: Abort — rolls back ALL changes if anything failed
    await session.abortTransaction();
    console.error("❌ Transaction aborted:", error.message);

  } finally {
    // Step 6: Always end the session
    session.endSession();
  }
}

// ─────────────────────────────────────────────
// 5. METHOD 2: withTransaction() Helper (Recommended)
// ─────────────────────────────────────────────
/**
 * withTransaction() handles commit/abort automatically.
 * It also retries on transient errors (e.g., network blips).
 * This is the recommended approach for most use cases.
 */
async function transferWithHelper(senderName, receiverName, amount) {
  console.log("\n--- Method 2: withTransaction() Helper ---");

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // withTransaction handles commit/abort automatically
      const sender = await Account.findOne({ name: senderName }).session(session);
      const receiver = await Account.findOne({ name: receiverName }).session(session);

      if (!sender || !receiver) throw new Error("Account not found");
      if (sender.balance < amount) throw new Error("Insufficient balance");

      await Account.updateOne(
        { name: senderName },
        { $inc: { balance: -amount } },
        { session }
      );

      await Account.updateOne(
        { name: receiverName },
        { $inc: { balance: +amount } },
        { session }
      );

      console.log(`✅ Transferred $${amount} from ${senderName} to ${receiverName}`);
    });

  } catch (error) {
    console.error("❌ Transaction failed:", error.message);

  } finally {
    session.endSession(); // Always end session
  }
}

// ─────────────────────────────────────────────
// 6. SIMULATING A FAILURE (Abort in action)
// ─────────────────────────────────────────────
/**
 * This simulates what happens when an error is thrown mid-transaction.
 * The debit will happen, but because we throw before the credit,
 * the entire transaction is ABORTED — Alice's money is NOT deducted.
 */
async function simulateFailure() {
  console.log("\n--- Simulating Transaction Failure ---");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Debit Alice
    await Account.updateOne(
      { name: "Alice" },
      { $inc: { balance: -200 } },
      { session }
    );

    // ❌ Simulate an error before crediting Bob
    throw new Error("Something went wrong mid-transaction!");

    // This line never runs:
    await Account.updateOne(
      { name: "Bob" },
      { $inc: { balance: +200 } },
      { session }
    );

    await session.commitTransaction();

  } catch (error) {
    await session.abortTransaction(); // Alice's debit is rolled back
    console.error("❌ Aborted! No money was moved:", error.message);

  } finally {
    session.endSession();
  }
}

// ─────────────────────────────────────────────
// 7. HELPER: Print current balances
// ─────────────────────────────────────────────
async function printBalances() {
  const accounts = await Account.find({});
  console.log("\n💰 Current Balances:");
  accounts.forEach((acc) => console.log(`   ${acc.name}: $${acc.balance}`));
}

// ─────────────────────────────────────────────
// 8. MAIN — Run everything in order
// ─────────────────────────────────────────────
async function main() {
  await connectDB();
  await seedAccounts();

  await printBalances(); // Alice=$1000, Bob=$500

  // Successful transfer using manual method
  await transferManual("Alice", "Bob", 300);
  await printBalances(); // Alice=$700, Bob=$800

  // Successful transfer using helper method
  await transferWithHelper("Bob", "Alice", 100);
  await printBalances(); // Alice=$800, Bob=$700

  // Simulate failure — balances should remain unchanged
  await simulateFailure();
  await printBalances(); // Still Alice=$800, Bob=$700 (no change)

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected from MongoDB");
}

main().catch(console.error);

/**
 * ============================================================
 * KEY RULES TO REMEMBER:
 * ============================================================
 * 1. Always pass { session } to EVERY db operation in a transaction
 * 2. Always call session.endSession() in finally block
 * 3. Use withTransaction() for simpler code + auto-retry
 * 4. Transactions only work on Replica Sets, not standalone
 * 5. Transactions have a 60-second timeout by default
 * 6. Transactions work across multiple collections & databases
 * ============================================================
 */