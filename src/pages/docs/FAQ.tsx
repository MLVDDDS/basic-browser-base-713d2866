import { DocsLayout } from '@/components/docs/DocsLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Sparkles, CreditCard, Globe, Palette, MessageCircle, Shield, Zap, Send, Mail } from 'lucide-react';

const FAQ = () => {
  const faqCategories = [
    {
      title: 'Начало работы',
      icon: Sparkles,
      questions: [
        {
          question: 'Как создать первый проект?',
          answer: 'Нажми «Создать сайт» или «Собрать Mini App» на главной странице, опиши свою идею в текстовом поле — и AI сгенерирует уникальный проект за несколько минут.'
        },
        {
          question: 'Нужны ли навыки программирования?',
          answer: 'Нет! ЛЮБАКОДЪ создан для всех. Просто опиши словами, что хочешь получить — AI сделает всё за тебя. Никакого кода писать не нужно.'
        },
        {
          question: 'Чем это отличается от конструкторов с шаблонами?',
          answer: 'ЛЮБАКОДЪ не использует шаблоны. Каждый проект генерируется AI с нуля под твоё описание. Ты получаешь уникальный дизайн, а не клон тысяч других сайтов.'
        },
        {
          question: 'Сколько времени занимает создание сайта?',
          answer: 'Первая версия генерируется за 1-3 минуты. Доработки через диалог занимают секунды — AI моментально применяет изменения.'
        },
      ]
    },
    {
      title: 'Редактирование и доработка',
      icon: Palette,
      questions: [
        {
          question: 'Как изменить дизайн после генерации?',
          answer: 'Просто напиши в чат, что хочешь изменить. Например: «Сделай кнопку красной» или «Добавь секцию с отзывами». AI поймёт и применит изменения.'
        },
        {
          question: 'Можно ли отменить изменения?',
          answer: 'Да! У каждого проекта есть история версий. Ты можешь вернуться к любой предыдущей версии в любой момент.'
        },
        {
          question: 'Как добавить новые страницы?',
          answer: 'Попроси AI: «Добавь страницу контактов» или «Создай раздел с портфолио». AI создаст новую страницу с нужным контентом.'
        },
        {
          question: 'Можно ли загрузить свои изображения?',
          answer: 'Да, ты можешь загружать свои фото, логотипы и другие изображения. Просто прикрепи файл к сообщению и AI добавит его в проект.'
        },
      ]
    },
    {
      title: 'Публикация',
      icon: Globe,
      questions: [
        {
          question: 'Как опубликовать проект?',
          answer: 'После генерации нажми кнопку «Опубликовать». Проект станет доступен по уникальной ссылке мгновенно — никаких настроек не требуется.'
        },
        {
          question: 'Можно ли использовать свой домен?',
          answer: 'Да, на платных тарифах доступно подключение собственного домена. Просто укажи свой домен в настройках проекта.'
        },
        {
          question: 'Сайт будет работать на телефонах?',
          answer: 'Да! Все сайты автоматически адаптируются под мобильные устройства. Проверить можно прямо в редакторе.'
        },
        {
          question: 'Что такое Telegram Mini App?',
          answer: 'Telegram Mini App (TMA) — это веб-приложение, которое открывается прямо внутри Telegram. Поддерживает авторизацию через Telegram и оплату через Stars.'
        },
      ]
    },
    {
      title: 'Тарифы и оплата',
      icon: CreditCard,
      questions: [
        {
          question: 'Есть бесплатный тариф?',
          answer: 'Да! Бесплатный тариф позволяет создавать проекты и тестировать возможности платформы. Для публикации и продвинутых функций нужен платный тариф.'
        },
        {
          question: 'Какие способы оплаты принимаете?',
          answer: 'Принимаем банковские карты, оплату через Telegram Stars и другие популярные способы оплаты.'
        },
        {
          question: 'Можно ли сменить тариф?',
          answer: 'Да, ты можешь повысить или понизить тариф в любой момент. Изменения вступят в силу со следующего расчётного периода.'
        },
        {
          question: 'Есть ли пробный период?',
          answer: 'Бесплатный тариф позволяет попробовать все основные функции без ограничения по времени.'
        },
      ]
    },
    {
      title: 'Безопасность',
      icon: Shield,
      questions: [
        {
          question: 'Данные хранятся безопасно?',
          answer: 'Да, все данные хранятся на защищённых серверах с шифрованием. Мы не передаём данные третьим лицам. Подробнее в Политике конфиденциальности.'
        },
        {
          question: 'Кто владеет созданными проектами?',
          answer: 'Ты полностью владеешь всеми своими проектами. Мы не используем твой контент без разрешения.'
        },
        {
          question: 'Можно ли удалить аккаунт?',
          answer: 'Да, ты можешь удалить аккаунт и все данные в настройках профиля. Удаление происходит безвозвратно.'
        },
        {
          question: 'Что делать, если что-то не работает?',
          answer: 'Попробуй обновить страницу. Если проблема сохраняется — напиши в поддержку с описанием ситуации, мы быстро поможем.'
        },
      ]
    },
  ];

  return (
    <DocsLayout
      title="Помощь и частые вопросы"
      description="Ответы на популярные вопросы и способы связи с командой ЛЮБАКОДЪ"
    >
      {/* Contact options */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Связаться с нами</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <a 
            href="https://t.me/lybacode" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Telegram</div>
              <div className="text-xs text-muted-foreground">@lybacode</div>
            </div>
          </a>
          <a 
            href="mailto:info@lybacode.ink"
            className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-xs text-muted-foreground">info@lybacode.ink</div>
            </div>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <section key={categoryIndex}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <category.icon className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold">{category.title}</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`${categoryIndex}-${index}`}
                  className="border border-border rounded-lg mb-2 px-4 bg-card/50 hover:bg-card transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-3 text-sm">
                    <span className="font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-xs pb-3">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
    </DocsLayout>
  );
};

export default FAQ;
