import { getVisiblePosts } from "@/lib/firestoreService";
import { getPosts } from "@/app/utils/utils";
import { Grid } from "@/once-ui/components";
import Post from "./Post";

interface PostsProps {
  range?: [number] | [number, number];
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
}

export async function Posts({ range, columns = "1", thumbnail = false }: PostsProps) {
  let allBlogs: any[] = [];

  try {
    // Try Firestore first
    const firestorePosts = await getVisiblePosts();
    if (firestorePosts.length > 0) {
      // Transform to the same format the Post component expects
      allBlogs = firestorePosts.map((post) => ({
        slug: post.slug,
        metadata: {
          title: post.title,
          publishedAt: post.publishedAt,
          summary: post.summary,
          image: post.image,
          tag: post.tags?.[0] || "",
          images: [],
          team: post.team || [],
          link: post.link || "",
        },
        content: post.content,
      }));
    }
  } catch (e) {
    // Firestore failed, fall through to file system
  }

  // Fallback to file system
  if (allBlogs.length === 0) {
    allBlogs = getPosts(["src", "app", "blog", "posts"]);
  }

  const sortedBlogs = allBlogs.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedBlogs = range
    ? sortedBlogs.slice(range[0] - 1, range.length === 2 ? range[1] : sortedBlogs.length)
    : sortedBlogs;

  return (
    <>
      {displayedBlogs.length > 0 && (
        <Grid columns={columns} mobileColumns="1" fillWidth marginBottom="40" gap="m">
          {displayedBlogs.map((post) => (
            <Post key={post.slug} post={post} thumbnail={thumbnail} />
          ))}
        </Grid>
      )}
    </>
  );
}
