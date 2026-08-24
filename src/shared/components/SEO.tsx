// src/shared/components/SEO.tsx
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { getSEOData, BASE_URL, type RouteSEO } from "@/shared/utils/seoData"

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  ogImage?: string
  type?: string
  customSchema?: Record<string, any>
}

export function SEO(props: SEOProps) {
  const location = useLocation()
  const routeSEO: RouteSEO = getSEOData(location.pathname)

  const title = props.title || routeSEO.title
  const description = props.description || routeSEO.description
  const keywords = props.keywords || routeSEO.keywords
  const canonicalUrl = props.canonical || `${BASE_URL}${routeSEO.path === "/" ? "" : routeSEO.path}`
  const ogImageUrl = props.ogImage || `${BASE_URL}/og-image.png`
  const ogType = props.type || (routeSEO.path === "/" ? "website" : "article")

  useEffect(() => {
    // 1. Update Document Title
    document.title = title

    // Helper to update or create meta tag
    const setMetaTag = (attrName: "name" | "property", attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null
      if (!element) {
        element = document.createElement("meta")
        element.setAttribute(attrName, attrValue)
        document.head.appendChild(element)
      }
      element.setAttribute("content", content)
    }

    // 2. Standard Meta Tags
    setMetaTag("name", "description", description)
    setMetaTag("name", "keywords", keywords)
    setMetaTag("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1")

    // 3. Canonical Link
    let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null
    if (!canonicalLink) {
      canonicalLink = document.createElement("link")
      canonicalLink.setAttribute("rel", "canonical")
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute("href", canonicalUrl)

    // 4. OpenGraph Tags
    setMetaTag("property", "og:title", title)
    setMetaTag("property", "og:description", description)
    setMetaTag("property", "og:url", canonicalUrl)
    setMetaTag("property", "og:type", ogType)
    setMetaTag("property", "og:site_name", "DataMaster Pro")
    setMetaTag("property", "og:image", ogImageUrl)
    setMetaTag("property", "og:image:width", "1200")
    setMetaTag("property", "og:image:height", "630")
    setMetaTag("property", "og:image:alt", `${title} preview card`)

    // 5. Twitter Card Tags
    setMetaTag("name", "twitter:card", "summary_large_image")
    setMetaTag("name", "twitter:title", title)
    setMetaTag("name", "twitter:description", description)
    setMetaTag("name", "twitter:image", ogImageUrl)

    // 6. Dynamic JSON-LD Structured Data Injection
    let schemaScript = document.getElementById("route-jsonld-schema") as HTMLScriptElement | null
    if (!schemaScript) {
      schemaScript = document.createElement("script")
      schemaScript.id = "route-jsonld-schema"
      schemaScript.type = "application/ld+json"
      document.head.appendChild(schemaScript)
    }

    let jsonLdData: Record<string, any>

    if (props.customSchema) {
      jsonLdData = props.customSchema
    } else if (routeSEO.schemaType === "FAQPage" && routeSEO.faqItems) {
      jsonLdData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": routeSEO.faqItems.map((item) => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer,
          },
        })),
      }
    } else {
      jsonLdData = {
        "@context": "https://schema.org",
        "@type": routeSEO.schemaType || "SoftwareApplication",
        "name": routeSEO.headingH1,
        "headline": title,
        "description": description,
        "applicationCategory": routeSEO.category || "DeveloperApplication",
        "operatingSystem": "All",
        "url": canonicalUrl,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "author": {
          "@type": "Person",
          "name": "Naveen",
          "url": "https://naveenguru.vercel.app",
        },
        "publisher": {
          "@type": "Organization",
          "name": "DataMaster Pro",
          "url": BASE_URL,
          "logo": {
            "@type": "ImageObject",
            "url": `${BASE_URL}/favicon.svg`,
          },
        },
      }
    }

    schemaScript.textContent = JSON.stringify(jsonLdData)
  }, [title, description, keywords, canonicalUrl, ogImageUrl, ogType, routeSEO, props.customSchema])

  return null
}
