import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MODEL_CATEGORIES } from "@/data/models";
import { Brain, Cpu, Zap, Sparkles } from "lucide-react";

interface ModelData {
  name: string;
  params: number;
  company: string;
  energyMultiplier: number;
}

interface ModelSelectorProps {
  selectedCategory: string;
  selectedModel: string;
  onCategoryChange: (category: string) => void;
  onModelChange: (model: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "llm":
      return <Brain className="h-4 w-4" />;
    case "generative":
      return <Sparkles className="h-4 w-4" />;
    case "ml":
      return <Cpu className="h-4 w-4" />;
    case "quantized":
      return <Zap className="h-4 w-4" />;
    default:
      return <Brain className="h-4 w-4" />;
  }
};

export const ModelSelector = ({
  selectedCategory,
  selectedModel,
  onCategoryChange,
  onModelChange,
}: ModelSelectorProps) => {
  const currentModels = selectedCategory
    ? MODEL_CATEGORIES[selectedCategory as keyof typeof MODEL_CATEGORIES]?.models
    : {};

  return (
    <div className="space-y-4">
      {/* Model Category Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Model Category
        </label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            onCategoryChange(value);
            onModelChange(""); // Reset model selection when category changes
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select model category..." />
          </SelectTrigger>
          <SelectContent side="bottom">
            {Object.entries(MODEL_CATEGORIES).map(([key, category]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(key)}
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Specific Model Selection */}
      {selectedCategory && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Specific Model</label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model..." />
            </SelectTrigger>
            <SelectContent side="bottom">
              {Object.entries(currentModels).map(([key, model]) => {
                const modelData = model as ModelData;
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center justify-between w-full">
                      <span>{modelData.name}</span>
                      <div className="flex gap-1 ml-2">
                        <Badge variant="secondary" className="text-xs">
                          {modelData.params >= 1
                            ? `${modelData.params}B`
                            : `${(modelData.params * 1000).toFixed(0)}M`}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {modelData.company}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
