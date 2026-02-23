import { baseURL, routes as routesConfig } from "@/app/resources";
import { getVisiblePosts, getVisibleProjects } from "@/lib/firestoreService";

export default async function sitemap() {
  let posts: Awaited<ReturnType<typeof getVisiblePosts>> = [];
  let projects: Awaited<ReturnType<typeof getVisibleProjects>> = [];

  const [postsRes, projectsRes] = await Promise.allSettled([
    getVisiblePosts(),
    getVisibleProjects(),
  ]);
  posts    = postsRes.status    === "fulfilled" ? (postsRes.value    ?? []) : [];
  projects = projectsRes.status === "fulfilled" ? (projectsRes.value ?? []) : [];

  const blogs = posts.map((post) => ({
    url: `https://${baseURL}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || new Date().toISOString().split("T")[0],
  }));

  const works = projects.map((post) => ({
    url: `https://${baseURL}/work/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || new Date().toISOString().split("T")[0],
  }));

  const activeRoutes = Object.keys(routesConfig).filter((route) => routesConfig[route] && !route.startsWith("/admin"));

  const routes = activeRoutes.map((route) => ({
    url: `https://${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs, ...works];
}
