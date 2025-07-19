
"use client";

import MainHeader from '@/components/layout/main-header';
import MainFooter from '@/components/layout/main-footer';

export default function CanaisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-grow">{children}</main>
    </>
  );
}
