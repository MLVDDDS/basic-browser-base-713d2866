import { DocsLayout } from '@/components/docs/DocsLayout';
import { 
  Wand2, 
  History, 
  Zap, 
  MessageSquare, 
  Palette, 
  Globe, 
  Smartphone,
  Shield,
  Sparkles,
  Layers,
  RefreshCw,
  Eye
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="group p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

const features = [
  {
    icon: MessageSquare,
    title: 'Умный диалог',
    description: 'Просто опишите, что хотите создать — система поймёт вас и сгенерирует готовый сайт. Никакого программирования не требуется.'
  },
  {
    icon: Wand2,
    title: 'Мгновенная генерация',
    description: 'Получите готовый сайт за секунды. Введите описание и наблюдайте, как ваша идея превращается в реальность в режиме реального времени.'
  },
  {
    icon: RefreshCw,
    title: 'Автоисправление ошибок',
    description: 'Система автоматически находит и исправляет проблемы. Вам не нужно разбираться в технических деталях — всё работает само.'
  },
  {
    icon: History,
    title: 'История изменений',
    description: 'Каждое изменение сохраняется. Вы всегда можете вернуться к любой предыдущей версии сайта одним кликом.'
  },
  {
    icon: Eye,
    title: 'Превью в реальном времени',
    description: 'Видьте результат мгновенно. Все изменения отображаются сразу — никакого ожидания.'
  },
  {
    icon: Palette,
    title: 'Готовые шаблоны',
    description: 'Выбирайте из коллекции профессиональных шаблонов и стилей. Каждый шаблон можно настроить под себя.'
  },
  {
    icon: Sparkles,
    title: 'Визуальные эффекты',
    description: 'Добавляйте анимации и эффекты одним кликом. Сделайте свой сайт запоминающимся без навыков дизайна.'
  },
  {
    icon: Layers,
    title: 'Управление секциями',
    description: 'Добавляйте, удаляйте и переставляйте блоки сайта простым перетаскиванием. Создайте идеальную структуру.'
  },
  {
    icon: Smartphone,
    title: 'Адаптивный дизайн',
    description: 'Ваш сайт автоматически подстраивается под любой экран — от телефона до большого монитора.'
  },
  {
    icon: Globe,
    title: 'Публикация в один клик',
    description: 'Опубликуйте сайт мгновенно и получите ссылку для отправки. Никаких сложных настроек хостинга.'
  },
  {
    icon: Zap,
    title: 'Telegram Mini App',
    description: 'Создавайте приложения для Telegram. Ваш сайт можно открыть прямо внутри мессенджера.'
  },
  {
    icon: Shield,
    title: 'Безопасность данных',
    description: 'Все ваши проекты надёжно защищены и хранятся в облаке. Доступ только у вас.'
  }
];

const Features = () => {
  return (
    <DocsLayout 
      title="Возможности" 
      description="Всё, что нужно для создания профессионального сайта"
    >
      <div className="max-w-4xl">
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <h2 className="text-xl font-semibold mb-3">Начните прямо сейчас</h2>
          <p className="text-muted-foreground mb-4">
            Создайте свой первый сайт бесплатно. Просто опишите идею — и увидьте результат через несколько секунд.
          </p>
          <a 
            href="/create" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Создать сайт
          </a>
        </div>
      </div>
    </DocsLayout>
  );
};

export default Features;
