import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@akb48.com' },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      email: 'admin@akb48.com',
      nickname: 'Admin',
      passwordHash,
      role: 'ADMIN',
      avatarColor: '#1a1a2e',
    },
  })

  console.log('Admin user ready:', admin.email, '| role:', admin.role)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
