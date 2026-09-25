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
    image: '/projects/relay-branding.png',
    imageAlt: 'Relay branding with its dashboard displayed on a laptop',
    aspectRatio: 2,
  },
  {
    name: 'Linkr',
    id: 'linkr',
    description: 'A digital business card to share your details and collect contacts.',
    image: '/projects/linkr-website.png',
    imageAlt: 'Linkr website showing a digital card and phone preview',
    aspectRatio: 1904 / 1034,
  },
  {
    name: 'Col',
    id: 'col',
    description: 'UI libraries in one place. Search by category and use case.',
    image: '/projects/col-website.png',
    imageAlt: 'Col website showing its library collection homepage',
    aspectRatio: 1904 / 1034,
  },
];
