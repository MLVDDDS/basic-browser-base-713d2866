// Panel for AST-based code editing with AI
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wand2, 
  Send, 
  Loader2,
  FileCode,
  Plus,
  Trash2,
  Edit3,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectStructure } from '@/types/project';
import { CodeEdit } from '@/lib/ast-editor';
import { toast } from 'sonner';

interface CodeEditorPanelProps {
  project: ProjectStructure | null;
  onEditFile: (path: string, edits: CodeEdit[]) => void;
  onAddFile: (path: string, content: string) => void;
  onDeleteFile: (path: string) => void;
  className?: string;
}

interface EditSuggestion {
  id: string;
  description: string;
  filePath: string;
  edits: CodeEdit[];
}

export function CodeEditorPanel({
  project,
  onEditFile,
  onAddFile,
  onDeleteFile,
  className,
}: CodeEditorPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<EditSuggestion[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // AI-powered edit suggestions based on prompt
  const generateEditSuggestions = useCallback(async () => {
    if (!prompt.trim() || !project) return;
    
    setIsProcessing(true);
    
    try {
      // For now, generate mock suggestions based on common patterns
      // In production, this would call an AI endpoint
      const mockSuggestions: EditSuggestion[] = [];
      
      if (prompt.toLowerCase().includes('button')) {
        mockSuggestions.push({
          id: '1',
          description: 'Добавить hover эффект к кнопкам',
          filePath: '/src/App.tsx',
          edits: [{
            type: 'replace',
            target: 'button',
            content: 'hover:scale-105 transition-transform',
          }],
        });
      }
      
      if (prompt.toLowerCase().includes('animation')) {
        mockSuggestions.push({
          id: '2',
          description: 'Добавить framer-motion анимации',
          filePath: '/src/App.tsx',
          edits: [{
            type: 'insert',
            target: '1',
            content: "import { motion } from 'framer-motion';",
            position: 'before',
          }],
        });
      }
      
      if (prompt.toLowerCase().includes('gradient')) {
        mockSuggestions.push({
          id: '3',
          description: 'Применить градиентный фон',
          filePath: '/src/App.tsx',
          edits: [{
            type: 'replace',
            target: 'bg-background',
            content: 'bg-gradient-to-br from-background via-muted to-background',
          }],
        });
      }

      // Always add generic suggestions
      mockSuggestions.push({
        id: 'generic',
        description: `Применить: "${prompt}"`,
        filePath: selectedFile || '/src/App.tsx',
        edits: [{
          type: 'replace',
          target: 'className',
          content: prompt,
        }],
      });
      
      setSuggestions(mockSuggestions);
      toast.success(`Найдено ${mockSuggestions.length} предложений`);
    } catch (error) {
      toast.error('Ошибка генерации предложений');
    } finally {
      setIsProcessing(false);
    }
  }, [prompt, project, selectedFile]);

  const applySuggestion = useCallback((suggestion: EditSuggestion) => {
    onEditFile(suggestion.filePath, suggestion.edits);
    toast.success('Изменения применены');
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }, [onEditFile]);

  if (!project) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center py-8">
          <FileCode className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Сначала создайте проект</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* File list */}
      <div className="border-b border-border">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Файлы проекта</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              const name = window.prompt('Имя файла:');
              if (name) {
                onAddFile(`/src/${name}`, '// New file\n');
              }
            }}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        <ScrollArea className="h-32">
          <div className="px-2 pb-2 space-y-0.5">
            {project.files.map(file => (
              <div 
                key={file.path}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded text-xs group cursor-pointer',
                  selectedFile === file.path 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                )}
                onClick={() => setSelectedFile(file.path)}
              >
                <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="flex-1 truncate">{file.path}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Удалить ${file.path}?`)) {
                      onDeleteFile(file.path);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* AI Edit Input */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Edit3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI редактор</span>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Опиши изменение... Например: добавь анимацию появления"
            className="min-h-[60px] text-sm flex-1"
          />
        </div>
        <Button
          onClick={generateEditSuggestions}
          disabled={!prompt.trim() || isProcessing}
          className="w-full mt-2 gap-2"
          size="sm"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Анализирую...
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              Предложить изменения
            </>
          )}
        </Button>
      </div>

      {/* Suggestions */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Опиши что изменить в коде
            </div>
          ) : (
            suggestions.map(suggestion => (
              <div 
                key={suggestion.id}
                className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm">{suggestion.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <FileCode className="w-3 h-3" />
                  <span>{suggestion.filePath}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 h-7 text-xs gap-1"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <Check className="w-3 h-3" />
                    Применить
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default CodeEditorPanel;
