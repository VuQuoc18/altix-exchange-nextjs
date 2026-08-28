'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { useCms } from './CmsProvider';

const BlogRichTextEditor = dynamic(() => import('./BlogRichTextEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[200px] animate-pulse bg-slate-100" />,
});

type EditableBlogRichTextProps = {
  blogId: string;
  path: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

export default function EditableBlogRichText({
  blogId,
  path,
  value,
  onValueChange,
  className,
}: EditableBlogRichTextProps) {
  const { isEditing } = useCms();

  if (isEditing) {
    return (
      <BlogRichTextEditor
        blogId={blogId}
        path={path}
        html={value}
        onValueChange={onValueChange}
        className={className}
      />
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}
