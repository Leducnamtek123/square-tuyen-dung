import { useEffect, useMemo } from 'react';

interface JobPostingSchema {
  type: 'JobPosting';
  title: string;
  description?: string;
  companyName?: string;
  companyUrl?: string;
  companyLogoUrl?: string;
  location?: string;
  salary?: { min?: number; max?: number; currency?: string };
  jobType?: string; // 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY'
  datePosted?: string; // ISO date
  validThrough?: string; // ISO date
  url?: string;
}

interface OrganizationSchema {
  type: 'Organization';
  name: string;
  url?: string;
  logoUrl?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  foundingDate?: string;
  numberOfEmployees?: string;
  sameAs?: string[];
}

interface WebSiteSchema {
  type: 'WebSite';
  name: string;
  url: string;
  searchUrl?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchema {
  type: 'BreadcrumbList';
  items: BreadcrumbItem[];
}

type StructuredDataSchema =
  | JobPostingSchema
  | OrganizationSchema
  | WebSiteSchema
  | BreadcrumbSchema;

type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];
type JsonLdObject = { [key: string]: JsonLdValue };

/** Map job type strings to schema.org employment types */
const mapJobType = (type?: string): string => {
  if (!type || typeof type !== 'string') return 'FULL_TIME';
  const map: Record<string, string> = {
    'full-time': 'FULL_TIME',
    'full_time': 'FULL_TIME',
    'toàn thời gian': 'FULL_TIME',
    'part-time': 'PART_TIME',
    'part_time': 'PART_TIME',
    'bán thời gian': 'PART_TIME',
    'contract': 'CONTRACTOR',
    'hợp đồng': 'CONTRACTOR',
    'intern': 'INTERN',
    'thực tập': 'INTERN',
    'temporary': 'TEMPORARY',
    'tạm thời': 'TEMPORARY',
  };
  return map[type.toLowerCase()] || 'FULL_TIME';
};

const buildSchema = (data: StructuredDataSchema): JsonLdObject => {
  switch (data.type) {
    case 'JobPosting': {
      const schema: JsonLdObject = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: data.title,
        datePosted: data.datePosted || new Date().toISOString().split('T')[0],
        employmentType: mapJobType(data.jobType),
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: data.location || 'Việt Nam',
            addressCountry: 'VN',
          },
        },
        url: data.url || window.location.href,
      };
      if (data.description) {
        schema.description = data.description.replace(/<[^>]*>/g, '').slice(0, 500);
      }
      if (data.validThrough) schema.validThrough = data.validThrough;
      if (data.companyName || data.companyUrl || data.companyLogoUrl) {
        schema.hiringOrganization = {
          '@type': 'Organization',
          name: data.companyName || 'Square',
          ...(data.companyUrl && { sameAs: data.companyUrl }),
          ...(data.companyLogoUrl && { logo: data.companyLogoUrl }),
        };
      }
      if (data.salary?.min || data.salary?.max) {
        schema.baseSalary = {
          '@type': 'MonetaryAmount',
          currency: data.salary.currency || 'VND',
          value: {
            '@type': 'QuantitativeValue',
            ...(data.salary.min && { minValue: data.salary.min }),
            ...(data.salary.max && { maxValue: data.salary.max }),
            unitText: 'MONTH',
          },
        };
      }
      return schema;
    }

    case 'Organization': {
      const schema: JsonLdObject = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: data.name,
        url: data.url || window.location.href,
      };
      if (data.logoUrl) schema.logo = data.logoUrl;
      if (data.description) {
        schema.description = data.description.replace(/<[^>]*>/g, '').slice(0, 300);
      }
      if (data.email) schema.email = data.email;
      if (data.phone) schema.telephone = data.phone;
      if (data.address || data.city) {
        schema.address = {
          '@type': 'PostalAddress',
          ...(data.address && { streetAddress: data.address }),
          ...(data.city && { addressLocality: data.city }),
          addressCountry: data.country || 'VN',
        };
      }
      if (data.foundingDate) schema.foundingDate = data.foundingDate;
      if (data.numberOfEmployees) {
        schema.numberOfEmployees = {
          '@type': 'QuantitativeValue',
          description: data.numberOfEmployees,
        };
      }
      if (data.sameAs?.length) schema.sameAs = data.sameAs;
      return schema;
    }

    case 'WebSite': {
      const schema: JsonLdObject = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data.name,
        url: data.url,
      };
      if (data.searchUrl) {
        schema.potentialAction = {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: data.searchUrl,
          },
          'query-input': 'required name=search_term_string',
        };
      }
      return schema;
    }

    case 'BreadcrumbList': {
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
    }

    default:
      return {} as JsonLdObject;
  }
};

const SCRIPT_ID_PREFIX = 'ld-json-';

/**
 * useStructuredData — Injects JSON-LD structured data (schema.org).
 * Supports JobPosting, Organization, WebSite, BreadcrumbList schemas.
 */
const useStructuredData = (schemas: StructuredDataSchema | StructuredDataSchema[]) => {
  const schemaList = useMemo(() => (Array.isArray(schemas) ? schemas : [schemas]), [schemas]);

  useEffect(() => {
    const ids: string[] = [];

    schemaList.forEach((schema, index) => {
      const id = `${SCRIPT_ID_PREFIX}${schema.type}-${index}`;
      ids.push(id);

      let scriptEl = document.getElementById(id) as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = id;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(buildSchema(schema));
    });

    return () => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [schemaList]);
};

export default useStructuredData;
export type {
  JobPostingSchema,
  OrganizationSchema,
  WebSiteSchema,
  BreadcrumbSchema,
  StructuredDataSchema,
};
