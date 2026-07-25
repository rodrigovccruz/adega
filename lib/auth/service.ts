import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { ConflictError, UnauthorizedError } from "@/lib/errors";
import type { RegisterInput, LoginInput } from "@/lib/validation/auth";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

function toPublicUser(user: { id: string; name: string; email: string }): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new ConflictError("Este e-mail já está cadastrado");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
  });

  return toPublicUser(user);
}

/** Mensagem de erro genérica para não revelar se o e-mail existe (AUTH-N2). */
const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos";

export async function authenticateUser(input: LoginInput): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
  }

  return toPublicUser(user);
}
