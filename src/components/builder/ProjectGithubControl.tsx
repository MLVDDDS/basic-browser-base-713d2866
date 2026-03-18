import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  GitBranch,
  Github,
  Link2,
  Loader2,
  Settings2,
  Unlink2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  disconnectProjectGithub,
  enqueueProjectGithubSyncRun,
  fetchProjectGithubSyncRuns,
  fetchProjectGithubStatus,
  linkProjectGithub,
  startGithubOauth,
  type ProjectGithubLink,
  type ProjectGithubSyncRun,
} from "@/features/builder/api/project-github-api";

interface ProjectGithubControlProps {
  projectId?: string;
  projectName?: string;
}

const EMPTY_LINK: ProjectGithubLink = {
  linked: false,
  repoOwner: null,
  repoName: null,
  branch: null,
  repoUrl: null,
  connectedAt: null,
  updatedAt: null,
};

function normalizeInput(value: string): string {
  return value.trim();
}

function githubFieldValue(value: string | null): string {
  return typeof value === "string" ? value : "";
}

export function ProjectGithubControl({ projectId, projectName }: ProjectGithubControlProps) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<ProjectGithubLink>(EMPTY_LINK);
  const [account, setAccount] = useState<{
    connected: boolean;
    login: string | null;
    githubUserId: number | null;
    scope: string | null;
  } | null>(null);
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [branch, setBranch] = useState("main");
  const [syncRuns, setSyncRuns] = useState<ProjectGithubSyncRun[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncDirection, setSyncDirection] = useState<"push" | "pull" | null>(null);

  const linkedRepoPath = useMemo(() => {
    if (!status.repoOwner || !status.repoName) return "";
    return `${status.repoOwner}/${status.repoName}`;
  }, [status.repoName, status.repoOwner]);

  const linkedRepoUrl = useMemo(() => {
    if (status.repoUrl) return status.repoUrl;
    if (!linkedRepoPath) return "";
    return `https://github.com/${linkedRepoPath}`;
  }, [linkedRepoPath, status.repoUrl]);

  const loadStatus = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const response = await fetchProjectGithubStatus(projectId);
      const github = response?.github || EMPTY_LINK;
      setStatus(github);
      setAccount(response?.account || null);
      setRepoOwner(githubFieldValue(github.repoOwner));
      setRepoName(githubFieldValue(github.repoName));
      setBranch(githubFieldValue(github.branch) || "main");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "failed_to_load_github_status";
      toast.error(`GitHub status: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadSyncRuns = useCallback(async () => {
    if (!projectId) return;
    setSyncLoading(true);
    try {
      const response = await fetchProjectGithubSyncRuns(projectId, 8);
      setSyncRuns(Array.isArray(response?.runs) ? response.runs : []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "failed_to_load_github_sync_runs";
      toast.error(`GitHub sync: ${message}`);
    } finally {
      setSyncLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!open || !projectId) return;
    void loadStatus();
    void loadSyncRuns();
  }, [loadStatus, loadSyncRuns, open, projectId]);

  useEffect(() => {
    if (!settingsOpen || !projectId) return;
    void loadStatus();
    void loadSyncRuns();
  }, [loadStatus, loadSyncRuns, projectId, settingsOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const authStatus = url.searchParams.get("github_auth");
    if (!authStatus) return;
    const githubLogin = url.searchParams.get("github_login");
    const githubError = url.searchParams.get("github_error");
    if (authStatus === "success") {
      toast.success(
        githubLogin ? `GitHub account connected: @${githubLogin}` : "GitHub account connected"
      );
      if (projectId) {
        void loadStatus();
        void loadSyncRuns();
      }
    } else {
      toast.error(githubError || "GitHub OAuth failed");
    }
    url.searchParams.delete("github_auth");
    url.searchParams.delete("github_login");
    url.searchParams.delete("github_error");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [loadStatus, loadSyncRuns, projectId]);

  const handleConnect = useCallback(async () => {
    if (!projectId) {
      toast.error("Сначала сохрани проект");
      return;
    }
    const owner = normalizeInput(repoOwner);
    const repo = normalizeInput(repoName);
    const branchName = normalizeInput(branch) || "main";
    if (!owner || !repo) {
      toast.error("Укажи owner и repository");
      return;
    }
    setSaving(true);
    try {
      const response = await linkProjectGithub(projectId, {
        repoOwner: owner,
        repoName: repo,
        branch: branchName,
      });
      const github = response?.github || EMPTY_LINK;
      setStatus(github);
      setAccount(response?.account || null);
      setRepoOwner(githubFieldValue(github.repoOwner));
      setRepoName(githubFieldValue(github.repoName));
      setBranch(githubFieldValue(github.branch) || "main");
      void loadSyncRuns();
      toast.success("GitHub репозиторий подключен");
    } catch (error) {
      const message = error instanceof Error ? error.message : "github_link_failed";
      toast.error(`Connect failed: ${message}`);
    } finally {
      setSaving(false);
    }
  }, [branch, loadSyncRuns, projectId, repoName, repoOwner]);

  const handleDisconnect = useCallback(async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      const response = await disconnectProjectGithub(projectId);
      setStatus(response?.github || EMPTY_LINK);
      setAccount(response?.account || null);
      setSyncRuns([]);
      toast.success("GitHub отключен от проекта");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "github_disconnect_failed";
      toast.error(`Disconnect failed: ${message}`);
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const handleEnqueueSync = useCallback(
    async (direction: "push" | "pull") => {
      if (!projectId) return;
      setSyncDirection(direction);
      try {
        const response = await enqueueProjectGithubSyncRun(projectId, direction);
        if (response?.run) {
          setSyncRuns((current) => [response.run, ...current].slice(0, 8));
        }
        toast.success(`GitHub ${direction} sync queued`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "github_sync_enqueue_failed";
        toast.error(`GitHub sync: ${message}`);
      } finally {
        setSyncDirection(null);
      }
    },
    [projectId]
  );

  const handleConnectAccount = useCallback(async () => {
    if (!projectId) {
      toast.error("Сначала сохрани проект");
      return;
    }
    try {
      const response = await startGithubOauth({
        projectId,
        returnPath: `/builder/${projectId}`,
      });
      if (!response?.authorizeUrl) {
        toast.error("OAuth URL не получен");
        return;
      }
      window.location.href = response.authorizeUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "github_oauth_start_failed";
      toast.error(`GitHub OAuth: ${message}`);
    }
  }, [projectId]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            title="GitHub"
            data-tour="github"
          >
            <Github className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[360px] space-y-3 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">GitHub</div>
            <Badge variant={status.linked ? "default" : "secondary"}>
              {status.linked ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {!projectId ? (
            <div className="rounded-md border p-2.5 text-xs text-muted-foreground">
              Сначала сохрани проект, затем подключай GitHub.
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 rounded-md border p-2.5 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Загружаю статус...
            </div>
          ) : status.linked ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border bg-muted/20 px-2.5 py-1.5 text-[11px]">
                <span className="text-muted-foreground">Account</span>
                <Badge variant={account?.connected ? "default" : "secondary"}>
                  {account?.connected ? account.login || "connected" : "not connected"}
                </Badge>
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border bg-muted/30 px-2.5 py-2 text-left text-xs hover:bg-muted/50"
                onClick={() => {
                  if (!linkedRepoUrl) return;
                  window.open(linkedRepoUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <span className="font-medium">{linkedRepoPath}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <GitBranch className="h-3.5 w-3.5" />
                {status.branch || "main"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 flex-1 gap-1.5 text-xs"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Configure
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => void handleDisconnect()}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Unlink2 className="h-3.5 w-3.5" />
                  )}
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-md border bg-muted/20 px-2.5 py-1.5 text-[11px]">
                <span className="text-muted-foreground">GitHub account</span>
                <Badge variant={account?.connected ? "default" : "secondary"}>
                  {account?.connected ? account.login || "connected" : "not connected"}
                </Badge>
              </div>
              {!account?.connected ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 w-full gap-1.5 text-xs"
                  onClick={() => void handleConnectAccount()}
                >
                  <Github className="h-3.5 w-3.5" />
                  Connect account (OAuth)
                </Button>
              ) : null}
              <div className="text-xs text-muted-foreground">
                Подключи GitHub репозиторий к этому проекту.
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="github-owner" className="text-[11px]">
                    Owner
                  </Label>
                  <Input
                    id="github-owner"
                    value={repoOwner}
                    onChange={(event) => setRepoOwner(event.target.value)}
                    placeholder="Rag-hubk"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="github-repo" className="text-[11px]">
                    Repository
                  </Label>
                  <Input
                    id="github-repo"
                    value={repoName}
                    onChange={(event) => setRepoName(event.target.value)}
                    placeholder="my-project"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="github-branch" className="text-[11px]">
                  Branch
                </Label>
                <Input
                  id="github-branch"
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  placeholder="main"
                  className="h-8 text-xs"
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="h-8 w-full gap-1.5 text-xs"
                onClick={() => void handleConnect()}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Link2 className="h-3.5 w-3.5" />
                )}
                Connect
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right" className="w-[460px] max-w-[95vw]">
          <SheetHeader>
            <SheetTitle>GitHub</SheetTitle>
          </SheetHeader>
          <div className="mt-5 space-y-4">
            <div className="rounded-md border p-3">
              <div className="mb-1.5 text-sm font-medium">{projectName || "Project"}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant={status.linked ? "default" : "secondary"}>
                  {status.linked ? "Connected" : "Disconnected"}
                </Badge>
                <Badge variant={account?.connected ? "default" : "secondary"}>
                  {account?.connected ? `@${account.login || "github"}` : "OAuth not connected"}
                </Badge>
                {status.branch ? (
                  <span className="inline-flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {status.branch}
                  </span>
                ) : null}
              </div>
            </div>

            {status.linked ? (
              <div className="space-y-3 rounded-md border p-3">
                <div className="text-sm font-medium">Clone</div>
                <div className="space-y-1.5 text-xs">
                  <Label className="text-[11px]">HTTPS</Label>
                  <Input
                    readOnly
                    value={linkedRepoPath ? `https://github.com/${linkedRepoPath}.git` : ""}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5 text-xs">
                  <Label className="text-[11px]">SSH</Label>
                  <Input
                    readOnly
                    value={linkedRepoPath ? `git@github.com:${linkedRepoPath}.git` : ""}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => {
                      if (!linkedRepoUrl) return;
                      window.open(linkedRepoUrl, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => void handleDisconnect()}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Unlink2 className="h-3.5 w-3.5" />
                    )}
                    Disconnect
                  </Button>
                </div>
                <div className="space-y-2 rounded-md border bg-muted/20 p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium">Sync</div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px]"
                        onClick={() => void handleEnqueueSync("pull")}
                        disabled={syncDirection !== null}
                      >
                        {syncDirection === "pull" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : null}
                        Pull
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px]"
                        onClick={() => void handleEnqueueSync("push")}
                        disabled={syncDirection !== null}
                      >
                        {syncDirection === "push" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : null}
                        Push
                      </Button>
                    </div>
                  </div>
                  {syncLoading ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading sync runs...
                    </div>
                  ) : syncRuns.length > 0 ? (
                    <div className="space-y-1">
                      {syncRuns.slice(0, 4).map((run) => (
                        <div
                          key={run.id}
                          className="flex items-center justify-between rounded border bg-background px-2 py-1 text-[11px]"
                        >
                          <span>
                            {run.direction} · {run.status}
                          </span>
                          <span className="text-muted-foreground">
                            {run.createdAt ? new Date(run.createdAt).toLocaleTimeString() : "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted-foreground">
                      No sync runs yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-md border p-3 text-xs text-muted-foreground">
                Проект еще не связан с GitHub репозиторием.
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
