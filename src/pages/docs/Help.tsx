import { DocsLayout } from '@/components/docs/DocsLayout';
import { MessageCircle, Mail, FileQuestion } from 'lucide-react';

const Help = () => {
  const faqs = [
    {
      question: 'Как создать первый проект?',
      answer: 'Нажми «Создать сайт» или «Собрать Mini App» на главной странице, опиши свою идею в текстовом поле — и AI сгенерирует уникальный проект.'
    },
    {
      question: 'Чем это отличается от конструкторов с шаблонами?',
      answer: 'ЛЮБАКОДЪ не использует шаблоны. Каждый проект генерируется AI с нуля под твоё описание. Ты получаешь уникальный дизайн, а не клон тысяч других сайтов.'
    },
    {
      question: 'Что такое Telegram Mini App?',
      answer: 'Telegram Mini App (TMA) — это веб-приложение, которое открывается прямо внутри Telegram. Поддерживает авторизацию через Telegram и оплату через Stars.'
    },
    {
      question: 'Как опубликовать проект?',
      answer: 'После генерации нажми кнопку «Опубликовать». Проект станет доступен по уникальной ссылке мгновенно.'
    },
    {
      question: 'Можно ли использовать свой домен?',
      answer: 'Да, на платных тарифах доступно подключение собственного домена к твоему проекту.'
    },
    {
      question: 'Как доработать сгенерированный проект?',
      answer: 'Через диалог с AI — просто напиши, что хочешь изменить. Например: «Сделай кнопку больше» или «Добавь секцию с отзывами».'
    },
    {
      question: 'Данные хранятся безопасно?',
      answer: 'Да, все данные хранятся на защищённых серверах с шифрованием. Подробнее в Политике конфиденциальности.'
    },
  ];

  return (
    <DocsLayout
      title="Помощь"
      description="Ответы на частые вопросы и способы связи"
    >
      {/* Contact options */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Связаться с нами</h2>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <a 
            href="https://t.me/lyubakod" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-colors group"
          >
            <MessageCircle className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium mb-1">Telegram</h3>
            <p className="text-sm text-muted-foreground">
              Быстрые ответы в чате
            </p>
          </a>
          
          <a 
            href="mailto:support@lyubakod.app"
            className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-colors group"
          >
            <Mail className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium mb-1">Email</h3>
            <p className="text-sm text-muted-foreground">
              support@lyubakod.app
            </p>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <FileQuestion className="w-5 h-5 text-primary" />
          Частые вопросы
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg border border-border bg-card/50"
            >
              <h3 className="font-medium mb-2">{faq.question}</h3>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
};

export default Help;
