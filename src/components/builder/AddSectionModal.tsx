import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Search,
  Target,
  Sparkles,
  Image,
  MessageSquareQuote,
  Coins,
  Rocket,
  HelpCircle,
  Mail,
  Package,
  LucideIcon,
} from 'lucide-react';

interface AddSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (type: string, name: string) => void;
}

const sectionTypes: { type: string; name: string; Icon: LucideIcon }[] = [
  { type: 'hero', name: 'Hero', Icon: Target },
  { type: 'features', name: 'Возможности', Icon: Sparkles },
  { type: 'gallery', name: 'Галерея', Icon: Image },
  { type: 'testimonials', name: 'Отзывы', Icon: MessageSquareQuote },
  { type: 'pricing', name: 'Тарифы', Icon: Coins },
  { type: 'cta', name: 'CTA', Icon: Rocket },
  { type: 'faq', name: 'FAQ', Icon: HelpCircle },
  { type: 'contact', name: 'Контакты', Icon: Mail },
  { type: 'custom', name: 'Пустой блок', Icon: Package },
];

export const AddSectionModal = ({ open, onOpenChange, onAdd }: AddSectionModalProps) => {
  const [search, setSearch] = useState('');

  const filteredSections = sectionTypes.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (type: string, name: string) => {
    onAdd(type, name);
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить секцию</DialogTitle>
        </DialogHeader>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="pl-9"
          />
        </div>

        {/* Grid of sections */}
        <div className="grid grid-cols-3 gap-2">
          {filteredSections.map((section) => (
            <button
              key={section.type}
              onClick={() => handleAdd(section.type, section.name)}
              className={cn(
                'p-3 rounded-lg border border-border text-center transition-all',
                'hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <section.Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
              <span className="text-xs font-medium block truncate">{section.name}</span>
            </button>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Ничего не найдено
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
