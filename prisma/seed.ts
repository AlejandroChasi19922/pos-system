import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Customers
  const customer1 = await prisma.customer.upsert({
    where: { dniTaxId: "1803928174" },
    update: {},
    create: {
      dniTaxId: "1803928174",
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan.perez@example.com",
      phone: "0991234567",
      address: "Av. Cevallos y Montalvo, Ambato",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { dniTaxId: "1715243689" },
    update: {},
    create: {
      dniTaxId: "1715243689",
      firstName: "María",
      lastName: "López",
      email: "maria.lopez@example.com",
      phone: "0987654321",
      address: "Calle Bolivar y Castillo, Ambato",
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { dniTaxId: "0923456781" },
    update: {},
    create: {
      dniTaxId: "0923456781",
      firstName: "Carlos",
      lastName: "Mendoza",
      email: "carlos.mendoza@example.com",
      phone: "0954321876",
      address: "Av. Los Guaytambo, Ficoa",
    },
  });

  // Seed Products
  await prisma.product.upsert({
    where: { code: "PROD-001" },
    update: {},
    create: {
      code: "PROD-001",
      name: "Laptop Dell Inspiron 15",
      unitPrice: 750.0,
      stock: 10,
    },
  });

  await prisma.product.upsert({
    where: { code: "PROD-002" },
    update: {},
    create: {
      code: "PROD-002",
      name: "Mouse Inalámbrico Logitech",
      unitPrice: 25.5,
      stock: 50,
    },
  });

  await prisma.product.upsert({
    where: { code: "PROD-003" },
    update: {},
    create: {
      code: "PROD-003",
      name: "Teclado Mecánico RGB",
      unitPrice: 65.0,
      stock: 25,
    },
  });

  await prisma.product.upsert({
    where: { code: "PROD-004" },
    update: {},
    create: {
      code: "PROD-004",
      name: "Monitor LG 27 IPS Full HD",
      unitPrice: 210.0,
      stock: 8,
    },
  });

  // Product with Stock = 0 (Must be filtered OUT in search)
  await prisma.product.upsert({
    where: { code: "PROD-005" },
    update: {},
    create: {
      code: "PROD-005",
      name: "Disco Duro Externo 1TB (Agotado)",
      unitPrice: 55.0,
      stock: 0,
    },
  });

  await prisma.product.upsert({
    where: { code: "PROD-006" },
    update: {},
    create: {
      code: "PROD-006",
      name: "Audífonos Bluetooth Sony",
      unitPrice: 89.99,
      stock: 15,
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
