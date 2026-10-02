"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, Check, Folder, File, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
}

interface TreeViewProps {
  data: TreeNode[];
  selectable?: boolean;
  onSelect?: (id: string) => void;
  selectedIds?: string[];
}

export function TreeView({ data, selectable = false, onSelect, selectedIds = [] }: TreeViewProps) {
  return (
    <div className="w-full">
      <ul className="flex flex-col gap-1 w-full">
        {data.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            selectable={selectable}
            onSelect={onSelect}
            selectedIds={selectedIds}
            level={0}
          />
        ))}
      </ul>
    </div>
  );
}

function TreeItem({
  node,
  selectable,
  onSelect,
  selectedIds,
  level,
}: {
  node: TreeNode;
  selectable: boolean;
  onSelect?: (id: string) => void;
  selectedIds: string[];
  level: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSelected = selectedIds.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) setExpanded(!expanded);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectable && onSelect) onSelect(node.id);
  };

  return (
    <li className="w-full select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/30 cursor-pointer transition-colors w-full text-sm",
          isSelected ? "bg-muted text-secondary font-medium" : "text-foreground"
        )}
        style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
        onClick={selectable ? handleSelect : handleToggle}
      >
        <button
          className={cn("p-0.5 rounded-sm hover:bg-black/5 dark:hover:bg-white/10 shrink-0", !hasChildren && "invisible")}
          onClick={handleToggle}
          type="button"
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        {selectable && (
          <Checkbox
            variant="secondary"
            checked={isSelected}
            tabIndex={-1}
            className="pointer-events-none"
          />
        )}

        {node.icon && <span className="shrink-0 text-muted-foreground">{node.icon}</span>}
        <span className="truncate flex-1">{node.label}</span>
      </div>

      {
        hasChildren && expanded && (
          <ul className="flex flex-col gap-1 w-full mt-1">
            {node.children!.map((child) => (
              <TreeItem
                key={child.id}
                node={child}
                selectable={selectable}
                onSelect={onSelect}
                selectedIds={selectedIds}
                level={level + 1}
              />
            ))}
          </ul>
        )
      }
    </li >
  );
}

