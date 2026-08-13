import BlogIndexPage from "../page";

// Mirror the index — blog isn't ready, so every slug lands on the same
// "Segera hadir" placeholder.
export const metadata = {
  title: "Blog · Segera hadir",
  robots: { index: false, follow: false },
};

export default function BlogPostPage() {
  return <BlogIndexPage />;
}
