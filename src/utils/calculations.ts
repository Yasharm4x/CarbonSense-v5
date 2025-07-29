import { MODEL_CATEGORIES, DATASET_TYPES, ML_TASKS, REGION_DATA } from "@/data/models";

interface ModelData {
  name: string;
  params: number;
  company: string;
  energyMultiplier: number;
}

interface CalculationParams {
  selectedCategory: string;
  selectedModel: string;
  selectedDatasetType: string;
  selectedTask: string;
  selectedRegion: string;
  rows: number;
  columns: number;
  tokens?: number; // For LLM-specific calculations
}

export const calculateEmissions = ({
  selectedCategory,
  selectedModel,
  selectedDatasetType,
  selectedTask,
  selectedRegion,
  rows,
  columns,
  tokens = 1000
}: CalculationParams): number => {
  if (!selectedCategory || !selectedModel || !selectedRegion) return 0;
  
  const categoryData = MODEL_CATEGORIES[selectedCategory as keyof typeof MODEL_CATEGORIES];
  const modelRaw = categoryData?.models[selectedModel as keyof typeof categoryData.models];
  const model = modelRaw as ModelData;
  const region = REGION_DATA[selectedRegion as keyof typeof REGION_DATA];
  
  if (!model || !region) return 0;

  // Base energy calculation varies by model category
  let baseEnergy = 0;
  
  if (selectedCategory === 'llm') {
    // For LLMs: energy per token calculation
    const energyPerTokenEstimate = 1.5e-6; // kWh per billion params per token
    baseEnergy = tokens * model.params * energyPerTokenEstimate;
  } else {
    // For other models: energy based on dataset size and model complexity
    const dataPoints = rows * columns;
    const energyPerDataPoint = model.params * 2e-9; // kWh per billion params per data point
    baseEnergy = dataPoints * energyPerDataPoint;
  }

  // Apply multipliers
  let totalEnergy = baseEnergy * model.energyMultiplier;
  
  if (selectedDatasetType && DATASET_TYPES[selectedDatasetType as keyof typeof DATASET_TYPES]) {
    totalEnergy *= DATASET_TYPES[selectedDatasetType as keyof typeof DATASET_TYPES].energyMultiplier;
  }
  
  if (selectedTask && ML_TASKS[selectedTask as keyof typeof ML_TASKS]) {
    totalEnergy *= ML_TASKS[selectedTask as keyof typeof ML_TASKS].energyMultiplier;
  }

  // Convert to CO₂ emissions
  const co2Grams = totalEnergy * region.pue * region.carbonIntensity;
  
  return co2Grams;
};

// Contextual equivalences for CO₂ amounts
export const getContextualEquivalence = (co2Grams: number): string => {
  if (co2Grams < 1) return "< 1 second of breathing";
  if (co2Grams < 5) return `${Math.round(co2Grams * 2)} seconds of phone charging`;
  if (co2Grams < 50) return `${Math.round(co2Grams / 5)} minutes of phone charging`;
  if (co2Grams < 500) return `${Math.round(co2Grams / 100)} meters driving a car`;
  if (co2Grams < 5000) return `${Math.round(co2Grams / 1000)} km driving a car`;
  return `${(co2Grams / 1000).toFixed(1)} kg CO₂ (significant impact)`;
};