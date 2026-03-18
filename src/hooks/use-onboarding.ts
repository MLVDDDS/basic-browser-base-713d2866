import { useState, useCallback, useEffect } from 'react';

export interface OnboardingStep {
  id: string;
  target: string; // CSS selector
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

const BUILDER_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="ai-chat"]',
    title: 'AI-ассистент',
    description: 'Опишите что хотите создать, и AI сгенерирует это за вас. Попробуйте: "Создай лендинг для стартапа"',
    position: 'right',
  },
  {
    id: 'preview',
    target: '[data-tour="preview"]',
    title: 'Предпросмотр',
    description: 'Здесь вы видите результат в реальном времени. Можете переключать режимы: десктоп, планшет, мобильный.',
    position: 'left',
  },
  {
    id: 'view-modes',
    target: '[data-tour="view-modes"]',
    title: 'Режимы просмотра',
    description: 'Переключайтесь между устройствами для проверки адаптивности.',
    position: 'bottom',
  },
  {
    id: 'code',
    target: '[data-tour="code"]',
    title: 'Код проекта',
    description: 'Просматривайте файлы, миграции и edge-функции вашего проекта.',
    position: 'bottom',
  },
  {
    id: 'github',
    target: '[data-tour="github"]',
    title: 'GitHub',
    description: 'Подключите репозиторий для двусторонней синхронизации кода с GitHub.',
    position: 'bottom',
  },
  {
    id: 'publish',
    target: '[data-tour="publish"]',
    title: 'Публикация',
    description: 'Готово? Опубликуйте сайт одним кликом и получите ссылку.',
    position: 'bottom',
  },
];

const STORAGE_KEY = 'onboarding_completed';

export function useOnboarding(tourId: string = 'builder') {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`${STORAGE_KEY}_${tourId}`) === 'true';
    }
    return false;
  });

  const steps = tourId === 'builder' ? BUILDER_STEPS : BUILDER_STEPS;
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const start = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const prev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  const skip = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(`${STORAGE_KEY}_${tourId}`, 'true');
    setHasCompleted(true);
  }, [tourId]);

  const complete = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(`${STORAGE_KEY}_${tourId}`, 'true');
    setHasCompleted(true);
  }, [tourId]);

  const next = useCallback(() => {
    if (isLastStep) {
      complete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [complete, isLastStep]);

  const reset = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY}_${tourId}`);
    setHasCompleted(false);
    setCurrentStepIndex(0);
  }, [tourId]);

  useEffect(() => {
    if (hasCompleted || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('tour') === '1') {
      setCurrentStepIndex(0);
      setIsActive(true);
    }
  }, [hasCompleted]);

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    isLastStep,
    isFirstStep,
    progress,
    hasCompleted,
    start,
    next,
    prev,
    skip,
    complete,
    reset,
  };
}
