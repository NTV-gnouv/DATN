export function resolveBlockReferences(blockType: string, data: Record<string, unknown>) {
  const definitionId =
    blockType === 'header'
      ? String(data.definitionId ?? 'block-header-default')
      : data.definitionId
        ? String(data.definitionId)
        : null;

  if (blockType === 'contact-form' || blockType === 'contact_form') {
    const formId = String(data.formId ?? data.form_id ?? '').trim();
    return {
      definitionId,
      refEntity: formId ? 'contact_form' : null,
      refId: formId || null,
    };
  }

  if (blockType === 'gallery' || blockType === 'album') {
    const albumId = String(data.albumId ?? data.album_id ?? '').trim();
    return {
      definitionId,
      refEntity: albumId ? 'album' : null,
      refId: albumId || null,
    };
  }

  return {
    definitionId,
    refEntity: null,
    refId: null,
  };
}
