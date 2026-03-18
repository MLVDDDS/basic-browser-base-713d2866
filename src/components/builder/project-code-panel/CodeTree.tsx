import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileCode2, Folder, FolderOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  buildFileTree,
  collectFolderIds,
  filterFileTree,
  type FileTreeNode,
} from "@/components/builder/project-code-panel/file-tree";

function TreeNodeRow({
  node,
  depth = 0,
  expandedFolderIds,
  forcedExpandedFolderIds,
  onToggleFolder,
}: {
  node: FileTreeNode;
  depth?: number;
  expandedFolderIds: Set<string>;
  forcedExpandedFolderIds: Set<string>;
  onToggleFolder: (folderId: string) => void;
}) {
  const isFolder = !node.isFile;
  const isExpanded =
    isFolder && (forcedExpandedFolderIds.has(node.id) || expandedFolderIds.has(node.id));
  const leftPadding = depth * 14 + 8;
  const rowClassName = cn(
    "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
    isFolder ? "hover:bg-muted/70" : "hover:bg-muted/50"
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (isFolder) onToggleFolder(node.id);
        }}
        className={rowClassName}
        style={{ paddingLeft: `${leftPadding}px` }}
      >
        {isFolder ? (
          isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="inline-block h-3.5 w-3.5 shrink-0" />
        )}
        {node.isFile ? (
          <FileCode2 className="h-3.5 w-3.5 text-muted-foreground" />
        ) : isExpanded ? (
          <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
        ) : (
          <Folder className="h-3.5 w-3.5 text-amber-500" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isFolder && isExpanded
        ? node.children.map((child) => (
            <TreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedFolderIds={expandedFolderIds}
              forcedExpandedFolderIds={forcedExpandedFolderIds}
              onToggleFolder={onToggleFolder}
            />
          ))
        : null}
    </div>
  );
}

interface CodeTreeProps {
  filePaths: string[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  expandedFolderIds: Set<string>;
  onExpandedFolderIdsChange: (next: Set<string>) => void;
}

export function CodeTree({
  filePaths,
  searchQuery,
  onSearchQueryChange,
  expandedFolderIds,
  onExpandedFolderIdsChange,
}: CodeTreeProps) {
  const [mode, setMode] = useState<"files" | "search">("files");
  const fileTree = useMemo(() => buildFileTree(filePaths), [filePaths]);
  const filteredTree = useMemo(
    () => filterFileTree(fileTree, searchQuery),
    [fileTree, searchQuery]
  );
  const forcedExpandedFolderIds = useMemo(
    () =>
      mode === "search" && searchQuery.trim()
        ? collectFolderIds(filteredTree)
        : new Set<string>(),
    [filteredTree, mode, searchQuery]
  );
  const treeForRender = mode === "search" ? filteredTree : fileTree;

  const handleToggleFolder = (folderId: string) => {
    const next = new Set(expandedFolderIds);
    if (next.has(folderId)) {
      next.delete(folderId);
    } else {
      next.add(folderId);
    }
    onExpandedFolderIdsChange(next);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 space-y-2">
        <div className="grid grid-cols-2 gap-1 rounded-lg border bg-muted/30 p-1">
          <Button
            type="button"
            variant={mode === "files" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 justify-start gap-2 text-xs"
            onClick={() => setMode("files")}
          >
            <Folder className="h-3.5 w-3.5" />
            Files
          </Button>
          <Button
            type="button"
            variant={mode === "search" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 justify-start gap-2 text-xs"
            onClick={() => setMode("search")}
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </Button>
        </div>
        {mode === "search" ? (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search files"
              className="h-9 pl-8 text-xs"
            />
          </div>
        ) : null}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filePaths.length} файлов</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => onExpandedFolderIdsChange(collectFolderIds(fileTree))}
              type="button"
            >
              Развернуть все
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => onExpandedFolderIdsChange(new Set<string>())}
              type="button"
            >
              Свернуть
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 rounded-md border">
        <div className="p-2 pb-4">
          {treeForRender.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground">Файлы пока не созданы</div>
          ) : (
            treeForRender.map((node) => (
              <TreeNodeRow
                key={node.id}
                node={node}
                expandedFolderIds={expandedFolderIds}
                forcedExpandedFolderIds={forcedExpandedFolderIds}
                onToggleFolder={handleToggleFolder}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
