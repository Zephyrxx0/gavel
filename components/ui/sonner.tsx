'use client';

import React from 'react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[#111827] group-[.toaster]:text-foreground group-[.toaster]:border-[#1E293B] group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-[#D4AF37] group-[.toast]:text-[#0B0F17]',
          cancelButton:
            'group-[.toast]:bg-secondary group-[.toast]:text-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
