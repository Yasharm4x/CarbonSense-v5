import { MODEL_CATEGORIES, DATASET_TYPES, ML_TASKS, REGION_DATA } from "@/data/models";

interface ModelData {
  name: string;
  params: number; // in billions, e.g. 175 for GPT-4
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
  tokens
}: CalculationParams): number => {
  if (!selectedCategory || !selectedModel || !selectedRegion) return 0;

  const categoryData = MODEL_CATEGORIES[selectedCategory as keyof typeof MODEL_CATEGORIES];
  const modelRaw = categoryData?.models[selectedModel as keyof typeof categoryData.models];
  const model = modelRaw as ModelData;
  const region = REGION_DATA[selectedRegion as keyof typeof REGION_DATA];

  if (!model || !region) return 0;

  let baseEnergy = 0;

  if (selectedCategory === 'llm') {
    const energyPerTokenEstimate = 2.2e-8; // 🔍 Accurate LLM energy (kWh per billion param per token)

    const safeTokens = tokens ?? 0;

    // ✅ Log for debugging
    console.log("🔢 Tokens:", safeTokens);
    console.log("📦 Model Params (B):", model.params);
    console.log("⚡ Energy/Token Estimate:", energyPerTokenEstimate);

    baseEnergy = safeTokens * model.params * energyPerTokenEstimate;
  } else {
    const dataPoints = rows * columns;
    const energyPerDataPoint = model.params * 2e-9;
    baseEnergy = dataPoints * energyPerDataPoint;
  }

  let totalEnergy = baseEnergy * model.energyMultiplier;

  if (selectedCategory !== 'llm') {
    if (selectedDatasetType && DATASET_TYPES[selectedDatasetType as keyof typeof DATASET_TYPES]) {
      totalEnergy *= DATASET_TYPES[selectedDatasetType as keyof typeof DATASET_TYPES].energyMultiplier;
    }

    if (selectedTask && ML_TASKS[selectedTask as keyof typeof ML_TASKS]) {
      totalEnergy *= ML_TASKS[selectedTask as keyof typeof ML_TASKS].energyMultiplier;
    }
  }

  // Final CO₂ (g) = kWh × PUE × Carbon Intensity
  const co2Grams = totalEnergy * region.pue * region.carbonIntensity;

  // ✅ Log final result
  console.log("⚡ Total Energy (kWh):", totalEnergy.toFixed(6));
  console.log("🌍 CO2 Grams:", co2Grams.toFixed(2));

  return co2Grams;
};

// 🌍 Contextual equivalence display
export const getContextualEquivalence = (co2Grams: number): string => {
  if (co2Grams < 1) return "< 1 second of breathing";
  if (co2Grams < 5) return `${Math.round(co2Grams * 2)} seconds of phone charging`;
  if (co2Grams < 50) return `${Math.round(co2Grams / 5)} minutes of phone charging`;
  if (co2Grams < 500) return `${Math.round(co2Grams / 100)} meters driving a car`;
  if (co2Grams < 5000) return `${Math.round(co2Grams / 1000)} km driving a car`;
  return `${(co2Grams / 1000).toFixed(1)} kg CO₂ (significant impact)`;
};
