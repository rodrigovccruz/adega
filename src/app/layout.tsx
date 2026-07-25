import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { getOptionalUser } from "@/lib/session";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Adega",
    template: "%s · Adega",
  },
  description:
    "Controle sua coleção de vinhos e associe cada rótulo a sugestões gastronômicas.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getOptionalUser();

  return (
    <html lang="pt-BR">
      <body className={`${figtree.variable} ${fraunces.variable} antialiased`}>
        <div className="site-shell">
          <SiteHeader userName={user?.name} />
          <main className="site-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
