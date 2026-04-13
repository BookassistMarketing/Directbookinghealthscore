import { getAllPosts } from '../../lib/blog';
import { BlogClientPage } from '../../components/BlogClientPage';

export default function BlogPage() {
  const postsEn = getAllPosts('en');
  const postsIt = getAllPosts('it');
  const postsEs = getAllPosts('es');

  return <BlogClientPage postsEn={postsEn} postsIt={postsIt} postsEs={postsEs} />;
}
