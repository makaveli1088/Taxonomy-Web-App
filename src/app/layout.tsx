// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Wayve Taxonomy',
  description: 'Interactive What/Why mind map',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
