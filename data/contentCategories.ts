import { ContentCategory } from '@/types';

export const contentCategories: ContentCategory[] = [
  {
    id: 'violence',
    name: 'Violence & Disturbing Content',
    description: 'Content involving violence, horror, crime, and disturbing imagery',
    contentTypes: [
      {
        id: 'graphic-violence',
        name: 'Graphic violence',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'BLOCK',
          AGE_13_16: 'BLOCK',
          AGE_16_18: 'GATE',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'non-graphic-violence',
        name: 'Non-graphic violence',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'heavy-fighting',
        name: 'Heavy fighting (WWE, contact sports)',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'ALLOW',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'horror',
        name: 'Horror / paranormal / jumpscares',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'crime-news',
        name: 'Crime / news footage',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
    ],
  },
  {
    id: 'sexual',
    name: 'Sexual & Body-Related Content',
    description: 'Sexual content, body-related topics, and appearance-related content',
    contentTypes: [
      {
        id: 'explicit-sexual',
        name: 'Explicit sexual content',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'BLOCK',
          AGE_13_16: 'BLOCK',
          AGE_16_18: 'BLOCK',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'sexual-education',
        name: 'Sexual education (medical, educational)',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'ALLOW',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'erotica',
        name: 'Erotica / fanfiction',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'BLOCK',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'indecent',
        name: 'Indecent clothing or speech',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'body-modification',
        name: 'Body modification (tattoos, piercings)',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'beauty-filters',
        name: 'Beauty & appearance filters',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
    ],
  },
  {
    id: 'substances',
    name: 'Substances & Addictive Behavior',
    description: 'Drugs, alcohol, gambling, and addictive content',
    contentTypes: [
      {
        id: 'drugs-cigarettes',
        name: 'Drugs & cigarettes',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'BLOCK',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'alcohol',
        name: 'Alcohol content',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'gambling',
        name: 'Gambling & betting',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'BLOCK',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
        notes: 'Includes sports betting; detect vendors like Kalshi',
      },
      {
        id: 'loot-boxes',
        name: 'Loot boxes / gacha mechanics',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
        notes: 'Allow parent exceptions',
      },
    ],
  },
  {
    id: 'financial',
    name: 'Financial & Commercial Content',
    description: 'Financial advice, crypto, and commercial content',
    contentTypes: [
      {
        id: 'crypto',
        name: 'Crypto / speculative finance',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'get-rich-quick',
        name: 'Get-rich-quick schemes',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
        notes: 'Includes dropshipping, micro-credit',
      },
      {
        id: 'influencer-finance',
        name: 'Influencer financial advice',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'subscription-pages',
        name: 'Subscription / purchase pages',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
    ],
  },
  {
    id: 'media',
    name: 'Media & Platform-Native Risks',
    description: 'Short-form videos, live streams, gaming content, and AI-generated content',
    contentTypes: [
      {
        id: 'short-form-videos',
        name: 'Short-form videos (<10 sec)',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
        notes: 'Prefer making the short video unplayable rather than blocking the entire site',
      },
      {
        id: 'live-streams',
        name: 'Live streams',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'gaming-content',
        name: 'Gaming content (videos, poker, rummy)',
        rules: {
          UNDER_10: 'GATE',
          AGE_10_13: 'GATE',
          AGE_13_16: 'ALLOW',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
        notes: 'Includes poker, rummy, sports gambling content',
      },
      {
        id: 'ai-generated',
        name: 'AI-generated content',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
    ],
  },
  {
    id: 'social',
    name: 'Social & Cultural Topics',
    description: 'LGBTQ+ topics, religion, immigration, and political content',
    parentConfigurable: true,
    contentTypes: [
      {
        id: 'lgbtq',
        name: 'LGBTQ+ topics & orgs',
        rules: {
          UNDER_10: 'GATE',
          AGE_10_13: 'GATE',
          AGE_13_16: 'ALLOW',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'religion',
        name: 'Religion',
        rules: {
          UNDER_10: 'GATE',
          AGE_10_13: 'ALLOW',
          AGE_13_16: 'ALLOW',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'immigration',
        name: 'Immigration',
        rules: {
          UNDER_10: 'GATE',
          AGE_10_13: 'ALLOW',
          AGE_13_16: 'ALLOW',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'communism',
        name: 'Communism',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'GATE',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      {
        id: 'discrimination',
        name: 'Discrimination & hate speech',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'BLOCK',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
    ],
  },
  {
    id: 'weapons',
    name: 'Weapons & Extremism',
    description: 'Weapons, guns, and extremist content',
    contentTypes: [
      {
        id: 'guns-weapons',
        name: 'Guns & weapons',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'BLOCK',
          AGE_13_16: 'GATE',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
        notes: 'Also reduces bomb-making-adjacent exposure',
      },
      {
        id: 'extremist-orgs',
        name: 'Extremist orgs / propaganda',
        rules: {
          UNDER_10: 'BLOCK',
          AGE_10_13: 'BLOCK',
          AGE_13_16: 'BLOCK',
          AGE_16_18: 'BLOCK',
          AGE_18_PLUS: 'ALLOW',
        },
        notes: 'Treat extremist propaganda as hard-block for all under 18',
      },
    ],
  },
];

