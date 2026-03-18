// Human-readable labels for agent actions
// Converts technical tool names to user-friendly messages

export interface AgentAction {
  label: string;
  description: string;
  icon: 'thinking' | 'writing' | 'editing' | 'fixing' | 'adding' | 'checking' | 'done';
}

const toolLabels: Record<string, AgentAction> = {
  // Thinking / reasoning
  'thinking': {
    label: 'Анализирую задачу',
    description: 'Думаю над лучшим решением',
    icon: 'thinking',
  },
  'planning': {
    label: 'Планирую изменения',
    description: 'Определяю что нужно сделать',
    icon: 'thinking',
  },
  
  // File operations
  'create_file': {
    label: 'Создаю файл',
    description: 'Добавляю новый компонент',
    icon: 'adding',
  },
  'edit_file': {
    label: 'Редактирую код',
    description: 'Вношу изменения в файл',
    icon: 'editing',
  },
  'delete_file': {
    label: 'Удаляю файл',
    description: 'Убираю ненужный код',
    icon: 'editing',
  },
  'write_file': {
    label: 'Записываю файл',
    description: 'Сохраняю изменения',
    icon: 'writing',
  },
  'read_file': {
    label: 'Изучаю код',
    description: 'Читаю существующий файл',
    icon: 'checking',
  },
  
  // Build / compile
  'build': {
    label: 'Собираю проект',
    description: 'Компилирую все компоненты',
    icon: 'writing',
  },
  'install': {
    label: 'Устанавливаю зависимости',
    description: 'Добавляю нужные пакеты',
    icon: 'adding',
  },
  
  // Fixes
  'fix_error': {
    label: 'Исправляю ошибку',
    description: 'Чиню проблему в коде',
    icon: 'fixing',
  },
  'debug': {
    label: 'Отлаживаю код',
    description: 'Ищу и исправляю баги',
    icon: 'fixing',
  },
  
  // UI / Design
  'style': {
    label: 'Улучшаю дизайн',
    description: 'Добавляю стили и анимации',
    icon: 'editing',
  },
  'responsive': {
    label: 'Адаптирую под мобильные',
    description: 'Делаю версию для телефонов',
    icon: 'editing',
  },
  
  // Completion
  'complete': {
    label: 'Готово!',
    description: 'Все изменения применены',
    icon: 'done',
  },
};

// Content-based detection for more natural labels
const contentPatterns: Array<{ pattern: RegExp; action: AgentAction }> = [
  {
    pattern: /hero|главн|заголов/i,
    action: { label: 'Работаю над Hero-секцией', description: 'Создаю главный блок страницы', icon: 'writing' },
  },
  {
    pattern: /footer|подвал|футер/i,
    action: { label: 'Добавляю Footer', description: 'Создаю нижнюю часть сайта', icon: 'writing' },
  },
  {
    pattern: /header|шапк|навигац/i,
    action: { label: 'Создаю Header', description: 'Добавляю навигацию сайта', icon: 'writing' },
  },
  {
    pattern: /кнопк|button/i,
    action: { label: 'Добавляю кнопки', description: 'Создаю интерактивные элементы', icon: 'adding' },
  },
  {
    pattern: /анимац|animation|motion/i,
    action: { label: 'Добавляю анимации', description: 'Делаю интерфейс живым', icon: 'editing' },
  },
  {
    pattern: /форм|form|input/i,
    action: { label: 'Создаю форму', description: 'Добавляю поля ввода', icon: 'adding' },
  },
  {
    pattern: /карточ|card/i,
    action: { label: 'Создаю карточки', description: 'Добавляю блоки контента', icon: 'adding' },
  },
  {
    pattern: /галере|gallery|изображ|image/i,
    action: { label: 'Добавляю галерею', description: 'Создаю блок с изображениями', icon: 'adding' },
  },
  {
    pattern: /цен|price|тариф/i,
    action: { label: 'Создаю блок цен', description: 'Добавляю тарифы и цены', icon: 'adding' },
  },
  {
    pattern: /отзыв|testimonial|review/i,
    action: { label: 'Добавляю отзывы', description: 'Создаю блок с отзывами', icon: 'adding' },
  },
  {
    pattern: /контакт|contact/i,
    action: { label: 'Добавляю контакты', description: 'Создаю блок связи', icon: 'adding' },
  },
  {
    pattern: /мобильн|mobile|респонсив|responsive/i,
    action: { label: 'Адаптирую под мобильные', description: 'Улучшаю отображение на телефонах', icon: 'editing' },
  },
  {
    pattern: /ошибк|error|fix|исправ/i,
    action: { label: 'Исправляю ошибку', description: 'Чиню проблему в коде', icon: 'fixing' },
  },
  {
    pattern: /стил|style|css|дизайн/i,
    action: { label: 'Улучшаю дизайн', description: 'Добавляю стили', icon: 'editing' },
  },
];

export function getAgentLabel(
  toolName?: string,
  content?: string,
  fileName?: string
): AgentAction {
  // First, check content for context-based label
  if (content) {
    for (const { pattern, action } of contentPatterns) {
      if (pattern.test(content)) {
        return action;
      }
    }
  }
  
  // Then check tool name
  if (toolName && toolLabels[toolName]) {
    return toolLabels[toolName];
  }
  
  // File-specific labels
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const name = fileName.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
    
    if (ext === 'css' || ext === 'scss') {
      return { label: 'Добавляю стили', description: `Редактирую ${name}`, icon: 'editing' };
    }
    if (ext === 'tsx' || ext === 'jsx') {
      return { label: 'Создаю компонент', description: `Работаю над ${name}`, icon: 'writing' };
    }
    if (ext === 'ts' || ext === 'js') {
      return { label: 'Пишу логику', description: `Обновляю ${name}`, icon: 'writing' };
    }
  }
  
  // Default
  return {
    label: 'Работаю над проектом',
    description: 'Применяю изменения',
    icon: 'writing',
  };
}

export function formatAgentStep(step: { type: string; label?: string; content?: string; file?: string }): AgentAction {
  return getAgentLabel(step.type, step.content || step.label, step.file);
}
