/**
 * Agent Test Panel Component
 *
 * Modal/panel for testing individual agents with custom prompts
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, X, Clock, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { testAgent, type AgentTestRequest, type AgentTestResponse } from '@/services/agentConfigApi';

interface AgentTestPanelProps {
  agentName: string;
  model: string;
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PROMPTS = {
  validator: "Validate this safety checklist response: 'Workers are wearing hard hats and safety vests on the construction site.' Check for completeness and accuracy.",
  risk_assessor: "Assess the safety risks for glass installation work at height in 20mph winds with partly cloudy conditions.",
  swiss_cheese: "Analyze potential failure scenarios for a curtain wall installation project where workers are using fall protection equipment.",
  synthesizer: "Create a comprehensive safety report summary based on validated data, risk assessment, and incident predictions for a high-rise construction project."
};

export const AgentTestPanel: React.FC<AgentTestPanelProps> = ({
  agentName,
  model,
  isOpen,
  onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<AgentTestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const testRequest: AgentTestRequest = {
        agent_name: agentName,
        test_prompt: prompt.trim()
      };

      const result = await testAgent(testRequest);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSamplePrompt = () => {
    const samplePrompt = SAMPLE_PROMPTS[agentName as keyof typeof SAMPLE_PROMPTS] || '';
    setPrompt(samplePrompt);
  };

  const handleCopyResponse = () => {
    if (response?.response) {
      navigator.clipboard.writeText(response.response);
    }
  };

  const formatAgentName = (name: string) => {
    switch (name) {
      case 'validator': return 'Data Validator';
      case 'risk_assessor': return 'Risk Assessor';
      case 'swiss_cheese': return 'Swiss Cheese Analyzer';
      case 'synthesizer': return 'Report Synthesizer';
      default: return name;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-[#1a2942] border border-[#4dd4e8]/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#4dd4e8]/20">
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 text-[#4dd4e8]" />
              <div>
                <h2 className="text-xl font-bold text-[#e5e7eb]">
                  Test {formatAgentName(agentName)}
                </h2>
                <p className="text-sm text-[#9ca3af]">
                  Model: {model}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#4dd4e8]/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Prompt Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#e5e7eb]">
                  Test Prompt
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseSamplePrompt}
                  className="bg-transparent border-[#4dd4e8]/30 text-[#4dd4e8] hover:bg-[#4dd4e8]/10 text-xs"
                >
                  Use Sample
                </Button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Enter a prompt to test the ${formatAgentName(agentName)}...`}
                className="w-full h-32 p-3 bg-[#0a1628] border border-[#4dd4e8]/30 text-[#e5e7eb] placeholder:text-[#9ca3af] rounded-md focus:border-[#4dd4e8] focus:ring-1 focus:ring-[#4dd4e8] resize-none"
                disabled={loading}
              />
            </div>

            {/* Test Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleTest}
                disabled={!prompt.trim() || loading}
                className="bg-[#4dd4e8] text-[#0a1628] hover:bg-[#3b9cb5] px-8"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
                    Testing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Test Agent
                  </div>
                )}
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Test Failed</span>
                  </div>
                  <p className="text-sm text-red-300 mt-2">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Response Display */}
            {response && (
              <Card className="bg-[#0a1628]/50 border-[#4dd4e8]/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#e5e7eb] flex items-center gap-2">
                      {response.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      Agent Response
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-[#4dd4e8]/30 text-[#4dd4e8]">
                        <Clock className="w-3 h-3 mr-1" />
                        {response.execution_time_ms.toFixed(0)}ms
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyResponse}
                        className="text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#4dd4e8]/10"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-[#9ca3af]">
                    Model: {response.model_used}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {response.success ? (
                    <div className="space-y-3">
                      <div className="bg-[#1a2942] p-4 rounded-md border border-[#4dd4e8]/10">
                        <p className="text-[#e5e7eb] whitespace-pre-wrap leading-relaxed">
                          {response.response}
                        </p>
                      </div>

                      {/* Token Usage */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-[#9ca3af]">Input Tokens</p>
                          <p className="text-sm font-medium text-[#e5e7eb]">
                            {response.token_usage.prompt_tokens}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#9ca3af]">Output Tokens</p>
                          <p className="text-sm font-medium text-[#e5e7eb]">
                            {response.token_usage.completion_tokens}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#9ca3af]">Total Tokens</p>
                          <p className="text-sm font-medium text-[#4dd4e8]">
                            {response.token_usage.total_tokens}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-500/10 p-4 rounded-md border border-red-500/30">
                      <p className="text-red-300 text-sm">
                        {response.error || 'Agent test failed'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};