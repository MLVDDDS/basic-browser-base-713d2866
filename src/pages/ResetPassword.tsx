import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTitle } from '@/components/ui/PageTitle';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2,
  KeyRound,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Iridescence from '@/components/effects/Iridescence';
import { apiRequest, isApiConfigured } from '@/lib/api-client';

type ResetStep = 'request' | 'sent' | 'update' | 'success';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apiEnabled = isApiConfigured();
  
  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [debugResetUrl, setDebugResetUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if we have a recovery token in URL (user clicked email link)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryToken = searchParams.get('token');
    const hashToken = hashParams.get('access_token');
    const token = queryToken || hashToken || '';
    const type = searchParams.get('type') || hashParams.get('type');

    if (token && (type === 'recovery' || apiEnabled)) {
      setRecoveryToken(token);
      setStep('update');
    }
  }, [apiEnabled, searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!apiEnabled) {
        throw new Error('API не настроен');
      }

      const response = await apiRequest<{ ok: boolean; reset_token?: string; reset_url?: string }>(
        '/auth/password/request',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );

      setStep('sent');
      toast.success('Запрос на сброс пароля создан');

      if (response.reset_token) {
        setRecoveryToken(response.reset_token);
        if (response.reset_url) {
          setDebugResetUrl(response.reset_url);
        }
        setStep('update');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при отправке';
      setError(message);
      toast.error('Не удалось отправить письмо');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    setIsLoading(true);

    try {
      if (!apiEnabled) {
        throw new Error('API не настроен');
      }

      if (!recoveryToken) {
        throw new Error('Отсутствует токен сброса пароля');
      }

      await apiRequest<{ ok: boolean }>('/auth/password/confirm', {
        method: 'POST',
        body: JSON.stringify({
          token: recoveryToken,
          password,
        }),
      });

      setStep('success');
      toast.success('Пароль успешно изменён!');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при смене пароля';
      setError(message);
      toast.error('Не удалось изменить пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effect */}
      <div className="fixed inset-0 opacity-20 pointer-events-none z-0">
        <Iridescence speed={0.5} amplitude={0.1} mouseReact={false} />
      </div>

      <Header />

      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 max-w-md">
          <AnimatePresence mode="wait">
            {/* Step 1: Request Reset */}
            {step === 'request' && (
              <motion.div
                key="request"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-primary" />
                  </div>
                  <PageTitle centered className="mb-2">
                    Сброс пароля
                  </PageTitle>
                  <p className="text-muted-foreground text-sm">
                    Введите email, на который зарегистрирован аккаунт
                  </p>
                </div>

                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-destructive"
                    >
                      {error}
                    </motion.p>
                  )}

                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Отправить ссылку
                  </Button>
                </form>

                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Вернуться ко входу
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Step 2: Email Sent */}
            {step === 'sent' && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Mail className="w-10 h-10 text-green-500" />
                  </motion.div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-2">Проверьте почту</h2>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Мы отправили ссылку для сброса пароля на{' '}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                  <p>Не получили письмо? Проверьте папку "Спам" или</p>
                  <button
                    onClick={() => setStep('request')}
                    className="text-primary hover:underline mt-1"
                  >
                    попробуйте снова
                  </button>
                </div>

                {apiEnabled && debugResetUrl && (
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-left text-xs break-all">
                    <p className="font-medium mb-1">Debug reset URL:</p>
                    <a href={debugResetUrl} className="text-primary hover:underline">
                      {debugResetUrl}
                    </a>
                  </div>
                )}

                <Link 
                  to="/login" 
                  className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Вернуться ко входу
                </Link>
              </motion.div>
            )}

            {/* Step 3: Update Password */}
            {step === 'update' && (
              <motion.div
                key="update"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <PageTitle centered className="mb-2">
                    Новый пароль
                  </PageTitle>
                  <p className="text-muted-foreground text-sm">
                    Придумайте надёжный пароль
                  </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Новый пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Минимум 8 символов"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Повторите пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-destructive"
                    >
                      {error}
                    </motion.p>
                  )}

                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Сохранить пароль
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <motion.div 
                  className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-2">Пароль изменён!</h2>
                  <p className="text-muted-foreground text-sm">
                    Сейчас вы будете перенаправлены в личный кабинет...
                  </p>
                </div>

                <div className="flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
