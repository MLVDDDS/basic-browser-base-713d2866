import { useState } from "react";

export function useProjectCodePanelState() {
  const [isOpen, setIsOpen] = useState(false);
  const [mainTab, setMainTab] = useState("files");
  const [backendTab, setBackendTab] = useState("database");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [selectedEdgeFunctionId, setSelectedEdgeFunctionId] = useState("");
  const [selectedMigrationId, setSelectedMigrationId] = useState("");

  return {
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
  };
}
