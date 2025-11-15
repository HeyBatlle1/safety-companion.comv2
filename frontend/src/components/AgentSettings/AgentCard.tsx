/**
 * Agent Card Component
 *
 * Individual agent configuration card with controls and status
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Bot,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings2,
  Gauge,
  Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ModelSelector } from './ModelSelector';
import { AgentTestPanel } from './AgentTestPanel';
import type { AgentConfiguration } from '@/services/agentConfigApi';

interface AgentCardProps {
  config: AgentConfiguration;
  onUpdate: (config: AgentConfiguration) => void;
  onTest: (agentName: string) => void;
  isUpdating?: boolean;
}

const AGENT_INFO = {
  validator: {
    title: 'Data Validator',
    description: 'Validates JHA data quality and completeness',
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/30'
  },
  risk_assessor: {
    title: 'Risk Assessor',
    description: 'Analyzes safety risks using OSHA data',
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30'
  },
  swiss_cheese: {
    title: 'Swiss Cheese Analyzer',
    description: 'Predicts incident scenarios and failure modes',
    icon: Bot,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/30'
  },
  synthesizer: {
    title: 'Report Synthesizer',
    description: 'Creates comprehensive safety reports',
    icon: Settings2,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30'
  }
};

export const AgentCard: React.FC<AgentCardProps> = ({
  config,
  onUpdate,
  onTest,
  isUpdating = false
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const agentInfo = AGENT_INFO[config.agent_name as keyof typeof AGENT_INFO];
  const IconComponent = agentInfo?.icon || Bot;

  const handleConfigChange = (field: keyof AgentConfiguration, value: any) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localConfig);
    setHasChanges(false);
  };

  const handleDiscard = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  const formatLastUsed = (lastUsedAt: string | null) => {
    if (!lastUsedAt) return 'Never';

    const date = new Date(lastUsedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`
          bg-[#1a2942]/60 backdrop-blur-sm border border-[#4dd4e8]/20
          hover:border-[#4dd4e8]/40 transition-all duration-300
          ${hasChanges ? 'ring-2 ring-[#4dd4e8]/30' : ''}
        `}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-lg ${agentInfo?.bgColor || 'bg-gray-400/10'}
                  ${agentInfo?.borderColor || 'border-gray-400/30'} border
                `}>
                  <IconComponent className={`w-5 h-5 ${agentInfo?.color || 'text-gray-400'}`} />
                </div>
                <div>
                  <CardTitle className="text-[#e5e7eb] text-lg">
                    {agentInfo?.title || config.agent_name}
                  </CardTitle>
                  <CardDescription className="text-[#9ca3af] text-sm">
                    {agentInfo?.description || 'AI Agent Configuration'}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={config.is_active ? "default" : "secondary"}
                  className={`
                    ${config.is_active
                      ? 'bg-green-400/20 text-green-400 border-green-400/30'
                      : 'bg-gray-400/20 text-gray-400 border-gray-400/30'
                    }
                  `}
                >
                  {config.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Model Selection */}
            <ModelSelector
              value={localConfig.model}
              onChange={(value) => handleConfigChange('model', value)}
              agentName={config.agent_name}
              disabled={isUpdating}
            />

            {/* Temperature Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#e5e7eb] flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#4dd4e8]" />
                  Temperature
                </label>
                <span className="text-sm text-[#4dd4e8] font-mono">
                  {localConfig.temperature.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[localConfig.temperature]}
                onValueChange={([value]) => handleConfigChange('temperature', value)}
                min={0}
                max={1}
                step={0.1}
                disabled={isUpdating}
                className="[&_[role=slider]]:bg-[#4dd4e8] [&_[role=slider]]:border-[#4dd4e8]"
              />
              <div className="flex justify-between text-xs text-[#9ca3af]">
                <span>Precise (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>

            {/* Max Tokens Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e5e7eb] flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#4dd4e8]" />
                Max Tokens
              </label>
              <Input
                type="number"
                value={localConfig.max_tokens}
                onChange={(e) => handleConfigChange('max_tokens', parseInt(e.target.value) || 0)}
                min={100}
                max={10000}
                step={100}
                disabled={isUpdating}
                className="bg-[#0a1628] border-[#4dd4e8]/30 text-[#e5e7eb] focus:border-[#4dd4e8] focus:ring-1 focus:ring-[#4dd4e8]"
              />
              <p className="text-xs text-[#9ca3af]">
                Maximum output length (100-10,000 tokens)
              </p>
            </div>

            {/* Notes Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e5e7eb]">
                Notes (Optional)
              </label>
              <textarea
                value={localConfig.notes || ''}
                onChange={(e) => handleConfigChange('notes', e.target.value)}
                placeholder="Add configuration notes..."
                rows={2}
                disabled={isUpdating}
                className="w-full p-2 bg-[#0a1628] border border-[#4dd4e8]/30 text-[#e5e7eb] placeholder:text-[#9ca3af] rounded-md focus:border-[#4dd4e8] focus:ring-1 focus:ring-[#4dd4e8] text-sm resize-none"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#4dd4e8]/10">
              <div className="text-center">
                <p className="text-xs text-[#9ca3af]">Executions</p>
                <p className="text-sm font-medium text-[#e5e7eb]">
                  {config.total_executions || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#9ca3af]">Avg Time</p>
                <p className="text-sm font-medium text-[#e5e7eb]">
                  {config.avg_execution_time_ms
                    ? `${Math.round(config.avg_execution_time_ms)}ms`
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#9ca3af]">Last Used</p>
                <p className="text-sm font-medium text-[#e5e7eb]">
                  {formatLastUsed(config.last_used_at)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              {hasChanges && (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="bg-[#4dd4e8] text-[#0a1628] hover:bg-[#3b9cb5] flex-1"
                  >
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDiscard}
                    disabled={isUpdating}
                    className="bg-transparent border-[#4dd4e8]/30 text-[#4dd4e8] hover:bg-[#4dd4e8]/10"
                  >
                    Discard
                  </Button>
                </>
              )}

              {!hasChanges && (
                <Button
                  variant="outline"
                  onClick={() => setShowTestPanel(true)}
                  className="bg-transparent border-[#4dd4e8]/30 text-[#4dd4e8] hover:bg-[#4dd4e8]/10 flex items-center gap-2 w-full"
                >
                  <Play className="w-4 h-4" />
                  Test Agent
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Test Panel */}
      <AgentTestPanel
        agentName={config.agent_name}
        model={localConfig.model}
        isOpen={showTestPanel}
        onClose={() => setShowTestPanel(false)}
      />
    </>
  );
};