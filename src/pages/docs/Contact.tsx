import { DocsLayout } from '@/components/docs/DocsLayout';
import { Send, Mail, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <DocsLayout
      title="Контакты"
      description="Свяжитесь с командой ЛЮБАКОДЪ"
    >
      <section className="mb-12">
        <div className="grid gap-6">
          {/* Telegram */}
          <a 
            href="https://t.me/lybacode" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-5 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Telegram</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Самый быстрый способ связи — отвечаем в течение часа
              </p>
              <span className="text-sm text-primary">@lybacode</span>
            </div>
          </a>

          {/* Email */}
          <a 
            href="mailto:info@lybacode.ink"
            className="flex items-start gap-4 p-5 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Email</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Для деловых предложений и партнёрства
              </p>
              <span className="text-sm text-primary">info@lybacode.ink</span>
            </div>
          </a>

          {/* Location */}
          <div className="flex items-start gap-4 p-5 rounded-lg border border-border bg-card/50">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Локация</h3>
              <p className="text-sm text-muted-foreground">
                Работаем удалённо из разных точек мира ◈
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Working hours */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Время работы</h2>
        <p className="text-muted-foreground leading-relaxed">
          Мы работаем с понедельника по пятницу, с 10:00 до 19:00 (МСК). 
          В выходные можем отвечать чуть дольше обычного.
        </p>
      </section>
    </DocsLayout>
  );
};

export default Contact;
