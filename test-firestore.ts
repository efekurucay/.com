import { getHome, getVisibleProjects, getVisiblePosts } from "./src/lib/firestoreService.ts";

async function main() {
  try {
    const home = await getHome();
    console.log("Home:", home);
    const proj = await getVisibleProjects();
    console.log("Proj count:", proj.length);
    const posts = await getVisiblePosts();
    console.log("Post count:", posts.length);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
main();
