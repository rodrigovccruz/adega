import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { registerAction } from "@/actions/auth";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
  return (
    <div className="container" style={{ paddingBlock: "3rem", maxWidth: "520px" }}>
      <AuthForm mode="register" action={registerAction} />
    </div>
  );
}
