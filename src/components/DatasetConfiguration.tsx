import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DATASET_TYPES, ML_TASKS } from "@/data/models";
import { Database, Target } from "lucide-react";

interface DatasetConfigurationProps {
  selectedDatasetType: string;
  selectedTask: string;
  rows: number;
  columns: number;
  onDatasetTypeChange: (type: string) => void;
  onTaskChange: (task: string) => void;
  onRowsChange: (rows: number) => void;
  onColumnsChange: (columns: number) => void;
}

export const DatasetConfiguration = ({
  selectedDatasetType,
  selectedTask,
  rows,
  columns,
  onDatasetTypeChange,
  onTaskChange,
  onRowsChange,
  onColumnsChange
}: DatasetConfigurationProps) => {
  return (
    <div className="space-y-4">
      {/* Dataset Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Database className="h-4 w-4" />
          Dataset Type
        </label>
        <Select value={selectedDatasetType} onValueChange={onDatasetTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select dataset type..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATASET_TYPES).map(([key, type]) => (
              <SelectItem key={key} value={key}>
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-between flex-wrap gap-1 w-full">
                    <span className="truncate">{type.name}</span>
                    <Badge variant="secondary" className="shrink-0 text-xs px-2 py-0.5">
                      {type.energyMultiplier}x
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-normal break-words">
                    {type.description}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dataset Size */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Rows</label>
          <Input
            type="number"
            value={rows}
            onChange={(e) => onRowsChange(Number(e.target.value) || 0)}
            placeholder="1000"
            min="1"
            max="10000000"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Columns</label>
          <Input
            type="number"
            value={columns}
            onChange={(e) => onColumnsChange(Number(e.target.value) || 0)}
            placeholder="10"
            min="1"
            max="1000"
          />
        </div>
      </div>

      {/* ML Task Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          ML Task
        </label>
        <Select value={selectedTask} onValueChange={onTaskChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select ML task..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ML_TASKS).map(([key, task]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center justify-between flex-wrap gap-1 w-full">
                  <span className="truncate">{task.name}</span>
                  <Badge variant="secondary" className="shrink-0 text-xs px-2 py-0.5">
                    {task.energyMultiplier}x
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dataset Summary */}
      {rows > 0 && columns > 0 && (
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Dataset Size:</span>
              <span className="font-medium">{(rows * columns).toLocaleString()} data points</span>
            </div>
            {selectedDatasetType && (
              <div className="flex justify-between">
                <span>Type Impact:</span>
                <span className="font-medium">{DATASET_TYPES[selectedDatasetType as keyof typeof DATASET_TYPES].energyMultiplier}x energy</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
