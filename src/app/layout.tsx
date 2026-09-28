import type { Metadata } from 'next';
import '@fontsource-variable/outfit';
import 'lenis/dist/lenis.css';
import '../style.css';

export const metadata: Metadata = {
  title: 'Screen | Portfolio',
  description: 'Projects, experiments, and writing under one changing sky.',
};

// Runs before first paint so pages never flash the wrong theme.
const themeScript = `try{var t=localStorage.getItem('sky-theme');document.documentElement.dataset.theme=t?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
