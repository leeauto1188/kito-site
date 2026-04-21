import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kito",
  description: "I build things with AI. Sometimes I think out loud.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="relative mx-auto max-w-[720px] px-6 py-16 md:py-24">
          {children}
        </div>
      </body>
    </html>
  );
}
