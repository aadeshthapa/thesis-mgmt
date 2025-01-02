import database from "./db.js";
import { performance } from "perf_hooks";

async function testDatabaseConnection() {
  console.log("Starting database connection tests...\n");

  try {
    // Test 1: Basic Connection
    console.log("Test 1: Basic Connection");
    const startTime = performance.now();
    const result = await database.query("SELECT NOW()");
    const endTime = performance.now();

    console.log("✓ Database connection successful");
    console.log(
      `✓ Query execution time: ${(endTime - startTime).toFixed(2)}ms`
    );
    console.log(`✓ Current database time: ${result.rows[0].now}\n`);

    // Test 2: Connection Pool
    console.log("Test 2: Connection Pool");
    const poolClient = await database.getClient();
    console.log("✓ Successfully acquired connection from pool");
    poolClient.release();
    console.log("✓ Successfully released connection back to pool\n");

    // Test 3: Transaction Support
    console.log("Test 3: Transaction Support");
    const client = await database.getClient();
    try {
      await client.query("BEGIN");
      console.log("✓ Successfully started transaction");

      // Create a temporary test table
      await client.query(`
        CREATE TEMP TABLE test_table (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        )
      `);
      console.log("✓ Successfully created temporary test table");

      // Insert some test data
      await client.query(
        `
        INSERT INTO test_table (name) VALUES ($1)
      `,
        ["Test Entry"]
      );
      console.log("✓ Successfully inserted test data");

      // Verify the data
      const { rows } = await client.query("SELECT * FROM test_table");
      console.log("✓ Successfully queried test data");
      console.log(`✓ Retrieved ${rows.length} row(s)`);

      await client.query("COMMIT");
      console.log("✓ Successfully committed transaction\n");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    // Test 4: Error Handling
    console.log("Test 4: Error Handling");
    try {
      await database.query("SELECT * FROM nonexistent_table");
    } catch (error) {
      console.log("✓ Successfully caught invalid table error");
      if (error instanceof Error) {
        console.log(`✓ Error message: ${error.message}\n`);
      }
    }

    console.log("All database tests completed successfully! 🎉");
  } catch (error) {
    console.error("\n❌ Database test failed:");
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    // Ensure we close the pool
    await database.end();
  }
}

// Run the tests
testDatabaseConnection();
