/**
 * Model Selector Component
 *
 * Dropdown for selecting AI models with agent-specific recommendations
 */

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const FREE_MODELS = [
  {
    value: "deepseek/deepseek-chat-v3.1:free",
    label: "DeepSeek Chat v3.1",
    description: "Fast, accurate reasoning for validation tasks",
    recommended: ["validator", "swiss_cheese"]
  },
  {
    value: "qwen/qwen3-235b-a22b:free",
    label: "Qwen 235B",
    description: "Large model with excellent comprehension",
    recommended: ["risk_assessor", "synthesizer"]
  },
  {
    value: "mistralai/mistral-small-3.2-24b-instruct:free",
    label: "Mistral Small 3.2",
    description: "Balanced performance for structured tasks",
    recommended: ["validator", "risk_assessor"]
  },
  {
    value: "google/gemini-2.0-flash-exp:free",
    label: "Gemini 2.0 Flash",
    description: "Fast, reliable performance across all tasks",
    recommended: ["validator", "risk_assessor", "swiss_cheese", "synthesizer"]
  },
  {
    value: "nvidia/nemotron-nano-9b-v2:free",
    label: "Nemotron Nano 9B",
    description: "Efficient model for quick responses",
    recommended: ["validator"]
  },
  {
    value: "z-ai/glm-4.5-air:free",
    label: "GLM 4.5 Air",
    description: "Lightweight model with good reasoning",
    recommended: ["validator", "risk_assessor"]
  },
  {
    value: "moonshotai/kimi-k2:free",
    label: "Kimi K2",
    description: "Advanced reasoning capabilities",
    recommended: ["swiss_cheese", "synthesizer"]
  },
  {
    value: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    label: "Dolphin Mistral 24B",
    description: "Creative problem-solving model",
    recommended: ["swiss_cheese"]
  },
  {
    value: "meta-llama/llama-4-maverick:free",
    label: "Llama 4 Maverick",
    description: "Next-generation reasoning model",
    recommended: ["risk_assessor", "synthesizer"]
  },
  {
    value: "qwen/qwen2.5-vl-32b-instruct:free",
    label: "Qwen VL 32B",
    description: "Vision-language model for complex analysis",
    recommended: ["risk_assessor", "swiss_cheese"]
  },
  {
    value: "google/gemma-3-12b-it:free",
    label: "Gemma 3 12B",
    description: "Instruction-tuned for safety applications",
    recommended: ["validator", "synthesizer"]
  },
  {
    value: "google/gemma-3-27b-it:free",
    label: "Gemma 3 27B",
    description: "Larger Gemma for complex reasoning",
    recommended: ["swiss_cheese", "synthesizer"]
  }
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  agentName: string;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  agentName,
  disabled = false
}) => {
  const selectedModel = FREE_MODELS.find(model => model.value === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#e5e7eb]">
          AI Model
        </label>
        {selectedModel?.recommended.includes(agentName) && (
          <Badge
            variant="secondary"
            className="bg-[#4dd4e8]/20 text-[#4dd4e8] border border-[#4dd4e8]/30 text-xs"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Recommended
          </Badge>
        )}
      </div>

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="bg-[#0a1628] border-[#4dd4e8]/30 text-[#e5e7eb] focus:border-[#4dd4e8] focus:ring-1 focus:ring-[#4dd4e8] transition-colors">
          <SelectValue placeholder="Select a model..." />
        </SelectTrigger>
        <SelectContent className="bg-[#1a2942] border-[#4dd4e8]/20 backdrop-blur-sm">
          {FREE_MODELS.map((model) => {
            const isRecommended = model.recommended.includes(agentName);

            return (
              <SelectItem
                key={model.value}
                value={model.value}
                className="text-[#e5e7eb] hover:bg-[#4dd4e8]/10 focus:bg-[#4dd4e8]/10 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.label}</span>
                      {isRecommended && (
                        <Badge
                          variant="secondary"
                          className="bg-[#4dd4e8]/20 text-[#4dd4e8] border border-[#4dd4e8]/30 text-xs px-1.5 py-0"
                        >
                          ★
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-[#9ca3af] mt-1">
                      {model.description}
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selectedModel && (
        <div className="text-xs text-[#9ca3af] mt-2">
          {selectedModel.description}
        </div>
      )}
    </div>
  );
};