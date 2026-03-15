import { Badge } from "@/components/ui/badge";
import { statusLabel, statusColor } from "@/lib/utils";
import type { ToolStatus } from "@/types";

export function ToolStatusBadge({ status }: { status: ToolStatus }) {
  return (
    <Badge
      variant="outline"
      className={statusColor(status)}
    >
      {statusLabel(status)}
    </Badge>
  );
}
