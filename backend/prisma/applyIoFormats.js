// CodeArena — add explicit Input/Output Format sections to existing problems'
// descriptions in place (see problemIoFormats.js). Touches only `description`;
// submissions, solves and playlists are kept. Safe to re-run.
// Run: `node prisma/applyIoFormats.js`.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { IO_FORMATS, withIoFormat } from "./problemIoFormats.js";

const db = new PrismaClient();

async function main() {
  for (const slug of Object.keys(IO_FORMATS)) {
    const problem = await db.problem.findUnique({ where: { slug }, select: { id: true, description: true } });
    if (!problem) {
      console.log(`skip ${slug}: not in DB`);
      continue;
    }
    const description = withIoFormat(slug, problem.description);
    if (description === problem.description) {
      console.log(`ok   ${slug}: already up to date`);
      continue;
    }
    await db.problem.update({ where: { id: problem.id }, data: { description } });
    console.log(`done ${slug}`);
  }
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error("Apply IO formats failed:", e);
    return db.$disconnect().finally(() => process.exit(1));
  });
