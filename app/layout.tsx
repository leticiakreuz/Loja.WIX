import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WIX Make & Acessórios | Beleza para todas",
  description: "Amor-próprio, autoestima e acolhimento. Conheça a WIX Make & Acessórios e encontre inspiração para valorizar sua beleza e seu autocuidado.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/brand/wix-monograma.jpeg",
    shortcut: "/brand/wix-monograma.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
