// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Crea un usuario de prueba
  const user = await prisma.user.upsert({
    where: { email: 'test@clinica.com' },
    update: {},
    create: {
      email: 'test@clinica.com',
      name: 'Admin',
      posts: {
        create: {
          title: 'Bienvenido al sistema',
          content: 'Esta es la primera publicación de prueba.',
          published: true,
        },
      },
    },
  })
  console.log({ user })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })