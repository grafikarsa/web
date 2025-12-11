'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Feed',
  '/search': 'Search',
  '/portfolios': 'Explore Portofolio',
};

export function StudentHeader() {
  const pathname = usePathname();
  
  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.includes('/edit')) return 'Edit';
    if (pathname.includes('/portfolios/new')) return 'Buat Portofolio';
    if (pathname.includes('/followers')) return 'Followers';
    if (pathname.includes('/following')) return 'Following';
    return '';
  };

  const title = getTitle();

  if (!title) return null;

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
}
