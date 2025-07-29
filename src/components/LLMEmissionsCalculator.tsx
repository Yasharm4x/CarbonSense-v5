import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Leaf, Zap, Globe, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// LLM data with estimated active parameters (in billions)
const LLM_DATA = {
  "gpt-4o": { name: "GPT-4o", params: 175, company: "OpenAI" },
  "claude-3": { name: "Claude 3 Opus", params: 175, company: "Anthropic" },
  "llama-3-70b": { name: "LLaMA 3 70B", params: 70, company: "Meta" },
  "gemini-pro": { name: "Gemini Pro", params: 137, company: "Google" },
  "mixtral-8x7b": { name: "Mixtral 8x7B", params: 47, company: "Mistral" },
  "gpt-3.5-turbo": { name: "GPT-3.5 Turbo", params: 20, company: "OpenAI" },
};

// Region data with carbon intensity (gCO₂/kWh) and PUE estimates
const REGION_DATA = {
  "us-west": { name: "US West Coast", carbonIntensity: 350, pue: 1.2 },
  "us-east": { name: "US East Coast", carbonIntensity: 500, pue: 1.3 },
  "eu-west": { name: "Western Europe", carbonIntensity: 300, pue: 1.15 },
  "asia-pacific": { name: "Asia Pacific", carbonIntensity: 700, pue: 1.4 },
  "global-avg": { name: "Global Average", carbonIntensity: 475, pue: 1.25 },
};

// Contextual equivalences for CO₂ amounts
const getContextualEquivalence = (co2Grams: number) => {
  if (co2Grams < 1) return "< 1 second of breathing";
  if (co2Grams < 5) return `${Math.round(co2Grams * 2)} seconds of phone charging`;
  if (co2Grams < 50) return `${Math.round(co2Grams / 5)} minutes of phone charging`;
  if (co2Grams < 500) return `${Math.round(co2Grams / 100)} meters driving a car`;
  if (co2Grams < 5000) return `${Math.round(co2Grams / 1000)} km driving a car`;
  return `${(co2Grams / 1000).toFixed(1)} kg CO₂ (significant impact)`;
};

export const LLMEmissionsCalculator = () => {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [tokens, setTokens] = useState<number[]>([1000]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const { toast } = useToast();

  const calculateEmissions = useCallback(() => {
    if (!selectedModel || !selectedRegion) return 0;
    
    const model = LLM_DATA[selectedModel as keyof typeof LLM_DATA];
    const region = REGION_DATA[selectedRegion as keyof typeof REGION_DATA];
    
    // Formula: CO₂ (g) = Tokens × Active Params (B) × Energy per Token Estimate × PUE × Carbon Intensity (gCO₂/kWh)
    // Energy per token estimate: 1.5e-6 kWh per billion parameters per token (conservative estimate)
    const energyPerTokenEstimate = 1.5e-6; // kWh per billion params per token
    
    const co2Grams = tokens[0] * model.params * energyPerTokenEstimate * region.pue * region.carbonIntensity;
    
    return co2Grams;
  }, [selectedModel, tokens, selectedRegion]);

  const co2Result = calculateEmissions();
  const contextualResult = getContextualEquivalence(co2Result);

  const copyResult = () => {
    const model = LLM_DATA[selectedModel as keyof typeof LLM_DATA];
    const region = REGION_DATA[selectedRegion as keyof typeof REGION_DATA];
    
    const result = `LLM Emissions: ${co2Result.toFixed(2)}g CO₂
Model: ${model?.name}
Tokens: ${tokens[0].toLocaleString()}
Region: ${region?.name}
Equivalent: ${contextualResult}

Calculated using: lovable.dev/llm-emissions-calculator`;

    navigator.clipboard.writeText(result);
    toast({
      title: "Result copied!",
      description: "Calculation details copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-eco-green-light/20 to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center gap-2 bg-eco-green/10 px-4 py-2 rounded-full">
            <Leaf className="h-5 w-5 text-eco-green" />
            <span className="text-sm font-medium text-eco-green-dark">Carbon Impact Calculator</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-eco-green to-eco-blue bg-clip-text text-transparent">
            LLM Emissions Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Estimate the carbon footprint of running inference on large language models. 
            Make informed decisions about AI usage and environmental impact.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Controls */}
          <div className="space-y-6">
            <Card className="shadow-[var(--shadow-card)] border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Model Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an LLM..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LLM_DATA).map(([key, model]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {model.params}B params
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Token Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Output Tokens</label>
                    <Badge variant="outline">{tokens[0].toLocaleString()}</Badge>
                  </div>
                  <Slider
                    value={tokens}
                    onValueChange={setTokens}
                    max={10000}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10</span>
                    <span>5,000</span>
                    <span>10,000</span>
                  </div>
                </div>

                {/* Region Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Region
                  </label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REGION_DATA).map(([key, region]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center justify-between w-full">
                            <span>{region.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {region.carbonIntensity}g/kWh
                            </Badge>
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
            <Card className="shadow-[var(--shadow-result)] border-eco-green/20 bg-gradient-to-br from-card to-eco-green-light/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-eco-green" />
                  Carbon Footprint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedModel && selectedRegion ? (
                  <>
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold text-eco-green">
                        {co2Result.toFixed(2)}
                      </div>
                      <div className="text-lg text-muted-foreground">grams CO₂</div>
                      <div className="text-sm text-eco-brown bg-eco-green-light/30 px-3 py-1 rounded-full">
                        ≈ {contextualResult}
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Model:</span>
                          <span className="font-medium">{LLM_DATA[selectedModel as keyof typeof LLM_DATA].name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Parameters:</span>
                          <span className="font-medium">{LLM_DATA[selectedModel as keyof typeof LLM_DATA].params}B</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tokens:</span>
                          <span className="font-medium">{tokens[0].toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Region:</span>
                          <span className="font-medium">{REGION_DATA[selectedRegion as keyof typeof REGION_DATA].name}</span>
                        </div>
                      </div>
                    </div>

                    <Button onClick={copyResult} variant="outline" className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Result
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Leaf className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a model and region to see the carbon footprint</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formula Transparency */}
            <Card className="border-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Calculation Formula</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="font-mono bg-muted/50 p-2 rounded text-[10px]">
                    CO₂ (g) = Tokens × Active Params (B) × Energy/Token × PUE × Carbon Intensity
                  </div>
                  <p>Energy estimate: 1.5e-6 kWh per billion parameters per token</p>
                  <p>Based on industry research and datacenter efficiency metrics</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};