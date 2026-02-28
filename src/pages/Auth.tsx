import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/Logo';
import { PageTitle } from '@/components/ui/PageTitle';
import { Mail, Lock, User, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiAuthErrorMeta } from '@/lib/api-auth';
import { toast } from 'sonner';

interface AuthProps {
  mode: 'login' | 'signup';
}

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  password: z
    .string()
    .min(1, 'Пароль обязателен')
    .min(8, 'Пароль должен быть не менее 8 символов'),
});

const signupSchema = loginSchema.extend({
  name: z
    .string()
    .min(1, 'Имя обязательно')
    .min(2, 'Имя должно быть не менее 2 символов')
    .max(50, 'Имя должно быть не более 50 символов'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
    },
  },
} as const;

const errorVariants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: { opacity: 1, y: 0, height: 'auto' },
  exit: { opacity: 0, y: -10, height: 0 },
};

interface FormFieldErrorProps {
  message?: string;
}

const FormFieldError = ({ message }: FormFieldErrorProps) => (
  <AnimatePresence mode="wait">
    {message && (
      <motion.div
        variants={errorVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1.5 text-destructive text-sm mt-1.5"
      >
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

interface LocationState {
  from?: string;
  projectData?: unknown;
  message?: string;
}

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: Record<string, string | number | boolean>
  ) => void;
};

type GoogleIdentity = {
  accounts: {
    id: GoogleAccountsId;
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M23.766 12.276c0-.816-.066-1.636-.207-2.438H12.24v4.617h6.48a5.54 5.54 0 0 1-2.4 3.64v3.03h3.906c2.294-2.112 3.54-5.23 3.54-8.849Z" fill="#4285F4" />
    <path d="M12.24 24c3.237 0 5.966-1.063 7.954-2.875l-3.905-3.03c-1.086.738-2.488 1.157-4.045 1.157-3.132 0-5.787-2.115-6.738-4.955H1.476v3.124A11.997 11.997 0 0 0 12.24 24Z" fill="#34A853" />
    <path d="M5.506 14.297a7.198 7.198 0 0 1 0-4.594V6.58H1.476a12 12 0 0 0 0 10.84l4.03-3.124Z" fill="#FBBC04" />
    <path d="M12.24 4.75c1.643 0 3.115.565 4.277 1.673l3.184-3.184C18.201 1.84 15.472.75 12.24.75A11.997 11.997 0 0 0 1.476 6.58l4.03 3.124c.947-2.843 3.602-4.954 6.734-4.954Z" fill="#EA4335" />
  </svg>
);

// Telegram icon component  
const TelegramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
      fill="url(#telegram-gradient)"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.43201 11.8734C8.93012 10.3494 11.2612 9.34515 12.4251 8.86072C15.7651 7.47075 16.4552 7.22835 16.9051 7.22008C17.0051 7.21835 17.2251 7.24171 17.3651 7.35504C17.4851 7.45171 17.5151 7.58171 17.5318 7.67504C17.5485 7.76838 17.5685 7.97838 17.5518 8.14171C17.3685 10.0617 16.5785 14.665 16.1785 16.7917C16.0118 17.7117 15.6852 18.0084 15.3685 18.0384C14.6785 18.105 14.1518 17.5817 13.4885 17.1417C12.4318 16.4417 11.8418 16.0084 10.8151 15.3284C9.62846 14.5384 10.4018 14.1051 11.0784 13.4017C11.2551 13.2184 14.3118 10.4317 14.3718 10.1784C14.3785 10.1484 14.3885 10.0417 14.3251 9.98505C14.2618 9.92838 14.1685 9.94838 14.0985 9.96505C14.0018 9.98838 12.3185 11.1084 9.05179 13.3217C8.57179 13.6517 8.13513 13.8117 7.74179 13.8017C7.30846 13.7917 6.47846 13.5567 5.85846 13.3567C5.10179 13.1134 4.50179 12.9851 4.55512 12.5651C4.58179 12.3467 4.88512 12.1234 5.43201 11.8734Z"
      fill="white"
    />
    <defs>
      <linearGradient id="telegram-gradient" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2AABEE" />
        <stop offset="1" stopColor="#229ED9" />
      </linearGradient>
    </defs>
  </svg>
);

const Auth = ({ mode }: AuthProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const isLogin = mode === 'login';
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

  const locationState = location.state as LocationState | undefined;
  const from = locationState?.from;
  const projectData = locationState?.projectData;
  const promptMessage = locationState?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    mode: 'onBlur',
  });

  const getReadableError = (error: Error): string => {
    const apiError = getApiAuthErrorMeta(error);
    const code = String(apiError?.code || '').toLowerCase();
    const policy = String(apiError?.policy || '').toLowerCase();
    const msg = `${error.message} ${code} ${policy}`.toLowerCase();
    
    if (msg.includes('invalid login credentials')) {
      return 'Неверный email или пароль';
    }
    if (msg.includes('invalid_credentials')) {
      return 'Неверный email или пароль';
    }
    if (msg.includes('email not confirmed')) {
      return 'Email не подтверждён. Проверьте почту или зарегистрируйтесь заново';
    }
    if (msg.includes('user already registered') || msg.includes('already registered')) {
      return 'Этот email уже зарегистрирован. Попробуйте войти';
    }
    if (msg.includes('email_exists')) {
      return 'Этот email уже зарегистрирован. Попробуйте войти';
    }
    if (msg.includes('password should be at least')) {
      return 'Пароль должен быть не менее 6 символов';
    }
    if (msg.includes('password_too_short')) {
      return 'Пароль должен быть не менее 8 символов';
    }
    if (msg.includes('missing_credentials')) {
      return 'Email и пароль обязательны';
    }
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      return 'Слишком много попыток. Подождите немного';
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Ошибка сети. Проверьте подключение к интернету';
    }
    if (msg.includes('invalid email')) {
      return 'Введите корректный email адрес';
    }
    if (msg.includes('google_token_invalid') || msg.includes('id token')) {
      return 'Ошибка входа через Google. Попробуйте еще раз';
    }
    if (msg.includes('google_oauth_not_configured')) {
      return 'Google OAuth не настроен на сервере';
    }
    if (msg.includes('google_account_conflict')) {
      return 'Этот Google-аккаунт уже привязан к другому профилю';
    }
    if (code === 'email_in_use_other_tenant' || policy === 'shared_auth_email_global_unique' || msg.includes('email_in_use_other_tenant') || msg.includes('shared_auth_email_global_unique')) {
      return 'Этот email уже привязан к другому workspace. Используй другой email или войди в исходный workspace.';
    }
    if (code === 'tenant_mismatch' || msg.includes('tenant_mismatch')) {
      return 'Аккаунт привязан к другому workspace.';
    }
    
    return error.message || 'Произошла ошибка. Попробуйте ещё раз';
  };

  const navigateAfterAuth = useCallback(() => {
    if (from?.startsWith('/create')) {
      navigate(from);
      return;
    }
    if (from === '/create' && projectData) {
      navigate('/create', { state: { projectData } });
      return;
    }
    if (from?.startsWith('/builder')) {
      navigate(from);
      return;
    }
    if (from && from !== '/login' && from !== '/signup') {
      navigate(from);
      return;
    }
    navigate('/dashboard');
  }, [from, navigate, projectData]);

  const onSubmit = async (data: LoginFormData | SignupFormData) => {
    setAuthError(null);
    
    try {
      if (isLogin) {
        const { error } = await signInWithEmail(data.email, data.password);
        if (error) {
          setAuthError(getReadableError(error));
          return;
        }
        toast.success('Добро пожаловать!');
      } else {
        const signupData = data as SignupFormData;
        const { error } = await signUpWithEmail(data.email, data.password, signupData.name);
        if (error) {
          setAuthError(getReadableError(error));
          return;
        }
        toast.success('Аккаунт создан!');
      }
      
      navigateAfterAuth();
    } catch (err) {
      setAuthError('Произошла ошибка. Попробуйте ещё раз.');
    }
  };

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setAuthError(null);
      const { error } = await signInWithGoogle(credential);
      if (error) {
        setAuthError(getReadableError(error));
        return;
      }
      toast.success('Вход через Google выполнен');
      navigateAfterAuth();
    },
    [navigateAfterAuth, signInWithGoogle]
  );

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      setGoogleReady(false);
      return;
    }

    let cancelled = false;

    const mountGoogleButton = () => {
      if (cancelled || !googleButtonRef.current) return;
      const googleApi = window.google?.accounts?.id;
      if (!googleApi) return;

      googleApi.initialize({
        client_id: googleClientId,
        callback: (response) => {
          const credential = String(response?.credential || '');
          if (!credential) return;
          void handleGoogleCredential(credential);
        },
      });
      googleButtonRef.current.innerHTML = '';
      googleApi.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        width: 360,
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      mountGoogleButton();
    } else {
      const scriptId = 'google-identity-services';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = mountGoogleButton;
        script.onerror = () => setGoogleReady(false);
        document.head.appendChild(script);
      } else if ((script as HTMLScriptElement).dataset.loaded === '1') {
        mountGoogleButton();
      } else {
        script.addEventListener('load', mountGoogleButton, { once: true });
      }
      script.addEventListener(
        'load',
        () => {
          (script as HTMLScriptElement).dataset.loaded = '1';
        },
        { once: true }
      );
    }

    return () => {
      cancelled = true;
    };
  }, [googleClientId, handleGoogleCredential]);

  const handleTelegramLogin = () => {
    // TODO: подключить Telegram Login Widget
  };

  const handleGoBack = () => {
    // Используем history.back() для корректного возврата назад
    if (window.history.length > 1) {
      navigate(-1);
    } else if (from && from !== '/login' && from !== '/signup') {
      navigate(from);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="absolute top-4 left-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
      </motion.div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <Link to="/">
            <Logo size="lg" className="justify-center" iridescent />
          </Link>
        </motion.div>

        {/* Prompt message from redirect */}
        {promptMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center"
          >
            <p className="text-sm text-foreground">{promptMessage}</p>
          </motion.div>
        )}

        {/* Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-card border border-border rounded-2xl p-8 shadow-elevated"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <PageTitle 
                description={isLogin ? 'Рады видеть тебя снова' : 'Начни создавать проекты бесплатно'}
                centered
                size="compact"
                className="mb-8"
              >
                {isLogin ? 'Войти' : 'Создать аккаунт'}
              </PageTitle>
            </motion.div>

            {/* Auth error */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <span className="text-sm text-destructive">{authError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Как тебя зовут?"
                      {...register('name')}
                      className={`pl-10 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                  </div>
                  <FormFieldError message={errors.name?.message} />
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="mail@example.com"
                    {...register('email')}
                    className={`pl-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                <FormFieldError message={errors.email?.message} />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Пароль</Label>
                  {isLogin && (
                    <Link
                      to="/reset-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Забыли пароль?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`pl-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                <FormFieldError message={errors.password?.message} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button 
                  type="submit" 
                  className="w-full gap-2 glow-primary" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      {isLogin ? 'Войти' : 'Создать аккаунт'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">или</span>
              </div>
            </motion.div>

            {/* Social login buttons */}
            <motion.div variants={itemVariants} className="space-y-3">
              {googleClientId ? (
                <div className="w-full flex justify-center">
                  <div ref={googleButtonRef} className="w-full max-w-sm" />
                </div>
              ) : (
                <Button variant="outline" className="w-full gap-3" size="lg" type="button" disabled>
                  <GoogleIcon />
                  Google вход не настроен
                </Button>
              )}
              {googleClientId && !googleReady && (
                <p className="text-xs text-muted-foreground text-center">
                  Загружаем Google авторизацию...
                </p>
              )}
              
              <Button 
                variant="outline" 
                className="w-full gap-3" 
                size="lg"
                onClick={handleTelegramLogin}
                type="button"
              >
                <TelegramIcon />
                Войти через Telegram
              </Button>

            </motion.div>

            {/* Toggle mode */}
            <motion.p
              variants={itemVariants}
              className="text-center text-sm text-muted-foreground mt-6"
            >
              {isLogin ? 'Ещё нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
              <Link
                to={isLogin ? '/signup' : '/login'}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? 'Создать' : 'Войти'}
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Terms */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-xs text-muted-foreground text-center mt-6"
        >
          Продолжая, ты соглашаешься с{' '}
          <Link to="/terms" className="underline hover:text-foreground">
            условиями использования
          </Link>{' '}
          и{' '}
          <Link to="/privacy" className="underline hover:text-foreground">
            политикой конфиденциальности
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default Auth;
