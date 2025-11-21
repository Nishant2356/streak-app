import { PrismaClient, ItemType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.storeItem.create({
    data: {
      name: "Crown",
      type: ItemType.HEADGEAR,
      price: 0,
      image: "https://res.cloudinary.com/dujwwjdkq/image/upload/v1763736281/ChatGPT_Image_Nov_21_2025_08_14_29_PM_kgshgt.png",
      style: {
        width: 80,
        offsetX: 0,
        offsetY: -35,
        smallOffsetX: 0,
        smallOffsetY: 0,
        midOffsetX: 0,
        midOffsetY: 0
      },
      metadata: {
        glow: true,
        rarity: "Legendary",
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
