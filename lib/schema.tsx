const BASE_URL = 'https://directbookinghealthscore.com';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Bookassist',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.ico`,
  sameAs: ['https://bookassist.org'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: 'https://bookassist.com/book-a-demo',
  },
};

export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Direct Booking Health Score',
  url: BASE_URL,
  description:
    'The industry standard hotel technology and marketing audit tool. Assess your direct booking strategy, metasearch connectivity, and marketing ROI.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/blog?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Direct Booking Health Score Audit Tool',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: `${BASE_URL}/hotel-audit`,
  description:
    'AI-powered hotel technology audit. Answer 20 questions about your direct booking stack and receive an instant scored health report identifying revenue leakage.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  provider: {
    '@type': 'Organization',
    name: 'Bookassist',
    url: 'https://bookassist.org',
  },
};

export const aiAuditSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI Visibility Audit',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: `${BASE_URL}/ai-visibility-audit`,
  description:
    'Free AI Readiness Report for hotel websites. Paste a URL and receive a structured analysis of how visible the site is to AI search engines like ChatGPT, Perplexity and Gemini, scored across structured data, crawlability, semantic coverage, booking pathway clarity and more.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  provider: {
    '@type': 'Organization',
    name: 'Bookassist',
    url: 'https://bookassist.org',
  },
};

export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Direct Booking Health Score',
  serviceType: 'Hotel Technology Audit',
  provider: {
    '@type': 'Organization',
    name: 'Bookassist',
    url: 'https://bookassist.org',
  },
  url: `${BASE_URL}/hotel-audit`,
  description:
    'Free hotel technology and direct booking strategy audit. Identifies gaps in metasearch, booking engine, CRM, and analytics infrastructure.',
  areaServed: 'Worldwide',
  audience: {
    '@type': 'Audience',
    audienceType: 'Hotel operators, revenue managers, hospitality professionals',
  },
};

export const blogListingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Direct Booking Insights',
  url: `${BASE_URL}/blog`,
  description:
    'Weekly strategy and technology advice for hotels reducing OTA dependency and growing direct bookings.',
  publisher: {
    '@type': 'Organization',
    name: 'Bookassist',
    url: 'https://bookassist.org',
  },
};

export function articleSchema(post: {
  title: string;
  excerpt: string;
  date: string;
  image: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.image || `${BASE_URL}/og-default.jpg`,
    datePublished: post.date,
    dateModified: post.date,
    url: `${BASE_URL}/blog/${post.slug}`,
    inLanguage: 'en',
    author: {
      '@type': 'Organization',
      name: 'Bookassist',
      url: 'https://bookassist.org',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bookassist',
      url: 'https://bookassist.org',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
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

export function JsonLd({ schema }: { schema: object | object[] }) {
  const schemas = Array.isArray(schema) ? schema : [schema];
  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Safe: content is static schema objects, not user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}
