import { PrismaClient, Gender } from "@prisma/client";
import dentists from "./dentists.json";

const prisma = new PrismaClient();

async function main() {
  for (const d of dentists) {
    const data = { ...d, gender: d.gender as Gender };

    await prisma.doctor.upsert({
      where: { email: data.email },
      update: data,
      create: data,
    });
  }
  console.log(`Seeded ${dentists.length} dentists`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());