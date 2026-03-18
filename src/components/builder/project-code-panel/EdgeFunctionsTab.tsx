import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  AutomationJobLogItem,
  AutomationJobStatusItem,
  EdgeFunctionItem,
  EdgeInvocationItem,
} from "@/features/builder/api/project-code-api";

interface EdgeFunctionsTabProps {
  edgeFunctions: EdgeFunctionItem[];
  edgeFunctionsLoading: boolean;
  edgeFunctionsError: string;
  selectedEdgeFunctionId: string;
  onSelectedEdgeFunctionIdChange: (id: string) => void;
  selectedEdgeFunction: EdgeFunctionItem | null;
  selectedEdgeFunctionSource: string;
  selectedInvocations: EdgeInvocationItem[];
  selectedDeployJob: AutomationJobStatusItem | null;
  selectedDeployJobLogs: AutomationJobLogItem[];
  edgeInvocationsLoading: boolean;
  edgeDeployJobLoading: boolean;
  onRefreshFunctions: () => void;
  onRefreshSelectedLogs: () => void;
  statusBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline";
  formatDateTime: (value?: string | null) => string;
}

export function EdgeFunctionsTab({
  edgeFunctions,
  edgeFunctionsLoading,
  edgeFunctionsError,
  selectedEdgeFunctionId,
  onSelectedEdgeFunctionIdChange,
  selectedEdgeFunction,
  selectedEdgeFunctionSource,
  selectedInvocations,
  selectedDeployJob,
  selectedDeployJobLogs,
  edgeInvocationsLoading,
  edgeDeployJobLoading,
  onRefreshFunctions,
  onRefreshSelectedLogs,
  statusBadgeVariant,
  formatDateTime,
}: EdgeFunctionsTabProps) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="rounded-md border p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium">Edge functions (read-only)</div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={onRefreshFunctions}
            disabled={edgeFunctionsLoading}
          >
            {edgeFunctionsLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        {edgeFunctionsError ? (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {edgeFunctionsError}
          </div>
        ) : null}
      </div>

      <ScrollArea className="h-48 rounded-md border">
        <div className="space-y-2 p-2">
          {edgeFunctions.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground">Функции пока не созданы.</div>
          ) : (
            edgeFunctions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectedEdgeFunctionIdChange(item.id)}
                className={`w-full rounded-md border p-2 text-left ${
                  selectedEdgeFunctionId === item.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="truncate text-xs font-medium">{item.functionName}</div>
                  <Badge variant={statusBadgeVariant(item.deployStatus)} className="text-[10px]">
                    {item.deployStatus}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {item.functionSlug} · v{item.version}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  обновлено {formatDateTime(item.updatedAt)}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {selectedEdgeFunction ? (
        <div className="rounded-md border p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-medium">{selectedEdgeFunction.functionName}</div>
            <div className="text-[11px] text-muted-foreground">v{selectedEdgeFunction.version}</div>
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={statusBadgeVariant(selectedEdgeFunction.deployStatus)} className="text-[10px]">
              {selectedEdgeFunction.deployStatus}
            </Badge>
            {selectedDeployJob?.status ? (
              <Badge variant={statusBadgeVariant(selectedDeployJob.status)} className="text-[10px]">
                job:{selectedDeployJob.status}
              </Badge>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1.5 text-[11px]"
              onClick={onRefreshSelectedLogs}
              disabled={edgeInvocationsLoading || edgeDeployJobLoading}
            >
              {edgeInvocationsLoading || edgeDeployJobLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Обновить логи
            </Button>
          </div>
          {selectedEdgeFunction.lastDeployJobId ? (
            <div className="mb-2 text-[10px] text-muted-foreground">
              job: {selectedEdgeFunction.lastDeployJobId}
            </div>
          ) : null}
          {selectedEdgeFunction.deployMessage ? (
            <div className="mb-2 text-[10px] text-muted-foreground">{selectedEdgeFunction.deployMessage}</div>
          ) : null}
          {selectedDeployJob?.errorMessage || selectedDeployJob?.lastErrorMessage ? (
            <div className="mb-2 text-[10px] text-destructive">
              {selectedDeployJob?.errorMessage || selectedDeployJob?.lastErrorMessage}
            </div>
          ) : null}
          {selectedDeployJobLogs.length > 0 ? (
            <div className="mb-2 space-y-1">
              {selectedDeployJobLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="rounded border px-1.5 py-1 text-[10px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-muted-foreground">{log.level || "info"}</span>
                    <span className="text-muted-foreground">{formatDateTime(log.created_at || null)}</span>
                  </div>
                  <div className="mt-0.5 break-words">{log.message || ""}</div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mb-2 space-y-1.5">
            <div className="text-[11px] font-medium text-muted-foreground">Последние вызовы</div>
            {selectedInvocations.length === 0 ? (
              <div className="text-[11px] text-muted-foreground">Логи вызовов пустые</div>
            ) : (
              selectedInvocations.slice(0, 8).map((entry) => (
                <div key={entry.id} className="rounded-md border px-2 py-1.5 text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate">
                      {entry.method} {entry.pathSuffix || "/"} · {entry.invokeMode}
                    </div>
                    <Badge variant={entry.responseOk ? "default" : "destructive"} className="text-[10px]">
                      {entry.responseStatus || "n/a"}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{entry.durationMs || 0}ms</span>
                    <span>{formatDateTime(entry.createdAt)}</span>
                  </div>
                  {entry.errorMessage ? (
                    <div className="mt-1 text-[10px] text-destructive">{entry.errorMessage}</div>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div className="text-[11px] font-medium text-muted-foreground">Код функции</div>
          {selectedEdgeFunctionSource ? (
            <ScrollArea className="mt-1 h-56 rounded-md border bg-muted/20">
              <pre className="whitespace-pre-wrap p-2 font-mono text-[10px] leading-4">
                {selectedEdgeFunctionSource}
              </pre>
            </ScrollArea>
          ) : (
            <div className="mt-1 text-[11px] text-muted-foreground">Код не найден в runtime payload.</div>
          )}
          <div className="mt-2 text-[10px] text-muted-foreground">
            Управление жизненным циклом функции выполняется агентом через чат.
          </div>
        </div>
      ) : (
        <div className="rounded-md border p-3 text-[11px] text-muted-foreground">
          Выбери edge function из списка, чтобы увидеть код и логи.
        </div>
      )}
    </div>
  );
}
