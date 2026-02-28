import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';
import { ProtectedRoute } from './ProtectedRoute';

import Index from '@/pages/Index';
import Pricing from '@/pages/Pricing';
import Dashboard from '@/pages/Dashboard';
import CreateProject from '@/pages/CreateProject';
import Builder from '@/pages/Builder';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';
import PublicSite from '@/pages/PublicSite';

// Docs pages
import About from '@/pages/docs/About';
import Privacy from '@/pages/docs/Privacy';
import Terms from '@/pages/docs/Terms';
import Help from '@/pages/docs/Help';
import Contact from '@/pages/docs/Contact';
import HowItWorks from '@/pages/docs/HowItWorks';
import Features from '@/pages/docs/Features';
import FAQ from '@/pages/docs/FAQ';

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        
        {/* Dashboard - accessible to all, shows guest mode for unauthenticated */}
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        
        <Route path="/create" element={<PageTransition><CreateProject /></PageTransition>} />
        
        {/* Builder - only protected route, requires auth (dev mode bypasses) */}
        <Route path="/builder" element={
          <ProtectedRoute>
            <PageTransition><Builder /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/builder/:id" element={
          <ProtectedRoute>
            <PageTransition><Builder /></PageTransition>
          </ProtectedRoute>
        } />
        
        <Route path="/login" element={<PageTransition><Auth mode="login" /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Auth mode="signup" /></PageTransition>} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        {/* Public site view - no animation, full screen */}
        <Route path="/p/:slug" element={<PublicSite />} />
        {/* Legacy redirects - old pages redirect to dashboard */}
        <Route path="/templates" element={<Navigate to="/dashboard" replace />} />
        <Route path="/effects" element={<Navigate to="/dashboard" replace />} />
        <Route path="/gallery" element={<Navigate to="/dashboard" replace />} />
        {/* Docs routes - no animation for instant Notion-like feel */}
        <Route path="/docs" element={<Navigate to="/docs/about" replace />} />
        <Route path="/docs/about" element={<About />} />
        <Route path="/docs/features" element={<Features />} />
        <Route path="/docs/how-it-works" element={<HowItWorks />} />
        <Route path="/docs/faq" element={<FAQ />} />
        <Route path="/docs/privacy" element={<Privacy />} />
        <Route path="/docs/terms" element={<Terms />} />
        <Route path="/docs/help" element={<Help />} />
        <Route path="/docs/contact" element={<Contact />} />
        {/* Legacy redirects */}
        <Route path="/about" element={<Navigate to="/docs/about" replace />} />
        <Route path="/privacy" element={<Navigate to="/docs/privacy" replace />} />
        <Route path="/terms" element={<Navigate to="/docs/terms" replace />} />
        <Route path="/help" element={<Navigate to="/docs/help" replace />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};
