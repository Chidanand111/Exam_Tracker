import React from "react";

interface RecruitmentJsonLdProps {
  recruitment: {
    id: string;
    title: string;
    slug?: string | null;
    shortDescription: string;
    fullDescription: string;
    vacancies?: number | null;
    appStartDate?: Date | string | null;
    appDeadline?: Date | string | null;
    payScale?: string | null;
    inHandSalaryMin?: number | null;
    inHandSalaryMax?: number | null;
    stateLocation?: string | null;
    officialApplyUrl: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    organization: {
      name: string;
      shortName: string;
      officialWebsite: string;
    };
    lifecycleStage?: string;
    isArchived?: boolean;
  };
}

export function RecruitmentJsonLd({ recruitment }: RecruitmentJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://exam-tracker-blue.vercel.app";
  const canonicalUrl = `${baseUrl}/recruitments/${recruitment.slug || recruitment.id}`;

  const isFutureDeadline =
    recruitment.appDeadline && new Date(recruitment.appDeadline).getTime() > Date.now();
  const isEligibleForJobPosting =
    !recruitment.isArchived &&
    recruitment.lifecycleStage !== "ARCHIVED" &&
    isFutureDeadline &&
    Boolean(recruitment.organization?.name);

  // If page satisfies Google JobPosting search criteria with active valid deadline
  if (isEligibleForJobPosting) {
    const jobPostingSchema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: recruitment.title,
      description: recruitment.fullDescription || recruitment.shortDescription,
      identifier: {
        "@type": "PropertyValue",
        name: recruitment.organization.shortName,
        value: recruitment.id,
      },
      datePosted: new Date(recruitment.createdAt).toISOString(),
      validThrough: new Date(recruitment.appDeadline!).toISOString(),
      employmentType: "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: recruitment.organization.name,
        sameAs: recruitment.organization.officialWebsite,
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
          addressRegion: recruitment.stateLocation || "All India",
        },
      },
      directApply: true,
      url: canonicalUrl,
    };

    if (recruitment.inHandSalaryMin && recruitment.inHandSalaryMax) {
      jobPostingSchema.baseSalary = {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          minValue: recruitment.inHandSalaryMin,
          maxValue: recruitment.inHandSalaryMax,
          unitText: "MONTH",
        },
      };
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
    );
  }

  // Fallback for archived, completed, or exam-stage recruitments:
  // Expose GovernmentService / EducationalOccupationalProgram schema instead of invalid JobPosting
  const govServiceSchema = {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    name: recruitment.title,
    description: recruitment.shortDescription,
    provider: {
      "@type": "GovernmentOrganization",
      name: recruitment.organization.name,
      url: recruitment.organization.officialWebsite,
    },
    url: canonicalUrl,
    serviceType: "Public Recruitment & Competitive Examination Notification",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(govServiceSchema) }}
    />
  );
}
