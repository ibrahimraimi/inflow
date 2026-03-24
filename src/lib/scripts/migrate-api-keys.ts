import crypto from "crypto";
import { db } from "../../db/drizzle";
import { websites } from "../../db/schema";
import { isNull } from "drizzle-orm";

async function migrate() {
  console.log("Starting API key migration...");

  const existingWebsites = await db
    .select()
    .from(websites)
    .where(isNull(websites.apiKey));

  console.log(`Found ${existingWebsites.length} websites without API keys.`);

  for (const site of existingWebsites) {
    const apiKey = `inf_${crypto.randomBytes(24).toString("hex")}`;
    await db
      .update(websites)
      .set({ apiKey })
      .where(eq(websites.id, site.id));
    
    console.log(`Generated API key for ${site.websiteName} (${site.domain})`);
  }

  console.log("Migration completed.");
}

// Helper eq import if not globally available
import { eq } from "drizzle-orm";

migrate().catch(console.error);
