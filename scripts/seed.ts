const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  try {
    await db.category.createMany({
      data: [
        { name: "Famous People" },
        { name: "Movies and TV" },
        { name: "Musicians" },
        { name: "Games" },
        { name: "Animals" },
        { name: "Philosphy" },
        { name: "Scienctists" },
      ],
    });
  } catch (error) {
    console.error("Error seeding database: ", error);
  } finally {
    await db.$disconnect();
  }
}
main();
