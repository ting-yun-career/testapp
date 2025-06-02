type IconDefinition = {
  path: string | string[];
};

export const icons: Record<string, IconDefinition> = {
  menu: {
    path: 'M4 6h16M4 12h16M4 18h16',
  },
  eye: {
    path: [
      'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    ],
  },
  plus: {
    path: 'M12 4v16m8-8H4',
  },
  square: {
    path: 'M3 3h18v18H3z',
  },
  circle: {
    path: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0',
  },
  share: {
    path: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
  },
} as const;

export type IconName = keyof typeof icons;
