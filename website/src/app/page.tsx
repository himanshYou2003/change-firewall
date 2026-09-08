import HeroTrailer from '@/components/HeroTrailer';
import GeniusPillars from '@/components/GeniusPillars';
import CliExperience from '@/components/CliExperience';
import SuperpowerGrid from '@/components/SuperpowerGrid';
import McpShowcase from '@/components/McpShowcase';
import EmailWaitlist from '@/components/EmailWaitlist';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroTrailer />
      <GeniusPillars />
      <CliExperience />
      <SuperpowerGrid />
      <McpShowcase />
      <EmailWaitlist />
    </div>
  );
}
