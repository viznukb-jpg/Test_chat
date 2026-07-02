import './globals.css';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Real-time Chat',
  description: 'Chat app built with Next.js and NestJS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster 
          position="top-center" 
          toastOptions={{ 
            style: { background: '#252542', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } 
          }} 
        />
        {children}
      </body>
    </html>
  );
}
