import HeroTrailer from '@/components/HeroTrailer';
import SuperpowerGrid from '@/components/SuperpowerGrid';
import McpShowcase from '@/components/McpShowcase';
import EmailWaitlist from '@/components/EmailWaitlist';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroTrailer />
      <SuperpowerGrid />
      <McpShowcase />
      <EmailWaitlist />
    </div>
  );
}
