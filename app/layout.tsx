import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import "reactflow/dist/style.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "NexusAI Orchestrator",
  description: "AI Orchestration Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
