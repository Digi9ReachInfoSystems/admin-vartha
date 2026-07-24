import React from "react";
import { Table } from "antd";
import { DataTableShellRoot } from "./ui.styles";
import EmptyState from "./EmptyState";

/**
 * Visual shell around Ant Design Table — keeps existing columns/data/handlers.
 * Defaults horizontal scroll so wide tables stay inside the card on small screens.
 */
export default function DataTableShell({
  toolbar,
  emptyTitle,
  emptyDescription,
  locale,
  sticky = true,
  scroll,
  ...tableProps
}) {
  const mergedScroll = {
    x: "max-content",
    ...(scroll || {}),
  };

  return (
    <DataTableShellRoot>
      {toolbar ? <div className="dts-toolbar">{toolbar}</div> : null}
      <div className="dts-body">
        <Table
          sticky={sticky}
          size="middle"
          scroll={mergedScroll}
          locale={{
            emptyText: (
              <EmptyState
                title={emptyTitle || "No records found"}
                description={
                  emptyDescription || "Try adjusting filters or add a new item."
                }
              />
            ),
            ...locale,
          }}
          {...tableProps}
        />
      </div>
    </DataTableShellRoot>
  );
}
