"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formDataToObject } from "@/lib/form";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = formDataToObject(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      error: "Verifique os campos e tente novamente.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Este e-mail já está cadastrado." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/vinhos",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Conta criada, mas não foi possível entrar. Faça login." };
    }
    throw error;
  }

  return {};
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = formDataToObject(formData);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      error: "E-mail ou senha inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/vinhos",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha inválidos." };
    }
    throw error;
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
  redirect("/");
}
