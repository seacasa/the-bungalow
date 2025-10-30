import type { Metadata } from 'next';
import './globals.css'; // Optional

export const metadata: Metadata = {
  title: '🏝️ The Bungalow',
  description: 'VIP $100 Giveaways',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
