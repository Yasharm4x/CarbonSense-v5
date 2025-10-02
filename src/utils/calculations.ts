import {
  MODEL_CATEGORIES,
  DATASET_TYPES,
  ML_TASKS,
  REGION_DATA,
  HARDWARE_TYPES
} from "@/data/models";

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
  selectedHardware: string;
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
  selectedHardware,
  rows,
  columns,
  tokens
}: CalculationParams): number => {
  if (!selectedCategory || !selectedModel || !selectedRegion || !selectedHardware) return 0;

  const categoryData = MODEL_CATEGORIES[selectedCategory as keyof typeof MODEL_CATEGORIES];
  const modelRaw = categoryData?.models[selectedModel as keyof typeof categoryData.models];
  const model = modelRaw as ModelData;
  const region = REGION_DATA[selectedRegion as keyof typeof REGION_DATA];
  const hardware = HARDWARE_TYPES[selectedHardware as keyof typeof HARDWARE_TYPES];

  if (!model || !region || !hardware) return 0;

  const hardwareFactor = hardware.powerKW * hardware.utilization;

  let baseEnergy = 0;

  if (selectedCategory === 'llm') {
    const energyPerTokenEstimate = 2.2e-8; // (kWh per billion param per token)
    const safeTokens = tokens ?? 0;

    console.log("🔢 Tokens:", safeTokens);
    console.log("📦 Model Params (B):", model.params);
    console.log("⚡ Energy/Token Estimate:", energyPerTokenEstimate);
    console.log("🧠 Hardware Factor:", hardwareFactor);

    baseEnergy = safeTokens * model.params * energyPerTokenEstimate * hardwareFactor;
  } else {
    const dataPoints = rows * columns;
    const energyPerDataPoint = model.params * 2e-9;

    console.log("🔢 Data Points:", dataPoints);
    console.log("📦 Model Params:", model.params);
    console.log("⚡ Energy/Data Point:", energyPerDataPoint);
    console.log("🧠 Hardware Factor:", hardwareFactor);

    baseEnergy = dataPoints * energyPerDataPoint * hardwareFactor;
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

  const co2Grams = totalEnergy * region.pue * region.carbonIntensity;

  console.log("⚡ Total Energy (kWh):", totalEnergy.toFixed(6));
  console.log("🌍 CO2 Grams:", co2Grams.toFixed(2));

  return co2Grams;
};

// === Tree & Green Score Helpers ===

const TREE_KG_PER_YEAR = 22; // one mature tree absorbs ~22 kg CO2 per year

export const getContextualEquivalence = (co2Grams: number): string => {
  // Decide whether to show grams or kilograms
  const displayValue = co2Grams >= 1000 ? (co2Grams / 1000).toFixed(1) : co2Grams.toFixed(1);
  const unit = co2Grams >= 1000 ? "kg CO₂" : "g CO₂";

  // Base contextual equivalence
  let baseMessage: string;

  if (co2Grams < 1) {
    baseMessage = "< 1 second of breathing";
  } else if (co2Grams < 5) {
    baseMessage = `${Math.round(co2Grams * 2)} seconds of phone charging`;
  } else if (co2Grams < 50) {
    baseMessage = `${Math.round(co2Grams / 5)} minutes of phone charging`;
  } else if (co2Grams < 500) {
    baseMessage = `${Math.round(co2Grams / 100)} meters driving a car`;
  } else if (co2Grams < 5000) {
    baseMessage = `${Math.round(co2Grams / 1000)} km driving a car`;
  } else {
    // now uses kg display for high values
    baseMessage = `${displayValue} ${unit} (significant impact)`;
  }

  // Trees needed (always based on kg)
  const rawTrees = co2Grams / 1000 / TREE_KG_PER_YEAR;
  let treesStr: string;

  if (rawTrees < 1) {
    treesStr = `${rawTrees.toFixed(2)} tree${rawTrees >= 1 ? "s" : ""}`;
  } else {
    const treesRounded = Math.ceil(rawTrees);
    treesStr = `${treesRounded} tree${treesRounded > 1 ? "s" : ""}`;
  }

  // Combine both messages
  return `${baseMessage} • ≈${treesStr} need to be planted to offset this ${unit} emission (1 tree offsets ~${TREE_KG_PER_YEAR} kg/year).`;
};

// === New Green Score Helper ===

// default threshold & penalty (can be overridden from UI)
const DEFAULT_E0 = 0.001; // kWh per inference
const DEFAULT_BETA = 0.5;

export const calculateGreenScore = (
  co2Grams: number,
  performance: number, // 0–1
  ci: number, // region.carbonIntensity
  pue: number, // region.pue
  e0: number = DEFAULT_E0,
  beta: number = DEFAULT_BETA,
  blend: 'multiplicative' | 'harmonic' = 'multiplicative'
): number => {
  // recover energy in kWh/inference
  const energyKWh = co2Grams / 1000 / (ci * pue);
  const gE = energyKWh <= e0 ? 1 : Math.exp(-beta * (energyKWh - e0));
  return blend === 'harmonic'
    ? 2 / (1 / performance + 1 / gE)
    : performance * gE;
};
