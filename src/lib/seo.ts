import { siteConfig, navConfig, seoConfig } from 'virtual:dfgrow/config';

export interface SeoMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  keywords?: string[];
  publishDate?: Date;
  updatedDate?: Date;
}

export function buildPageTitle(pageTitle?: string): string {
  if (!pageTitle) return `${siteConfig.name} - ${siteConfig.tagline}`;
  return `${pageTitle} | ${siteConfig.name}`;
}

export function cleanPathname(pathname: string): string {
  return pathname
    .replace(/\/index(?:\.html)?$/, '/')
    .replace(/\.html$/, '')
    .replace(/\/+$/, '') || '/';
}

export function buildCanonical(pathname: string): string {
  return `${siteConfig.url}${cleanPathname(pathname)}`;
}

function localeToLanguageName(locale: string): string {
  const map: Record<string, string> = {
    'zh-CN': 'Chinese',
    'zh-TW': 'Chinese (Traditional)',
    'en-US': 'English',
    'en-GB': 'English',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
  };
  return map[locale] ?? locale;
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    alternateName: siteConfig.nameEn,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: `${siteConfig.url}${seoConfig.faviconPath ?? '/favicon-64.png'}`,
    foundingDate: String(siteConfig.foundingYear),
    address: {
      '@type': 'PostalAddress',
      addressCountry: siteConfig.address.country,
      addressLocality: siteConfig.address.locality,
    },
    founder: {
      '@type': 'Person',
      name: siteConfig.founder.name,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: siteConfig.contact.email,
      availableLanguage: [localeToLanguageName(siteConfig.locale)],
    },
    sameAs: Object.values(siteConfig.social ?? {}).filter(Boolean),
  };
}

export function getWebSiteSchema() {
  const socialLinks = Object.values(siteConfig.social ?? {}).filter(Boolean);
  const pages = siteConfig.websitePages ?? [];
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.locale,
    isAccessibleForFree: true,
    ...(socialLinks.length > 0 && { sameAs: socialLinks }),
    hasPart: pages.map((page) => ({
      '@type': 'WebPage',
      name: page.name,
      url: `${siteConfig.url}${page.path}`,
      description: page.description,
    })),
  };
}

export function getArticleSchema(args: {
  title: string;
  description: string;
  url: string;
  publishDate: Date;
  updatedDate?: Date;
  image?: string;
  tags?: string[];
  section?: string;
  mentions?: Array<{ name: string; url?: string }>;
  citations?: Array<{ name: string; url?: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: args.title,
    description: args.description,
    url: args.url,
    datePublished: args.publishDate.toISOString(),
    dateModified: (args.updatedDate ?? args.publishDate).toISOString(),
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    ...(args.image && { image: args.image }),
    ...(args.tags && args.tags.length > 0 && { about: args.tags.map((tag) => ({ '@type': 'Thing', name: tag })) }),
    ...(args.mentions && args.mentions.length > 0 && { mentions: args.mentions.map((m) => ({ '@type': 'Thing', name: m.name, ...(m.url && { url: m.url }) })) }),
    ...(args.citations && args.citations.length > 0 && { citation: args.citations.map((c) => ({ '@type': 'CreativeWork', name: c.name, ...(c.url && { url: c.url }) })) }),
    ...(args.section && { articleSection: args.section }),
    inLanguage: siteConfig.locale,
    isAccessibleForFree: true,
  };
}

export function getPersonSchema() {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.founder.name,
    jobTitle: siteConfig.founder.title,
    worksFor: {
      '@type': 'Organization',
      name: siteConfig.legalEntity.name,
      url: siteConfig.url,
    },
    url: siteConfig.url,
  };

  if (siteConfig.founder.university) {
    schema.alumniOf = {
      '@type': 'CollegeOrUniversity',
      name: siteConfig.founder.university,
    };
  }

  return schema;
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getProfessionalServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: siteConfig.name,
    alternateName: siteConfig.nameEn,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.contact.email,
    priceRange: siteConfig.priceRange,
    areaServed: {
      '@type': 'Country',
      name: siteConfig.areaServed,
    },
    sameAs: Object.values(siteConfig.social ?? {}).filter(Boolean),
  };
}

export function getServiceSchema(args: {
  name: string;
  description: string;
  url?: string;
  price?: string;
  priceCurrency?: string;
  serviceType: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: args.name,
    description: args.description,
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    ...(args.url && { url: args.url }),
    serviceType: args.serviceType,
    areaServed: {
      '@type': 'Country',
      name: siteConfig.areaServed,
    },
  };

  if (args.price) {
    schema.offers = {
      '@type': 'Offer',
      price: args.price.replace(/[¥$€£]/g, '').replace(/,/g, ''),
      priceCurrency: args.priceCurrency ?? siteConfig.priceCurrency,
    };
  }

  return schema;
}

export function getSpeakableSchema(args: {
  title: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: args.url,
    speakable: {
      '@type': 'SpeakableSpecification',
      xpath: ['/html/head/title', '/html/head/meta[@name="description"]/@content'],
    },
  };
}

export function getHowToSchema(args: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: args.name,
    description: args.description,
    step: args.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      itemListElement: {
        '@type': 'HowToDirection',
        text: step.text,
      },
    })),
  };
}

export function getItemListSchema(args: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string; position: number }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: args.name,
    description: args.description,
    url: args.url,
    itemListElement: args.items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
}

export function getReviewSchema(args: {
  name?: string;
  reviewBody: string;
  author: string;
  itemReviewed: string;
  ratingValue?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    ...(args.name && { name: args.name }),
    reviewBody: args.reviewBody,
    author: {
      '@type': 'Person',
      name: args.author,
    },
    itemReviewed: {
      '@type': 'Service',
      name: args.itemReviewed,
      provider: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
      },
    },
    ...(args.ratingValue !== undefined && {
      reviewRating: {
        '@type': 'Rating',
        ratingValue: args.ratingValue,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

export function getCaseStudySchema(args: {
  name: string;
  description: string;
  url: string;
  industry: string;
  metrics: Array<{ label: string; value: string; unit: string }>;
  publishedDate?: string;
  testimonial?: { quote: string; role: string };
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CaseStudy',
    name: args.name,
    description: args.description,
    url: args.url,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    about: {
      '@type': 'Thing',
      name: args.industry,
    },
    subjectOf: args.metrics.map((m) => ({
      '@type': 'QuantitativeValue',
      name: m.label,
      value: m.value,
      unitText: m.unit,
    })),
    inLanguage: siteConfig.locale,
    isAccessibleForFree: true,
  };

  if (args.publishedDate) {
    schema.datePublished = args.publishedDate;
  }

  if (args.testimonial) {
    schema.review = {
      '@type': 'Review',
      reviewBody: args.testimonial.quote,
      author: {
        '@type': 'Person',
        name: args.testimonial.role,
      },
    };
  }

  return schema;
}

export function getSiteNavigationElementSchema() {
  const footerItems = [
    ...navConfig.footer.services,
    ...navConfig.footer.company,
    ...navConfig.footer.resources,
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: `${siteConfig.name} Navigation`,
    hasPart: footerItems.map((item, index) => ({
      '@type': 'SiteNavigationElement',
      position: index + 1,
      name: item.label,
      url: `${siteConfig.url}${item.href}`,
    })),
  };
}
