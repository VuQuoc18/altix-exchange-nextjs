'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { useCms } from './CmsProvider';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[120px] animate-pulse bg-slate-100" />,
});

type EditableRichTextProps = {
  pageSlug: string;
  path: string;
  fallback: string;
  className?: string;
};

export default function EditableRichText({
  pageSlug,
  path,
  fallback,
  className,
}: EditableRichTextProps) {
  const { isEditing, getString } = useCms();
  const html = getString(pageSlug, path, fallback);

  if (isEditing) {
    return (
      <RichTextEditor
        pageSlug={pageSlug}
        path={path}
        html={html}
        className={className}
      />
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
