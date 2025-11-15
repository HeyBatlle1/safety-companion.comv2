import React from 'react';
import { ExecutiveSummary } from '../SafetyAnalysis/ExecutiveSummary';
import type { GoNoGoDecision, ReportMetadata } from '@/types/safety-analysis';

// Mock data to test the ExecutiveSummary fix
const mockData = {
  decision: {
    decision: 'CONDITIONAL_GO' as const,
    basis: {
      highestRiskScore: 75,
      criticalGapsCount: 2,
      weatherSeverity: 'NORMAL' as const,
      regulatoryViolations: 0,
      emergencyReadiness: true
    },
    conditions: ['Verify fall protection', 'Monitor weather'],
    timeRestriction: undefined
  } as GoNoGoDecision,
  riskLevel: 'HIGH',
  riskScore: 75,
  probability: 25, // This tests the fix: should display as 25% not 0.25%
  dataQuality: 85,
  topThreats: ['Fall hazards', 'Equipment failure', 'Weather conditions'],
  criticalActions: ['Verify fall protection', 'Check equipment', 'Monitor weather'],
  metadata: {
    reportId: 'TEST-001',
    generatedAt: new Date(),
    projectName: 'ExecutiveSummary Test',
    location: 'Test Location',
    workType: 'General Construction',
    supervisor: 'Test Supervisor'
  } as ReportMetadata
};

export function ExecutiveSummaryTest() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ExecutiveSummary Component Test</h1>
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Testing the Probability Fix</h2>
        <p className="text-sm text-gray-600">
          The probability value is set to <strong>25</strong> (not 0.25).
          It should display as <strong>"25%"</strong> in the component below.
        </p>
      </div>

      <ExecutiveSummary
        decision={mockData.decision}
        riskLevel={mockData.riskLevel}
        riskScore={mockData.riskScore}
        probability={mockData.probability}
        dataQuality={mockData.dataQuality}
        topThreats={mockData.topThreats}
        criticalActions={mockData.criticalActions}
        metadata={mockData.metadata}
      />
    </div>
  );
}