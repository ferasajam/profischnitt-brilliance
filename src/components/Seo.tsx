import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "Diva Haarstudio | Premium Friseursalon in Münster";
const DEFAULT_DESCRIPTION =
  "Erleben Sie luxuriöses Hairstyling für Damen und Herren bei Diva Haarstudio in Münster. Erfahrene Stylisten, Premium-Services und eine anspruchsvolle Atmosphäre.";

const DEFAULT_OG_IMAGE = "https://i.ibb.co/bgm02Q88/Logo0.jpg";

type RouteSeo = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  robots?: string;
};

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function normalizePath(value: string): string {
  if (!value.startsWith("/")) return `/${value}`;
  return value;
}

function getRouteSeo(pathname: string): RouteSeo {
  // Public, indexable pages
  switch (pathname) {
    case "/":
      return {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        canonicalPath: "/",
      };
    case "/leistungen":
      return {
        title: "Leistungen | Diva Haarstudio Münster",
        description:
          "Alle Services im Überblick: Damen- und Herrenhaarschnitte, Styling, Bartpflege und mehr – im Premium Friseursalon in Münster.",
      };
    case "/team":
      return {
        title: "Team | Diva Haarstudio Münster",
        description:
          "Lernen Sie unser Team kennen: erfahrene Stylisten für Damen und Herren – Diva Haarstudio in Münster.",
      };
    // case "/eroeffnungsangebote":
      return {
        title: "Eröffnungsangebote | Diva Haarstudio Münster",
        description:
          "Aktuelle Eröffnungsangebote und Specials bei Diva Haarstudio in Münster. Jetzt entdecken und Termin sichern.",
      };
    case "/booking":
      return {
        title: "Termin buchen | Diva Haarstudio Münster",
        description:
          "Buchen Sie Ihren Termin bei Diva Haarstudio in Münster – schnell, einfach und verbindlich.",
      };
    case "/impressum":
      return {
        title: "Impressum | Diva Haarstudio",
        description: "Impressum von Diva Haarstudio.",
      };
    case "/datenschutz":
      return {
        title: "Datenschutz | Diva Haarstudio",
        description: "Datenschutzerklärung von Diva Haarstudio.",
      };

    // Backwards-compatible paths (canonicalize)
    case "/privacy":
      return {
        title: "Datenschutz | Diva Haarstudio",
        description: "Datenschutzerklärung von Diva Haarstudio.",
        canonicalPath: "/datenschutz",
      };
    case "/terms":
      return {
        title: "Impressum | Diva Haarstudio",
        description: "Impressum von Diva Haarstudio.",
        canonicalPath: "/impressum",
      };

    default: {
      // Sensitive / utility routes: keep discoverable by direct link, but avoid indexing
      if (
        pathname.startsWith("/admin") ||
        pathname === "/auth" ||
        pathname === "/profile" ||
        pathname === "/cancel" ||
        pathname === "/review"
      ) {
        return {
          title: DEFAULT_TITLE,
          description: DEFAULT_DESCRIPTION,
          robots: "noindex, nofollow",
        };
      }

      // Unknown routes / 404
      return {
        title: `Seite nicht gefunden | Diva Haarstudio`,
        description: DEFAULT_DESCRIPTION,
        robots: "noindex, follow",
      };
    }
  }
}

export function Seo() {
  const { pathname } = useLocation();

  const baseUrl = normalizeBaseUrl(import.meta.env.VITE_SITE_URL ?? "https://diva-haarstudio.de");
  const routeSeo = getRouteSeo(pathname);

  const title = routeSeo.title ?? DEFAULT_TITLE;
  const description = routeSeo.description ?? DEFAULT_DESCRIPTION;

  const canonicalPath = normalizePath(routeSeo.canonicalPath ?? pathname);
  const canonicalUrl = `${baseUrl}${canonicalPath === "/" ? "/" : canonicalPath}`;

  const robots = routeSeo.robots ?? "index, follow";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@diva" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
    </Helmet>
  );
}
