import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PublishSection } from '@/components/landing/PublishSection';
import { TMASection } from '@/components/landing/TMASection';
import { PricingSection } from '@/components/landing/PricingSection';

const Index = () => {
  // Sync test marker: 2026-03-18 14:36:46 +07
  return (
    <div className="min-h-screen bg-background">
      <Header iridescent={false} />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <TMASection />
        <PublishSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
