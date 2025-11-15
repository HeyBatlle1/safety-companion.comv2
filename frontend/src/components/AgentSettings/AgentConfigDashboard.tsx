/**
 * Agent Configuration Dashboard
 *
 * Main dashboard for managing the 4-agent AI system configuration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings2,
  Bot,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AgentCard } from './AgentCard';
import {
  getAgentConfigs,
  bulkUpdateAgentConfigs,
  type AgentConfiguration,
  type AgentStatusResponse
} from '@/services/agentConfigApi';

export const AgentConfigDashboard: React.FC = () => {
  const [agentStatus, setAgentStatus] = useState<AgentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadAgentConfigs();
  }, []);

  const loadAgentConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAgentConfigs();
      setAgentStatus(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentUpdate = async (updatedConfig: AgentConfiguration) => {
    if (!agentStatus) return;

    try {
      setUpdating(true);
      setError(null);

      // Update the local state
      const updatedAgents = agentStatus.agents.map(agent =>
        agent.agent_name === updatedConfig.agent_name ? updatedConfig : agent
      );

      // Bulk update all configurations
      await bulkUpdateAgentConfigs(updatedAgents);

      // Reload the configurations to get the latest data
      await loadAgentConfigs();
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agent configuration');
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkSave = async () => {
    if (!agentStatus) return;

    try {
      setUpdating(true);
      setError(null);
      await bulkUpdateAgentConfigs(agentStatus.agents);
      await loadAgentConfigs();
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configurations');
    } finally {
      setUpdating(false);
    }
  };

  const formatLastExecution = (lastExecution: string | null) => {
    if (!lastExecution) return 'Never';

    const date = new Date(lastExecution);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#1a2942] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-3 text-[#4dd4e8]">
              <div className="w-6 h-6 border-2 border-[#4dd4e8]/30 border-t-[#4dd4e8] rounded-full animate-spin" />
              <span className="text-lg">Loading Agent Configurations...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#1a2942] p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-500/10 border-red-500/30 max-w-2xl mx-auto mt-20">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-400 mb-2">
                Configuration Load Failed
              </h2>
              <p className="text-red-300 mb-4">{error}</p>
              <Button
                onClick={loadAgentConfigs}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!agentStatus) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#1a2942] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#4dd4e8]/10 rounded-lg border border-[#4dd4e8]/30">
              <Settings2 className="w-8 h-8 text-[#4dd4e8]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e5e7eb]">
                Agent Configuration
              </h1>
              <p className="text-[#9ca3af]">
                Configure and manage the 4-agent AI safety analysis system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadAgentConfigs}
              disabled={updating}
              className="bg-transparent border-[#4dd4e8]/30 text-[#4dd4e8] hover:bg-[#4dd4e8]/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            {hasUnsavedChanges && (
              <Button
                onClick={handleBulkSave}
                disabled={updating}
                className="bg-[#4dd4e8] text-[#0a1628] hover:bg-[#3b9cb5]"
              >
                <Save className="w-4 h-4 mr-2" />
                Save All Changes
              </Button>
            )}
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Configuration Error</span>
                </div>
                <p className="text-red-300 mt-2">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[#1a2942]/60 backdrop-blur-sm border border-[#4dd4e8]/20">
            <CardHeader>
              <CardTitle className="text-[#e5e7eb] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#4dd4e8]" />
                System Overview
              </CardTitle>
              <CardDescription className="text-[#9ca3af]">
                Current status and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Bot className="w-5 h-5 text-[#4dd4e8] mr-2" />
                    <span className="text-2xl font-bold text-[#e5e7eb]">
                      {agentStatus.total_agents}
                    </span>
                  </div>
                  <p className="text-sm text-[#9ca3af]">Total Agents</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />
                    <span className="text-2xl font-bold text-[#e5e7eb]">
                      {agentStatus.active_agents}
                    </span>
                  </div>
                  <p className="text-sm text-[#9ca3af]">Active Agents</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-[#4dd4e8] mr-2" />
                    <span className="text-sm font-medium text-[#e5e7eb]">
                      {formatLastExecution(agentStatus.last_execution)}
                    </span>
                  </div>
                  <p className="text-sm text-[#9ca3af]">Last Execution</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="text-sm font-medium text-[#e5e7eb]">
                      {agentStatus.available_models.length}
                    </span>
                  </div>
                  <p className="text-sm text-[#9ca3af]">Available Models</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#4dd4e8]/10">
                <div className="text-center text-xs text-[#9ca3af]">
                  Last refreshed: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Agent Configuration Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-[#1a2942]/60 border border-[#4dd4e8]/20">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-[#4dd4e8] data-[state=active]:text-[#0a1628]"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="individual"
                className="data-[state=active]:bg-[#4dd4e8] data-[state=active]:text-[#0a1628]"
              >
                Individual Agents
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agentStatus.agents.map((agent, index) => (
                  <motion.div
                    key={agent.agent_name}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <AgentCard
                      config={agent}
                      onUpdate={handleAgentUpdate}
                      onTest={() => {}}
                      isUpdating={updating}
                    />
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Individual Agents Tab */}
            <TabsContent value="individual" className="space-y-6">
              <div className="space-y-6">
                {agentStatus.agents.map((agent, index) => (
                  <motion.div
                    key={agent.agent_name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AgentCard
                      config={agent}
                      onUpdate={handleAgentUpdate}
                      onTest={() => {}}
                      isUpdating={updating}
                    />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};