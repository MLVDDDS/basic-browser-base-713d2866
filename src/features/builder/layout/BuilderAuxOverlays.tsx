import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { OnboardingTour } from '@/components/ui/OnboardingTour';
import { AutofixProgress } from '@/components/chat/AutofixProgress';
import type { useAutofixOrchestrator } from '@/hooks/useAutofixOrchestrator';
import type { useOnboarding } from '@/hooks/use-onboarding';

interface BuilderAuxOverlaysProps {
  autofix: Pick<
    ReturnType<typeof useAutofixOrchestrator>,
    'isRunning' | 'state' | 'stop' | 'canRollback' | 'snapshotId' | 'rollback'
  >;
  onboarding: ReturnType<typeof useOnboarding>;
}

export function BuilderAuxOverlays({
  autofix,
  onboarding,
}: BuilderAuxOverlaysProps) {
  return (
    <>
      <AnimatePresence>
        {autofix.isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-8 z-40 w-96"
          >
            <AutofixProgress
              state={autofix.state}
              onStop={autofix.stop}
              onRollback={autofix.canRollback ? () => autofix.rollback(autofix.snapshotId!) : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <OnboardingTour
        isActive={onboarding.isActive}
        currentStep={onboarding.currentStep}
        currentStepIndex={onboarding.currentStepIndex}
        totalSteps={onboarding.totalSteps}
        isLastStep={onboarding.isLastStep}
        isFirstStep={onboarding.isFirstStep}
        progress={onboarding.progress}
        onNext={onboarding.next}
        onPrev={onboarding.prev}
        onSkip={onboarding.skip}
      />

      {!onboarding.isActive && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onboarding.start}
              className="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-primary text-primary-foreground hidden md:flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">{onboarding.hasCompleted ? 'Пройти тур заново' : 'Показать тур'}</TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
