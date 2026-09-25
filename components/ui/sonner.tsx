'use client';

import React from 'react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-stone-900 group-[.toaster]:border-stone-200 group-[.toaster]:shadow-lg',
          title: 'group-[.toast]:text-stone-900 group-[.toast]:font-medium',
          description: 'group-[.toast]:text-stone-600',
          actionButton:
            'group-[.toast]:bg-stone-900 group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-stone-100 group-[.toast]:text-stone-700',
          success:
            'group-[.toast]:border-emerald-200 group-[.toast]:bg-emerald-50 group-[.toast]:text-emerald-900',
          error:
            'group-[.toast]:border-rose-200 group-[.toast]:bg-rose-50 group-[.toast]:text-rose-900',
          info:
            'group-[.toast]:border-stone-200 group-[.toast]:bg-stone-50 group-[.toast]:text-stone-900',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
