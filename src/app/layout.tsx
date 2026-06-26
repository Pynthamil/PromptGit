import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptGit — AI Prompt Version Control",
  description: "Manage AI prompts with git-like version control, visual diffs, and interactive play testing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
