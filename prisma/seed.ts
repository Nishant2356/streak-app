import { PrismaClient, ItemType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.storeItem.create({
    data: {
      name: "Cowboy Hat",
      type: ItemType.HEADGEAR,
      price: 100,
      image: "https://res.cloudinary.com/dujwwjdkq/image/upload/v1763736281/ChatGPT_Image_Nov_21_2025_08_14_29_PM_kgshgt.png",
      width: 80,
      offsetX: 0,
      offsetY: -35,
      metadata: {
        glow: true,
        rarity: "begginer",
      },
    },
  });

  console.log("👑 Hat item added to store!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
