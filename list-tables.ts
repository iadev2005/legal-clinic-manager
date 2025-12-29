
import { query } from "./src/lib/db";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function test() {
    try {
        console.log("Listing tables...");
        const result = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables:", result.rows.map(r => r.table_name));
    } catch (error) {
        console.error("Query failed:", error);
    } finally {
        process.exit();
    }
}

test();
