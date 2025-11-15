/**
 * Agent Settings Page
 *
 * Repurposed from PatternAnalysis.tsx to provide agent configuration interface
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Shield, AlertTriangle } from 'lucide-react';
import { AgentConfigDashboard } from '@/components/AgentSettings/AgentConfigDashboard';
import { useAuth } from '@/contexts/AuthContext';

export const AgentSettingsPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // For now, allow all users access during development
    // TODO: Replace with actual admin role check
    setIsAdmin(true);
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#1a2942] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#4dd4e8]">
          <div className="w-6 h-6 border-2 border-[#4dd4e8]/30 border-t-[#4dd4e8] rounded-full animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#1a2942] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1a2942]/60 backdrop-blur-sm border border-[#4dd4e8]/20 rounded-lg p-8 max-w-md text-center"
        >
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30 w-fit mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#e5e7eb] mb-3">
            Access Restricted
          </h2>
          <p className="text-[#9ca3af] mb-4">
            This page is only accessible to administrators. Agent configuration requires
            elevated permissions to prevent unauthorized changes to the AI safety system.
          </p>
          <div className="flex items-center gap-2 text-[#9ca3af] text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Contact your administrator for access</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return <AgentConfigDashboard />;
};

export default AgentSettingsPage;