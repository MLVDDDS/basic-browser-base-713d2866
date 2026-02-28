import { DocsLayout } from '@/components/docs/DocsLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, Sparkles, CreditCard, Globe, Palette, MessageCircle, Shield, Zap } from 'lucide-react';

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
      title: 'Техподдержка',
      icon: MessageCircle,
      questions: [
        {
          question: 'Как связаться с поддержкой?',
          answer: 'Напиши нам в Telegram (@lybacode) или на email info@lybacode.ink. Отвечаем в течение нескольких часов.'
        },
        {
          question: 'Что делать, если что-то не работает?',
          answer: 'Попробуй обновить страницу. Если проблема сохраняется — напиши в поддержку с описанием ситуации, мы быстро поможем.'
        },
        {
          question: 'Есть ли обучающие материалы?',
          answer: 'Да! В разделе «Как это работает» есть пошаговые инструкции. Также можно задать любой вопрос AI-ассистенту прямо в чате проекта.'
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
      ]
    },
  ];

  return (
    <DocsLayout
      title="Частые вопросы"
      description="Ответы на популярные вопросы о платформе ЛЮБАКОДЪ"
    >
      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <section key={categoryIndex}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <category.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">{category.title}</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`${categoryIndex}-${index}`}
                  className="border border-border rounded-lg mb-2 px-4 bg-card/50 hover:bg-card transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
        
        {/* Contact CTA */}
        <div className="mt-12 p-6 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 text-center">
          <HelpCircle className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Не нашёл ответ?</h3>
          <p className="text-muted-foreground mb-4">
            Напиши нам — мы поможем разобраться!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="https://t.me/lybacode" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Telegram
            </a>
            <a 
              href="mailto:info@lybacode.ink"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-card transition-colors"
            >
              <Zap className="w-4 h-4" />
              Email
            </a>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
};

export default FAQ;
