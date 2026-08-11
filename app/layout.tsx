import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Builder System",
  description: "Online resume builder system for computer engineering students"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
