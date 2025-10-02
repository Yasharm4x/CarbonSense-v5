import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Leaf, Zap, Globe, Calculator, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModelSelector } from "@/components/ModelSelector";
import { DatasetConfiguration } from "@/components/DatasetConfiguration";
import { calculateEmissions, getContextualEquivalence } from "@/utils/calculations";
import {
  MODEL_CATEGORIES,
  REGION_DATA,
  HARDWARE_TYPES
} from "@/data/models";

export const MLEmissionsCalculator = () => {

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedDatasetType, setSelectedDatasetType] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedHardware, setSelectedHardware] = useState<string>("gpu");
  const [rows, setRows] = useState<number>(1000);
  const [columns, setColumns] = useState<number>(10);
  const [tokens, setTokens] = useState<number>(1000);

  const { toast } = useToast();

  const co2Result = calculateEmissions({
    selectedCategory,
    selectedModel,
    selectedDatasetType,
    selectedTask,
    selectedRegion,
    selectedHardware,
    rows,
    columns,
    tokens
  });

  const contextualResult = getContextualEquivalence(co2Result);
  const isLLMCategory = selectedCategory === "llm";
  const isConfigurationComplete = selectedCategory && selectedModel && selectedRegion;

  const copyResult = () => {
    const categoryData = MODEL_CATEGORIES[selectedCategory as keyof typeof MODEL_CATEGORIES];
    const modelData = categoryData?.models[selectedModel as keyof typeof categoryData.models] as any;
    const region = REGION_DATA[selectedRegion as keyof typeof REGION_DATA];
    const hardware = HARDWARE_TYPES[selectedHardware as keyof typeof HARDWARE_TYPES];

    const result = `ML Model Emissions: ${co2Result.toFixed(2)}g CO₂
Model: ${modelData?.name}
Category: ${categoryData?.name}
${isLLMCategory ? `Tokens: ${tokens.toLocaleString()}` : `Dataset: ${rows.toLocaleString()} × ${columns} = ${(rows * columns).toLocaleString()} data points`}
${selectedTask ? `Task: ${selectedTask}` : ""}
${selectedDatasetType ? `Data Type: ${selectedDatasetType}` : ""}
Region: ${region?.name}
Hardware: ${hardware?.name}
Equivalent: ${contextualResult}`;

    navigator.clipboard.writeText(result);
    toast({
      title: "Result copied!",
      description: "Calculation details copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-eco-green-light/20 to-muted p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center gap-2 bg-eco-green/10 px-4 py-2 rounded-full">
            <Leaf className="h-5 w-5 text-eco-green" />
            <span className="text-sm font-medium text-eco-green-dark">Carbon Sense</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-eco-green to-eco-blue bg-clip-text text-transparent">
            Carbon Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Estimate the carbon footprint of machine learning models across various tasks, datasets, and hardware.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Model Selector */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Model Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ModelSelector
                  selectedCategory={selectedCategory}
                  selectedModel={selectedModel}
                  onCategoryChange={setSelectedCategory}
                  onModelChange={setSelectedModel}
                />
              </CardContent>
            </Card>
          </div>

          {/* Dataset/Token/Hardware Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  {isLLMCategory ? "Token Configuration" : "Dataset & Task"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLLMCategory ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Output Tokens</label>
                      <Badge variant="outline">{tokens.toLocaleString()}</Badge>
                    </div>
                    {/* replaced slider with number input */}
                    <input
                      type="number"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      min={0}
                      step={10}
                      value={tokens}
                      onChange={(e) => setTokens(Number(e.target.value))}
                    />
                  </div>
                ) : (
                  <DatasetConfiguration
                    selectedDatasetType={selectedDatasetType}
                    selectedTask={selectedTask}
                    rows={rows}
                    columns={columns}
                    onDatasetTypeChange={setSelectedDatasetType}
                    onTaskChange={setSelectedTask}
                    onRowsChange={setRows}
                    onColumnsChange={setColumns}
                  />
                )}

                {/* Region */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Region
                  </label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REGION_DATA).map(([key, region]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex justify-between w-full">
                            <span>{region.name}</span>
                            <Badge variant="secondary">{region.carbonIntensity}g/kWh</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hardware */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Hardware
                  </label>
                  <Select value={selectedHardware} onValueChange={setSelectedHardware}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hardware..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(HARDWARE_TYPES).map(([key, hw]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center justify-between w-full">
                            <span className="pr-2">{hw.name}</span>
                            <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1 whitespace-nowrap">
                              <span>{hw.powerKW}</span>
                              <span>kW</span>
                              <span>×</span>
                              <span>{Math.round(hw.utilization * 100)}%</span>
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-eco-green" />
                  Carbon Footprint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isConfigurationComplete ? (
                  <>
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold text-eco-green">
                        {co2Result.toFixed(2)}
                      </div>
                      <div className="text-lg text-muted-foreground">grams CO₂</div>
                      <div className="text-sm bg-eco-green-light/30 px-3 py-1 rounded-full">
                        ≈ {contextualResult}
                      </div>
                    </div>
                    <div className="border-t pt-4 text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-medium">{MODEL_CATEGORIES[selectedCategory]?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Model:</span>
                        <span className="font-medium">{MODEL_CATEGORIES[selectedCategory]?.models[selectedModel]?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hardware:</span>
                        <span className="font-medium">{HARDWARE_TYPES[selectedHardware]?.name}</span>
                      </div>
                      {isLLMCategory ? (
                        <div className="flex justify-between">
                          <span>Tokens:</span>
                          <span className="font-medium">{tokens.toLocaleString()}</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Data Points:</span>
                            <span className="font-medium">{(rows * columns).toLocaleString()}</span>
                          </div>
                          {selectedTask && (
                            <div className="flex justify-between">
                              <span>Task:</span>
                              <span className="font-medium">{selectedTask}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex justify-between">
                        <span>Region:</span>
                        <span className="font-medium">{REGION_DATA[selectedRegion]?.name}</span>
                      </div>
                    </div>
                    <Button onClick={copyResult} variant="outline" className="w-full">
                      <Copy className="h-4 w-4 mr-2" /> Copy Result
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Leaf className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a model, region, and hardware to estimate emissions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Calculation Formula</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="font-mono bg-muted/50 p-2 rounded text-[10px]">
                    {isLLMCategory
                      ? "CO₂ (g) = Tokens × Params × Energy/Token × Hardware × PUE × Carbon Intensity"
                      : "CO₂ (g) = Data Points × Params × Hardware × Task × Dataset × PUE × Carbon Intensity"}
                  </div>
                  <p>Includes hardware power × utilization, regional carbon intensity, and PUE</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
