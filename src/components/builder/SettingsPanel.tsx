import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STYLE_PRESETS, StylePreset } from '@/types/siteSpec';

interface SettingsPanelProps {
  projectName: string;
  projectSlug: string;
  stylePreset: StylePreset;
  darkMode: boolean;
  onProjectNameChange: (name: string) => void;
  onProjectSlugChange: (slug: string) => void;
  onStylePresetChange: (preset: StylePreset) => void;
  onDarkModeChange: (enabled: boolean) => void;
}

export const SettingsPanel = ({
  projectName,
  projectSlug,
  stylePreset,
  darkMode,
  onProjectNameChange,
  onProjectSlugChange,
  onStylePresetChange,
  onDarkModeChange,
}: SettingsPanelProps) => {
  return (
    <div className="space-y-6">
      {/* Project Info */}
      <div>
        <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          Проект
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="project-name" className="text-sm">Название</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="project-slug" className="text-sm">URL (slug)</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm text-muted-foreground whitespace-nowrap">lyubakod.app/p/</span>
              <Input
                id="project-slug"
                value={projectSlug}
                onChange={(e) => onProjectSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Theme */}
      <div>
        <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          Тема
        </h4>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Стиль</Label>
            <Select value={stylePreset} onValueChange={(v) => onStylePresetChange(v as StylePreset)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STYLE_PRESETS).map(([key, preset]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ background: `hsl(${preset.colors.primary})` }}
                      />
                      {preset.nameRu}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-sm">Тёмная тема</Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={onDarkModeChange}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Style Preview */}
      <div>
        <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          Превью палитры
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {['primary', 'secondary', 'accent', 'background', 'foreground', 'muted'].map((color) => (
            <div key={color} className="text-center">
              <div
                className="w-full aspect-square rounded-lg border border-border mb-1"
                style={{ 
                  background: `hsl(${STYLE_PRESETS[stylePreset].colors[color as keyof typeof STYLE_PRESETS.minimal.colors]})` 
                }}
              />
              <span className="text-[10px] text-muted-foreground capitalize">{color}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
