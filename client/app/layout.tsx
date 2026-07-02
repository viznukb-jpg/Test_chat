import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Real-time Chat',
  description: 'Chat app built with Next.js and NestJS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
