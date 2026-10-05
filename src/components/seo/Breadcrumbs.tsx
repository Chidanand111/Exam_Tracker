import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://exam-tracker-blue.vercel.app";

  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        ...(item.href ? { item: item.href.startsWith("http") ? item.href : `${baseUrl}${item.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-400 py-2.5 overflow-x-auto">
        <ol className="flex items-center space-x-1.5 whitespace-nowrap">
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center text-slate-400 hover:text-blue-400 transition-colors"
            >
              <Home className="w-3.5 h-3.5 mr-1" />
              <span>Home</span>
            </Link>
          </li>

          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="inline-flex items-center">
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 mx-1 shrink-0" />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "text-slate-200 font-medium truncate max-w-[240px] sm:max-w-none" : "text-slate-400"}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
