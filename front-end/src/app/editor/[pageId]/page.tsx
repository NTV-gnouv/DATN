import { useParams } from 'react-router-dom';

import PageEditorView from '@/views/builder/PageEditorView';

export default function EditorRoute() {
  const { pageId = '' } = useParams();

  return <PageEditorView key={pageId} />;
}