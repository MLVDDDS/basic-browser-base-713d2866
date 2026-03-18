import { Suspense, lazy } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/landing/HeroSection';

const Footer = lazy(() => import('@/components/layout/Footer').then((module) => ({ default: module.Footer })));
const HowItWorksSection = lazy(() =>
  import('@/components/landing/HowItWorksSection').then((module) => ({ default: module.HowItWorksSection }))
);
const PublishSection = lazy(() =>
  import('@/components/landing/PublishSection').then((module) => ({ default: module.PublishSection }))
);
const TMASection = lazy(() =>
  import('@/components/landing/TMASection').then((module) => ({ default: module.TMASection }))
);
const PricingSection = lazy(() =>
  import('@/components/landing/PricingSection').then((module) => ({ default: module.PricingSection }))
);

function SectionFallback({ heightClass = 'min-h-[24rem]' }: { heightClass?: string }) {
  return <div className={heightClass} aria-hidden="true" />;
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header iridescent={false} />
      <main>
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <HowItWorksSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <TMASection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <PublishSection />
        </Suspense>
        <Suspense fallback={<SectionFallback heightClass="min-h-[28rem]" />}>
          <PricingSection />
        </Suspense>
      </main>
      <Suspense fallback={<SectionFallback heightClass="min-h-[16rem]" />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
