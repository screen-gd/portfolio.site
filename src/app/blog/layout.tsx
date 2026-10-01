import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Keep the blog and its posts saved while hiding their public pages.
export default function BlogLayout() {
  return null;
}
