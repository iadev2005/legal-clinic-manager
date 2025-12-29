
import { query } from "./src/lib/db";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function test() {
    try {
        console.log("Checking DB connection with new SSL logic...");
        const result = await query("SELECT current_user");
        console.log("Connection successful! User:", result.rows[0].current_user);
    } catch (error) {
        console.error("Connection failed:", error);
    } finally {
        process.exit();
    }
}

test();
