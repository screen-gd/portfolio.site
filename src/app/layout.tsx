import type { Metadata } from 'next';
import '@fontsource-variable/outfit';
import 'lenis/dist/lenis.css';
import '../style.css';

export const metadata: Metadata = {
  title: 'Screen | Portfolio',
  description: 'Projects, experiments, and writing under one changing sky.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
