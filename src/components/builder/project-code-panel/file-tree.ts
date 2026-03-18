export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  isFile: boolean;
  children: FileTreeNode[];
}

export function normalizeZipPath(path: string): string {
  return path.replace(/^\/+/, "");
}

export function buildFileTree(paths: string[]): FileTreeNode[] {
  const rootMap = new Map<string, FileTreeNode>();

  const ensureNode = (
    map: Map<string, FileTreeNode>,
    name: string,
    path: string,
    isFile: boolean
  ): FileTreeNode => {
    const key = `${isFile ? "f" : "d"}:${path}`;
    const existing = map.get(key);
    if (existing) return existing;
    const created: FileTreeNode = { id: key, name, path, isFile, children: [] };
    map.set(key, created);
    return created;
  };

  for (const rawPath of paths) {
    const normalized = normalizeZipPath(rawPath);
    if (!normalized) continue;
    const parts = normalized.split("/").filter(Boolean);
    let currentMap = rootMap;
    let prefix = "";
    let parent: FileTreeNode | null = null;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      prefix = prefix ? `${prefix}/${part}` : part;
      const node = ensureNode(currentMap, part, prefix, isFile);
      if (parent && !parent.children.some((child) => child.id === node.id)) {
        parent.children.push(node);
      }
      if (!isFile) {
        const nextMap = new Map<string, FileTreeNode>();
        for (const child of node.children) {
          nextMap.set(child.id, child);
        }
        currentMap = nextMap;
      }
      parent = node;
    });
  }

  const roots = Array.from(rootMap.values())
    .filter((node) => !node.path.includes("/"))
    .sort((a, b) => {
      if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

  const sortChildren = (node: FileTreeNode) => {
    node.children.sort((a, b) => {
      if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortChildren);
  };
  roots.forEach(sortChildren);
  return roots;
}

export function filterFileTree(nodes: FileTreeNode[], query: string): FileTreeNode[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return nodes;

  const filterNode = (node: FileTreeNode): FileTreeNode | null => {
    const selfMatch =
      node.name.toLowerCase().includes(needle) || node.path.toLowerCase().includes(needle);
    if (node.isFile) {
      return selfMatch ? { ...node, children: [] } : null;
    }
    const filteredChildren = node.children
      .map((child) => filterNode(child))
      .filter((child): child is FileTreeNode => child !== null);
    if (!selfMatch && filteredChildren.length === 0) return null;
    return { ...node, children: filteredChildren };
  };

  return nodes
    .map((node) => filterNode(node))
    .filter((node): node is FileTreeNode => node !== null);
}

export function collectFolderIds(nodes: FileTreeNode[]): Set<string> {
  const ids = new Set<string>();
  const walk = (node: FileTreeNode) => {
    if (!node.isFile) {
      ids.add(node.id);
      node.children.forEach(walk);
    }
  };
  nodes.forEach(walk);
  return ids;
}
