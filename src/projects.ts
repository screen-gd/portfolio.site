export type Project = {
  name: string;
  id: string;
  description: string;
  image: string;
  imageAlt: string;
  aspectRatio: number;
  video?: string;
};

export const projects: readonly Project[] = [
  {
    name: 'Relay',
    id: 'relay',
    description: 'A workspace for video editors to manage projects and client reviews.',
    image: '/projects/relay-branding.webp',
    imageAlt: 'Relay branding with its dashboard displayed on a laptop',
    aspectRatio: 2,
  },
  {
    name: 'Col',
    id: 'col',
    description: 'UI libraries in one place. Search by category and use case.',
    image: '/projects/col-homepage.webp',
    imageAlt: 'Col website showing its library collection homepage',
    aspectRatio: 1920 / 1042,
  },
];
