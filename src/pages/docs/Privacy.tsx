import { DocsLayout } from '@/components/docs/DocsLayout';

const Privacy = () => {
  return (
    <DocsLayout
      title="Политика конфиденциальности"
      description="Как мы собираем, используем и защищаем ваши данные"
      lastUpdated="15 января 2026"
    >
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Общие положения</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Настоящая Политика конфиденциальности определяет порядок обработки и защиты 
          персональных данных пользователей сервиса ЛЮБАКОДЪ (далее — «Сервис»).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Используя Сервис, вы соглашаетесь с условиями данной Политики конфиденциальности.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Какие данные мы собираем</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Мы можем собирать следующие категории данных:
        </p>
        <ul className="space-y-2 text-muted-foreground mb-4">
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            <strong>Регистрационные данные:</strong> email, имя пользователя
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            <strong>Данные проектов:</strong> промпты, сгенерированные сайты, настройки
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            <strong>Технические данные:</strong> IP-адрес, тип браузера, данные cookies
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            <strong>Данные использования:</strong> действия в Сервисе, история генераций
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Как мы используем данные</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Собранные данные используются для:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Предоставления и улучшения Сервиса
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Улучшения качества AI-генерации
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Персонализации пользовательского опыта
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Отправки важных уведомлений о Сервисе
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Обеспечения безопасности аккаунтов
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. AI и ваши данные</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Ваши промпты и сгенерированные проекты могут использоваться для улучшения 
          качества AI-моделей. Мы не передаём персональные данные третьим лицам 
          без вашего согласия.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Вы можете запросить удаление всех данных, связанных с вашими генерациями.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Защита данных</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Мы применяем современные технические и организационные меры для защиты 
          ваших персональных данных от несанкционированного доступа, изменения, 
          раскрытия или уничтожения.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Все данные хранятся на защищённых серверах с шифрованием.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          Сервис использует cookies для обеспечения работы, аналитики и персонализации. 
          Вы можете отключить cookies в настройках браузера, однако это может повлиять 
          на функциональность Сервиса.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">7. Ваши права</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Вы имеете право:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Получить доступ к своим персональным данным
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Потребовать исправления неточных данных
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Потребовать удаления ваших данных и генераций
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">◈</span>
            Отозвать согласие на обработку данных
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">8. Контакты</h2>
        <p className="text-muted-foreground leading-relaxed">
          По вопросам, связанным с обработкой персональных данных, свяжитесь с нами через{' '}
          <a href="https://t.me/lybacode" className="text-primary hover:underline">
            Telegram
          </a>.
        </p>
      </section>
    </DocsLayout>
  );
};

export default Privacy;