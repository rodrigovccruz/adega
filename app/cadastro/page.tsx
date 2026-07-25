import { RegisterForm } from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Cadastro — Adega",
};

export default async function CadastroPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/vinhos");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl text-wine-900 mb-6 text-center">
        Crie sua adega
      </h1>
      <RegisterForm />
    </div>
  );
}
