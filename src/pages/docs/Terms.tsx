import { DocsLayout } from '@/components/docs/DocsLayout';

const Terms = () => {
  return (
    <DocsLayout
      title="Условия использования"
      description="Правила использования сервиса ЛЮБАКОДЪ"
      lastUpdated="15 января 2026"
    >
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Общие положения</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Настоящие Условия использования (далее — «Условия») регулируют отношения 
          между пользователями и сервисом ЛЮБАКОДЪ (далее — «Сервис»).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Регистрируясь в Сервисе или используя его, вы подтверждаете согласие 
          с настоящими Условиями.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Описание Сервиса</h2>
        <p className="text-muted-foreground leading-relaxed">
          ЛЮБАКОДЪ — AI-платформа для создания сайтов и Telegram Mini Apps. 
          Сервис использует искусственный интеллект для генерации уникальных проектов 
          на основе текстовых описаний пользователей. Публикация проектов осуществляется 
          через инфраструктуру Сервиса.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Регистрация</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Для использования функций Сервиса может потребоваться регистрация. 
          Вы обязуетесь:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Предоставлять достоверную информацию
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Обеспечивать конфиденциальность учётных данных
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Немедленно уведомлять о несанкционированном доступе
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Правила использования</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          При использовании Сервиса запрещается:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Нарушать законодательство РФ и международные нормы
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Размещать противоправный, оскорбительный или вредоносный контент
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Нарушать права интеллектуальной собственности
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Осуществлять попытки взлома или нарушения работы Сервиса
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Использовать AI для генерации запрещённого контента
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. AI-генерация контента</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Сервис использует AI для генерации контента на основе ваших промптов. 
          Вы несёте ответственность за содержание промптов и использование 
          сгенерированных материалов.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          ЛЮБАКОДЪ не гарантирует полное соответствие результата вашим ожиданиям, 
          но предоставляет возможность доработки через диалог с AI.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Интеллектуальная собственность</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Все права на Сервис, включая дизайн, код и AI-модели, принадлежат ЛЮБАКОДЪ 
          или его лицензиарам.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Проекты, созданные пользователями с помощью Сервиса, являются собственностью 
          пользователей. ЛЮБАКОДЪ получает неисключительную лицензию на их размещение 
          в рамках Сервиса.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">7. Тарифы и оплата</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Сервис может предлагать платные функции. Актуальные тарифы указаны 
          на странице{' '}
          <a href="/pricing" className="text-primary hover:underline">
            Тарифы
          </a>.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Оплата осуществляется в соответствии с выбранным тарифным планом.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">8. Ограничение ответственности</h2>
        <p className="text-muted-foreground leading-relaxed">
          Сервис предоставляется «как есть». Мы не гарантируем бесперебойную работу 
          и не несём ответственности за убытки, связанные с использованием Сервиса, 
          в пределах, допускаемых законодательством.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">9. Изменение условий</h2>
        <p className="text-muted-foreground leading-relaxed">
          Мы оставляем за собой право изменять настоящие Условия. Продолжение 
          использования Сервиса после внесения изменений означает принятие 
          обновлённых Условий.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">10. Контакты</h2>
        <p className="text-muted-foreground leading-relaxed">
          По вопросам, связанным с Условиями использования, свяжитесь с нами через{' '}
          <a href="https://t.me/lybacode" className="text-primary hover:underline">
            Telegram
          </a>.
        </p>
      </section>
    </DocsLayout>
  );
};

export default Terms;