import { useCallback, useEffect, useMemo, useState } from 'react';
import JSZip from 'jszip';
import { toast } from 'sonner';
import {
  AlertCircle,
  Code2,
  Download,
  History,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  fetchAutomationJob,
  fetchEdgeFunctionInvocations,
  fetchProjectBackendMigrations,
  fetchProjectBackendStatus,
  fetchProjectBackendTables,
  fetchProjectEdgeFunctions,
  type AutomationJobLogItem,
  type AutomationJobStatusItem,
  type BackendMigrationItem,
  type BackendTableItem,
  type EdgeFunctionItem,
  type EdgeInvocationItem,
  type ProjectBackendInfo,
} from '@/features/builder/api/project-code-api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { VersionTimeline } from './VersionTimeline';
import type { ProjectStructure } from '@/types/project';
import type { ProjectVersion } from '@/hooks/useProjectVersions';
import { normalizeZipPath } from '@/components/builder/project-code-panel/file-tree';
import { CodeTree } from '@/components/builder/project-code-panel/CodeTree';
import { MigrationsTab } from '@/components/builder/project-code-panel/MigrationsTab';
import { EdgeFunctionsTab } from '@/components/builder/project-code-panel/EdgeFunctionsTab';
import { useProjectCodePanelState } from '@/components/builder/project-code-panel/useProjectCodePanelState';

interface ProjectCodePanelProps {
  projectId?: string;
  projectName?: string;
  currentProject: ProjectStructure | null;
  versions: ProjectVersion[];
  isVersionsLoading?: boolean;
  onRestoreVersion?: (versionId: string) => void;
}

async function downloadZipArchive(zip: JSZip, filename: string) {
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export function ProjectCodePanel({
  projectId,
  projectName,
  currentProject,
  versions,
  isVersionsLoading = false,
  onRestoreVersion,
}: ProjectCodePanelProps) {
  const {
    isOpen,
    setIsOpen,
    mainTab,
    setMainTab,
    backendTab,
    setBackendTab,
    searchQuery,
    setSearchQuery,
    expandedFolderIds,
    setExpandedFolderIds,
    selectedEdgeFunctionId,
    setSelectedEdgeFunctionId,
    selectedMigrationId,
    setSelectedMigrationId,
  } = useProjectCodePanelState();
  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunctionItem[]>([]);
  const [edgeFunctionsLoading, setEdgeFunctionsLoading] = useState(false);
  const [edgeFunctionsError, setEdgeFunctionsError] = useState<string>('');
  const [edgeInvocations, setEdgeInvocations] = useState<Record<string, EdgeInvocationItem[]>>({});
  const [edgeInvocationsLoading, setEdgeInvocationsLoading] = useState(false);
  const [edgeDeployJobs, setEdgeDeployJobs] = useState<Record<string, AutomationJobStatusItem>>({});
  const [edgeDeployJobLogs, setEdgeDeployJobLogs] = useState<Record<string, AutomationJobLogItem[]>>({});
  const [edgeDeployJobLoading, setEdgeDeployJobLoading] = useState(false);
  const [backendInfo, setBackendInfo] = useState<ProjectBackendInfo | null>(null);
  const [backendInfoLoading, setBackendInfoLoading] = useState(false);
  const [backendInfoError, setBackendInfoError] = useState('');
  const [migrations, setMigrations] = useState<BackendMigrationItem[]>([]);
  const [migrationsLoading, setMigrationsLoading] = useState(false);
  const [migrationsError, setMigrationsError] = useState('');
  const [backendTables, setBackendTables] = useState<BackendTableItem[]>([]);
  const [backendTablesLoading, setBackendTablesLoading] = useState(false);
  const [backendTablesError, setBackendTablesError] = useState('');
  const [backendTablesSource, setBackendTablesSource] = useState('');
  const selectedEdgeFunction = useMemo(
    () => edgeFunctions.find((item) => item.id === selectedEdgeFunctionId) || null,
    [edgeFunctions, selectedEdgeFunctionId]
  );
  const selectedMigration = useMemo(
    () => migrations.find((item) => item.id === selectedMigrationId) || null,
    [migrations, selectedMigrationId]
  );
  const selectedInvocations = selectedEdgeFunctionId
    ? edgeInvocations[selectedEdgeFunctionId] || []
    : [];
  const selectedDeployJob = selectedEdgeFunctionId
    ? edgeDeployJobs[selectedEdgeFunctionId] || null
    : null;
  const selectedDeployJobLogs = selectedEdgeFunctionId
    ? edgeDeployJobLogs[selectedEdgeFunctionId] || []
    : [];
  const selectedEdgeFunctionSource = useMemo(() => {
    const runtimePayload = selectedEdgeFunction?.runtimePayload;
    if (!runtimePayload || typeof runtimePayload !== 'object') return '';
    const payload = runtimePayload as Record<string, unknown>;
    const filesRaw = payload.files;
    if (!filesRaw || typeof filesRaw !== 'object') return '';
    const files = filesRaw as Record<string, unknown>;
    const entrypoint = typeof payload.entrypoint === 'string' ? payload.entrypoint : 'index.ts';
    const direct = files[entrypoint];
    if (typeof direct === 'string') return direct;
    const fallback = files['index.ts'];
    return typeof fallback === 'string' ? fallback : '';
  }, [selectedEdgeFunction]);

  const loadEdgeFunctions = useCallback(async () => {
    if (!projectId) {
      setEdgeFunctions([]);
      setSelectedEdgeFunctionId('');
      return;
    }
    setEdgeFunctionsLoading(true);
    setEdgeFunctionsError('');
    try {
      const response = await fetchProjectEdgeFunctions(projectId);
      const items = Array.isArray(response?.functions) ? response.functions : [];
      setEdgeFunctions(items);
      setSelectedEdgeFunctionId((prev) => {
        if (prev && items.some((item) => item.id === prev)) return prev;
        return items[0]?.id || '';
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed_to_load_edge_functions';
      setEdgeFunctionsError(message);
    } finally {
      setEdgeFunctionsLoading(false);
    }
  }, [projectId, setSelectedEdgeFunctionId]);

  const loadBackendInfo = useCallback(async () => {
    if (!projectId) {
      setBackendInfo(null);
      return;
    }
    setBackendInfoLoading(true);
    setBackendInfoError('');
    try {
      const response = await fetchProjectBackendStatus(projectId);
      setBackendInfo(response?.backend || null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'backend_provision_failed';
      setBackendInfoError(message);
    } finally {
      setBackendInfoLoading(false);
    }
  }, [projectId]);

  const loadMigrations = useCallback(async () => {
    if (!projectId) {
      setMigrations([]);
      setSelectedMigrationId('');
      return;
    }
    setMigrationsLoading(true);
    setMigrationsError('');
    try {
      const response = await fetchProjectBackendMigrations(projectId);
      const items = Array.isArray(response?.migrations) ? response.migrations : [];
      setMigrations(items);
      setSelectedMigrationId((prev) => {
        if (prev && items.some((item) => item.id === prev)) return prev;
        return items[0]?.id || '';
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed_to_load_migrations';
      setMigrationsError(message);
    } finally {
      setMigrationsLoading(false);
    }
  }, [projectId, setSelectedMigrationId]);

  const loadBackendTables = useCallback(async () => {
    if (!projectId) {
      setBackendTables([]);
      setBackendTablesSource('');
      return;
    }
    setBackendTablesLoading(true);
    setBackendTablesError('');
    try {
      const response = await fetchProjectBackendTables(projectId);
      const items = Array.isArray(response?.tables) ? response.tables : [];
      setBackendTables(items);
      setBackendTablesSource(String(response?.source || ''));
      if (response?.introspectionError) {
        setBackendTablesError(String(response.introspectionError));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed_to_load_backend_tables';
      setBackendTablesError(message);
    } finally {
      setBackendTablesLoading(false);
    }
  }, [projectId]);

  const loadEdgeInvocations = useCallback(
    async (edgeFunctionId: string) => {
      if (!projectId || !edgeFunctionId) return;
      setEdgeInvocationsLoading(true);
      try {
        const response = await fetchEdgeFunctionInvocations(projectId, edgeFunctionId);
        const invocations = Array.isArray(response?.invocations) ? response.invocations : [];
        setEdgeInvocations((prev) => ({ ...prev, [edgeFunctionId]: invocations }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'failed_to_load_invocations';
        toast.error(`Логи вызовов: ${message}`);
      } finally {
        setEdgeInvocationsLoading(false);
      }
    },
    [projectId]
  );

  const loadEdgeDeployJobStatus = useCallback(
    async (edgeFunction: EdgeFunctionItem | null) => {
      if (!edgeFunction?.id || !edgeFunction.lastDeployJobId) {
        return;
      }
      setEdgeDeployJobLoading(true);
      try {
        const response = await fetchAutomationJob(edgeFunction.lastDeployJobId);
        if (response?.job) {
          setEdgeDeployJobs((prev) => ({ ...prev, [edgeFunction.id]: response.job as AutomationJobStatusItem }));
        }
        if (Array.isArray(response?.logs)) {
          setEdgeDeployJobLogs((prev) => ({
            ...prev,
            [edgeFunction.id]: response.logs as AutomationJobLogItem[],
          }));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'failed_to_load_deploy_job';
        toast.error(`Deploy logs: ${message}`);
      } finally {
        setEdgeDeployJobLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!isOpen || !projectId) return;
    void loadBackendInfo();
    void loadEdgeFunctions();
    void loadMigrations();
    void loadBackendTables();
  }, [isOpen, projectId, loadBackendInfo, loadEdgeFunctions, loadMigrations, loadBackendTables]);

  useEffect(() => {
    if (!isOpen || !selectedEdgeFunctionId) return;
    void loadEdgeInvocations(selectedEdgeFunctionId);
  }, [isOpen, selectedEdgeFunctionId, loadEdgeInvocations]);

  useEffect(() => {
    if (!isOpen || !selectedEdgeFunction?.lastDeployJobId) return;
    void loadEdgeDeployJobStatus(selectedEdgeFunction);
  }, [isOpen, selectedEdgeFunction, loadEdgeDeployJobStatus]);

  const handleDownloadCurrentZip = async () => {
    if (!currentProject?.files?.length) {
      toast.error('Нет файлов для скачивания');
      return;
    }
    try {
      const zip = new JSZip();
      for (const file of currentProject.files) {
        zip.file(normalizeZipPath(file.path), file.content || '');
      }
      const safeName = (projectName || 'project').replace(/[^a-zA-Z0-9-_]+/g, '-');
      await downloadZipArchive(zip, `${safeName}-current.zip`);
      toast.success('ZIP проекта скачан');
    } catch (error) {
      console.error('[ProjectCodePanel] download current zip failed:', error);
      toast.error('Не удалось сформировать ZIP');
    }
  };

  const handleDownloadWithVersions = async () => {
    if (!currentProject?.files?.length && versions.length === 0) {
      toast.error('Нет данных для архивирования');
      return;
    }
    try {
      const zip = new JSZip();
      const currentFolder = zip.folder('current');
      for (const file of currentProject?.files || []) {
        currentFolder?.file(normalizeZipPath(file.path), file.content || '');
      }

      const versionsFolder = zip.folder('versions');
      for (const version of versions) {
        const versionFolder = versionsFolder?.folder(`v${version.version_number}`);
        const files = version.files || {};
        for (const [path, content] of Object.entries(files)) {
          if (typeof content !== 'string') continue;
          versionFolder?.file(normalizeZipPath(path), content);
        }
        versionFolder?.file(
          '_meta.json',
          JSON.stringify(
            {
              id: version.id,
              version_number: version.version_number,
              message: version.message,
              created_at: version.created_at,
              files_changed: version.files_changed,
              lines_added: version.lines_added,
              lines_removed: version.lines_removed,
            },
            null,
            2
          )
        );
      }

      const safeName = (projectName || 'project').replace(/[^a-zA-Z0-9-_]+/g, '-');
      await downloadZipArchive(zip, `${safeName}-with-history.zip`);
      toast.success('ZIP с историей версий скачан');
    } catch (error) {
      console.error('[ProjectCodePanel] download version zip failed:', error);
      toast.error('Не удалось сформировать ZIP с версиями');
    }
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusBadgeVariant = (status: string) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'active' || normalized === 'completed' || normalized === 'ready') return 'default';
    if (normalized === 'deploying' || normalized === 'pending' || normalized === 'running') return 'secondary';
    if (normalized === 'failed') return 'destructive';
    return 'outline';
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button data-tour="code" variant="outline" size="sm" className="h-9 gap-2 text-xs font-medium">
          <Code2 className="h-4 w-4" />
          Код
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[500px] max-w-[96vw] p-0">
        <SheetHeader className="border-b bg-muted/20 px-4 py-3">
          <SheetTitle>Код проекта</SheetTitle>
          {projectName ? (
            <div className="text-xs text-muted-foreground truncate">{projectName}</div>
          ) : null}
        </SheetHeader>

        <div className="flex items-center gap-2 border-b bg-background/80 px-4 py-3">
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => void handleDownloadCurrentZip()}
          >
            <Download className="h-3.5 w-3.5" />
            Скачать ZIP
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => void handleDownloadWithVersions()}
          >
            <History className="h-3.5 w-3.5" />
            ZIP + версии
          </Button>
        </div>

        <Tabs
          value={mainTab}
          onValueChange={setMainTab}
          className="flex h-[calc(100vh-130px)] flex-col px-4 py-3"
        >
          <TabsList className="grid w-full grid-cols-3 rounded-lg border bg-muted/30 p-1">
            <TabsTrigger value="files">Файлы ({currentProject?.files.length || 0})</TabsTrigger>
            <TabsTrigger value="versions">Версии ({versions.length})</TabsTrigger>
            <TabsTrigger value="backend">Cloud</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-3 flex-1 overflow-hidden">
            <CodeTree
              filePaths={(currentProject?.files || []).map((file) => file.path)}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              expandedFolderIds={expandedFolderIds}
              onExpandedFolderIdsChange={setExpandedFolderIds}
            />
          </TabsContent>

          <TabsContent value="versions" className="mt-3 flex-1 overflow-hidden">
            <VersionTimeline
              versions={versions}
              currentVersionId={versions[0]?.id}
              isLoading={isVersionsLoading}
              onRestore={onRestoreVersion}
            />
          </TabsContent>

          <TabsContent value="backend" className="mt-3 flex-1 overflow-hidden">
            {!projectId ? (
              <div className="rounded-md border p-3 text-xs text-muted-foreground">
                Сначала создай/сохрани проект, затем появится backend-панель.
              </div>
            ) : (
              <div className="flex h-full flex-col gap-3">
                <div className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-medium">User backend (Supabase)</div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-[11px]"
                        onClick={() => void loadBackendInfo()}
                        disabled={backendInfoLoading}
                      >
                        {backendInfoLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        Refresh
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>State:</span>
                    <Badge variant={statusBadgeVariant(backendInfo?.provisionState || 'outline')}>
                      {backendInfo?.provisionState || 'not_loaded'}
                    </Badge>
                    {backendInfo?.supabaseProjectRef ? (
                      <span>ref: {backendInfo.supabaseProjectRef}</span>
                    ) : null}
                  </div>
                  {backendInfo?.supabaseUrl ? (
                    <div className="mt-1 truncate text-[11px] text-muted-foreground">
                      {backendInfo.supabaseUrl}
                    </div>
                  ) : null}
                  {backendInfo?.provisionError ? (
                    <div className="mt-2 text-[11px] text-destructive">{backendInfo.provisionError}</div>
                  ) : null}
                  {backendInfoError ? (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-destructive">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {backendInfoError}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-amber-300/70 bg-amber-50/80 p-2.5 text-[11px] text-amber-900">
                  Cloud lifecycle (migrations/deploy/invoke/rollback) управляется только AI-агентом платформы.
                  В этом разделе доступен только обзор: таблицы, RLS, edge-функции и логи.
                </div>

                <Tabs value={backendTab} onValueChange={setBackendTab} className="flex h-full min-h-0 flex-col">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="database">Database ({backendTables.length})</TabsTrigger>
                    <TabsTrigger value="rls">RLS</TabsTrigger>
                    <TabsTrigger value="edge">Edge ({edgeFunctions.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="database" className="mt-3 flex-1 overflow-hidden">
                    <div className="flex h-full flex-col gap-3">
                      <div className="rounded-md border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-xs font-medium">Runtime tables</div>
                          <div className="text-[10px] text-muted-foreground">
                            source: {backendTablesSource || 'n/a'}
                          </div>
                        </div>
                        {backendTablesError ? (
                          <div className="mb-2 flex items-center gap-1.5 text-[11px] text-destructive">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {backendTablesError}
                          </div>
                        ) : null}
                        {backendTablesLoading ? (
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Загружаю таблицы...
                          </div>
                        ) : backendTables.length === 0 ? (
                          <div className="text-[11px] text-muted-foreground">
                            Таблицы backend пока не обнаружены.
                          </div>
                        ) : (
                          <ScrollArea className="h-[calc(100vh-420px)] rounded-md border">
                            <div className="space-y-1.5 p-2">
                              {backendTables.slice(0, 50).map((table) => (
                                <div key={table.name} className="rounded-md border px-2 py-1.5 text-[11px]">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="truncate font-medium">{table.name}</div>
                                    <div className="flex items-center gap-1">
                                      <Badge
                                        variant={table.runtime?.exists ? 'default' : 'outline'}
                                        className="text-[10px]"
                                      >
                                        {table.runtime?.exists ? 'exists' : 'missing'}
                                      </Badge>
                                      <Badge
                                        variant={table.runtime?.rlsEnabled ? 'default' : 'destructive'}
                                        className="text-[10px]"
                                      >
                                        {table.runtime?.rlsEnabled ? 'rls:on' : 'rls:off'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                                    tenant: {table.tenantColumn} · policies:{' '}
                                    {table.runtime?.policyCount ?? table.policies.length} · columns:{' '}
                                    {table.runtime?.columnCount ?? table.columns.length}
                                  </div>
                                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                                    migration: {table.lastMigrationStatus || 'n/a'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>

                      <MigrationsTab
                        migrations={migrations}
                        migrationsLoading={migrationsLoading}
                        migrationsError={migrationsError}
                        selectedMigrationId={selectedMigrationId}
                        onSelectedMigrationIdChange={setSelectedMigrationId}
                        selectedMigration={selectedMigration}
                        onRefresh={() => void loadMigrations()}
                        statusBadgeVariant={statusBadgeVariant}
                        formatDateTime={formatDateTime}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="rls" className="mt-3 flex-1 overflow-hidden">
                    <div className="rounded-md border p-3">
                      <div className="mb-2 text-xs font-medium">RLS policies (read-only)</div>
                      {backendTables.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground">
                          Нет данных по RLS. Запусти генерацию backend через чат-агента.
                        </div>
                      ) : (
                        <ScrollArea className="h-[calc(100vh-360px)] rounded-md border">
                          <div className="space-y-2 p-2">
                            {backendTables.map((table) => {
                              const policies = table.runtime?.policyNames || table.policies || [];
                              return (
                                <div key={table.name} className="rounded-md border px-2 py-1.5 text-[11px]">
                                  <div className="mb-1 flex items-center justify-between gap-2">
                                    <div className="font-medium">{table.name}</div>
                                    <Badge
                                      variant={table.runtime?.rlsEnabled ? 'default' : 'destructive'}
                                      className="text-[10px]"
                                    >
                                      {table.runtime?.rlsEnabled ? 'RLS enabled' : 'RLS disabled'}
                                    </Badge>
                                  </div>
                                  {policies.length === 0 ? (
                                    <div className="text-[10px] text-muted-foreground">Policy list is empty</div>
                                  ) : (
                                    <div className="space-y-0.5">
                                      {policies.slice(0, 12).map((policy) => (
                                        <div key={`${table.name}:${policy}`} className="text-[10px] text-muted-foreground">
                                          • {policy}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="edge" className="mt-3 flex-1 overflow-hidden">
                    <EdgeFunctionsTab
                      edgeFunctions={edgeFunctions}
                      edgeFunctionsLoading={edgeFunctionsLoading}
                      edgeFunctionsError={edgeFunctionsError}
                      selectedEdgeFunctionId={selectedEdgeFunctionId}
                      onSelectedEdgeFunctionIdChange={setSelectedEdgeFunctionId}
                      selectedEdgeFunction={selectedEdgeFunction}
                      selectedEdgeFunctionSource={selectedEdgeFunctionSource}
                      selectedInvocations={selectedInvocations}
                      selectedDeployJob={selectedDeployJob}
                      selectedDeployJobLogs={selectedDeployJobLogs}
                      edgeInvocationsLoading={edgeInvocationsLoading}
                      edgeDeployJobLoading={edgeDeployJobLoading}
                      onRefreshFunctions={() => void loadEdgeFunctions()}
                      onRefreshSelectedLogs={() => {
                        if (!selectedEdgeFunction) return;
                        void loadEdgeInvocations(selectedEdgeFunction.id);
                        void loadEdgeDeployJobStatus(selectedEdgeFunction);
                      }}
                      statusBadgeVariant={statusBadgeVariant}
                      formatDateTime={formatDateTime}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
