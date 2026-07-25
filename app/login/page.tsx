import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Entrar — Adega",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/vinhos");
  }

  const { redirectTo } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl text-wine-900 mb-6 text-center">
        Entrar na sua adega
      </h1>
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
