import { Suspense, lazy, type ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';
// ProtectedRoute available but not used during frontend-only development

const Index = lazy(() => import('@/pages/Index'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const CreateProject = lazy(() => import('@/pages/CreateProject'));
const Builder = lazy(() => import('@/pages/Builder'));
const Auth = lazy(() => import('@/pages/Auth'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const PublicSite = lazy(() => import('@/pages/PublicSite'));
const About = lazy(() => import('@/pages/docs/About'));
const Privacy = lazy(() => import('@/pages/docs/Privacy'));
const Terms = lazy(() => import('@/pages/docs/Terms'));
const HowItWorks = lazy(() => import('@/pages/docs/HowItWorks'));
const Features = lazy(() => import('@/pages/docs/Features'));
const FAQ = lazy(() => import('@/pages/docs/FAQ'));

function RouteFallback() {
  return <div className="min-h-[40vh]" aria-hidden="true" />;
}

function withPageTransition(element: ReactNode) {
  return (
    <PageTransition>
      <Suspense fallback={<RouteFallback />}>{element}</Suspense>
    </PageTransition>
  );
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={withPageTransition(<Index />)} />
        
        {/* Dashboard - accessible to all, shows guest mode for unauthenticated */}
        <Route path="/dashboard" element={withPageTransition(<Dashboard />)} />
        
        <Route path="/create" element={withPageTransition(<CreateProject />)} />
        
        {/* Builder - no auth gate during frontend development */}
        <Route path="/builder" element={withPageTransition(<Builder />)} />
        <Route path="/builder/:id" element={withPageTransition(<Builder />)} />
        
        <Route path="/login" element={withPageTransition(<Auth mode="login" />)} />
        <Route path="/signup" element={withPageTransition(<Auth mode="signup" />)} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password" element={withPageTransition(<ResetPassword />)} />
        <Route path="/pricing" element={withPageTransition(<Pricing />)} />
        {/* Public site view - no animation, full screen */}
        <Route path="/p/:slug" element={withSuspense(<PublicSite />)} />
        {/* Legacy redirects - old pages redirect to dashboard */}
        <Route path="/templates" element={<Navigate to="/dashboard" replace />} />
        <Route path="/effects" element={<Navigate to="/dashboard" replace />} />
        <Route path="/gallery" element={<Navigate to="/dashboard" replace />} />
        {/* Docs routes - no animation for instant Notion-like feel */}
        <Route path="/docs" element={<Navigate to="/docs/about" replace />} />
        <Route path="/docs/about" element={withSuspense(<About />)} />
        <Route path="/docs/features" element={withSuspense(<Features />)} />
        <Route path="/docs/how-it-works" element={withSuspense(<HowItWorks />)} />
        <Route path="/docs/faq" element={withSuspense(<FAQ />)} />
        <Route path="/docs/privacy" element={withSuspense(<Privacy />)} />
        <Route path="/docs/terms" element={withSuspense(<Terms />)} />
        <Route path="/docs/help" element={<Navigate to="/docs/faq" replace />} />
        <Route path="/docs/contact" element={<Navigate to="/docs/faq" replace />} />
        {/* Legacy redirects */}
        <Route path="/about" element={<Navigate to="/docs/about" replace />} />
        <Route path="/privacy" element={<Navigate to="/docs/privacy" replace />} />
        <Route path="/terms" element={<Navigate to="/docs/terms" replace />} />
        <Route path="/help" element={<Navigate to="/docs/help" replace />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={withPageTransition(<NotFound />)} />
      </Routes>
    </AnimatePresence>
  );
};
