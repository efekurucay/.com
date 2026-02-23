import { baseURL } from "@/app/resources";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/admin"],
      },
    ],
    sitemap: `https://${baseURL}/sitemap.xml`,
  };
}
