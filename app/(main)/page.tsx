'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { HeroSection, AboutSection, FaqSection } from '@/components/landing';
import { FeedList } from '@/components/feed/feed-list';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <>
        <HeroSection />
        <AboutSection />
        <FaqSection />
      </>
    );
  }

  return <FeedList />;
}
