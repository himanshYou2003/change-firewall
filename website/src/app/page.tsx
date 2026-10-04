import HeroTrailer from '@/components/HeroTrailer';
import GeniusPillars from '@/components/GeniusPillars';
import CliExperience from '@/components/CliExperience';
import PlaygroundSection from '@/components/playground/PlaygroundSection';
import SuperpowerGrid from '@/components/SuperpowerGrid';
import McpShowcase from '@/components/McpShowcase';
import EmailWaitlist from '@/components/EmailWaitlist';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroTrailer />
      <GeniusPillars />
      <CliExperience />
      <section id="playground" className="py-14 sm:py-20 relative bg-[var(--surface-50)]/40 border-b border-[var(--border-subtle)] scroll-mt-[68px]">
        <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
          <PlaygroundSection />
        </div>
      </section>
      <SuperpowerGrid />
      <McpShowcase />
      <EmailWaitlist />
    </div>
  );
}


