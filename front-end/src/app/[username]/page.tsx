import { useParams } from 'react-router-dom';

import PublicPageView from '@/views/public/PublicPageView';

export default function PublicUserPage() {
  const { slug = '', username = '' } = useParams<{ slug?: string; username?: string }>();
  const resolvedSlug = slug || username;

  return <PublicPageView slug={resolvedSlug} />;
}
