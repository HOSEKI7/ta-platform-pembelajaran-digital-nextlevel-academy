import BlogIndexPage from "../page";

// Mirror the index — blog isn't ready, so every slug lands on the same
// "Segera hadir" placeholder.
export const metadata = { title: "Blog · Segera hadir" };

export default function BlogPostPage() {
  return <BlogIndexPage />;
}
