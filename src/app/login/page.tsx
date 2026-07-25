import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { loginAction } from "@/actions/auth";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <div className="container" style={{ paddingBlock: "3rem", maxWidth: "520px" }}>
      <AuthForm mode="login" action={loginAction} />
    </div>
  );
}
