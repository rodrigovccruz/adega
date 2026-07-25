import { prisma } from "@/lib/prisma";

export async function resetDb() {
  await prisma.user.deleteMany();
}

export async function createTestUser(overrides?: { email?: string; name?: string }) {
  return prisma.user.create({
    data: {
      name: overrides?.name ?? "Usuário Teste",
      email: overrides?.email ?? `user-${Date.now()}-${Math.random()}@example.com`,
      passwordHash: "not-used-directly",
    },
  });
}
