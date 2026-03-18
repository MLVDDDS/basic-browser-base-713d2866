import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { BackendMigrationItem } from "@/features/builder/api/project-code-api";

interface MigrationsTabProps {
  migrations: BackendMigrationItem[];
  migrationsLoading: boolean;
  migrationsError: string;
  selectedMigrationId: string;
  onSelectedMigrationIdChange: (id: string) => void;
  selectedMigration: BackendMigrationItem | null;
  onRefresh: () => void;
  statusBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline";
  formatDateTime: (value?: string | null) => string;
}

export function MigrationsTab({
  migrations,
  migrationsLoading,
  migrationsError,
  selectedMigrationId,
  onSelectedMigrationIdChange,
  selectedMigration,
  onRefresh,
  statusBadgeVariant,
  formatDateTime,
}: MigrationsTabProps) {
  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-medium">История миграций (read-only)</div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[11px]"
          onClick={onRefresh}
          disabled={migrationsLoading}
        >
          {migrationsLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      {migrationsError ? (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {migrationsError}
        </div>
      ) : null}
      <ScrollArea className="h-40 rounded-md border">
        <div className="space-y-2 p-2">
          {migrations.length === 0 ? (
            <div className="p-2 text-[11px] text-muted-foreground">История миграций пустая.</div>
          ) : (
            migrations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectedMigrationIdChange(item.id)}
                className={`w-full rounded-md border p-2 text-left ${
                  selectedMigrationId === item.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="truncate text-xs font-medium">{item.id.slice(0, 8)}</div>
                  <Badge variant={statusBadgeVariant(item.status)} className="text-[10px]">
                    {item.status}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  обновлено {formatDateTime(item.updatedAt || item.createdAt || null)}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
      {selectedMigration ? (
        <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
          <div>режим: {selectedMigration.summary?.applyMode || selectedMigration.applyMode || "—"}</div>
          <div>собрано: {formatDateTime(selectedMigration.summary?.compiledAt)}</div>
          <div>применено: {formatDateTime(selectedMigration.summary?.appliedAt)}</div>
          <div>откачено: {formatDateTime(selectedMigration.summary?.rolledBackAt)}</div>
          {selectedMigration.summary?.errorMessage || selectedMigration.errorMessage ? (
            <div className="text-destructive">
              {selectedMigration.summary?.errorMessage || selectedMigration.errorMessage}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
