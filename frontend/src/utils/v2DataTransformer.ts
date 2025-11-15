// V2 to V1 Data Transformer
// Converts V2 backend response format to V1 frontend SafetyAnalysisReport format

import type {
  Agent1Output,
  Agent2Output,
  Agent3Output,
  Agent4Output,
  ReportMetadata,
  GoNoGoDecision
} from '@/types/safety-analysis';

interface V2BackendResponse {
  pipeline_metadata: {
    version: string;
    execution_time_ms: number;
    agents_used: Record<string, any>;
  };
  agent_outputs: {
    agent1_validation: any;
    agent2_risk_assessment: any;
    agent3_swiss_cheese: any;
    agent4_final_report: any;
  };
  summary: {
    overall_risk_score: number;
    go_no_go_decision: string;
    primary_concerns: string[];
    execution_time_seconds: number;
  };
}

interface V1SafetyAnalysisProps {
  agent1: Agent1Output;
  agent2: Agent2Output;
  agent3: Agent3Output;
  agent4: Agent4Output;
  metadata: ReportMetadata;
}

export function transformV2ToV1(v2Response: V2BackendResponse, checklistData: any): V1SafetyAnalysisProps {
  const {
    pipeline_metadata,
    agent_outputs,
    summary
  } = v2Response;

  // Transform metadata
  const metadata: ReportMetadata = {
    reportId: `V2-${Date.now()}`,
    generatedAt: new Date(),
    projectName: checklistData?.projectName || 'Safety Analysis',
    location: checklistData?.location || 'Unknown Location',
    workType: checklistData?.workType || 'General Construction',
    supervisor: checklistData?.supervisor || 'TBD'
  };

  // Transform Agent 1 (Validation)
  const agent1: Agent1Output = {
    qualityScore: agent_outputs.agent1_validation?.qualityScore || 75,
    dataQuality: agent_outputs.agent1_validation?.dataQuality || 'MEDIUM',
    missingCritical: agent_outputs.agent1_validation?.missingCritical || [],
    insufficientResponses: agent_outputs.agent1_validation?.insufficientResponses || [],
    weatherPresent: agent_outputs.agent1_validation?.weatherPresent || false,
    weatherRisks: agent_outputs.agent1_validation?.weatherRisks || [],
    concerns: {
      CRITICAL: agent_outputs.agent1_validation?.concerns?.CRITICAL || [],
      HIGH: agent_outputs.agent1_validation?.concerns?.HIGH || [],
      MEDIUM: agent_outputs.agent1_validation?.concerns?.MEDIUM || [],
      LOW: agent_outputs.agent1_validation?.concerns?.LOW || []
    },
    tradeSpecificGaps: agent_outputs.agent1_validation?.tradeSpecificGaps || [],
    recommendedAction: agent_outputs.agent1_validation?.recommendedAction || 'PROCEED'
  };

  // Transform Agent 2 (Risk Assessment)
  const agent2: Agent2Output = {
    riskSummary: {
      overallRiskLevel: agent_outputs.agent2_risk_assessment?.riskSummary?.overallRiskLevel || 'MEDIUM',
      highestRiskScore: summary.overall_risk_score || 0,
      industryContext: agent_outputs.agent2_risk_assessment?.riskSummary?.industryContext || 'Construction'
    },
    hazards: Array.isArray(agent_outputs.agent2_risk_assessment?.hazards)
      ? agent_outputs.agent2_risk_assessment.hazards
      : [
          {
            name: 'General Safety Risk',
            category: 'Other' as const,
            probability: 50,
            consequence: 'Serious' as const,
            riskScore: summary.overall_risk_score || 0,
            riskLevel: 'MEDIUM' as const,
            oshaContext: 'General industry standards apply',
            inadequateControls: [],
            recommendedControls: ['Follow standard safety procedures']
          }
        ],
    topThreats: summary.primary_concerns || ['Safety concerns identified'],
    weatherImpact: agent_outputs.agent2_risk_assessment?.weatherImpact,
    immediateActions: agent_outputs.agent2_risk_assessment?.immediateActions || []
  };

  // Transform Agent 3 (Swiss Cheese)
  const agent3: Agent3Output = {
    incidentName: agent_outputs.agent3_swiss_cheese?.incidentName || 'Potential Safety Incident',
    timeframe: agent_outputs.agent3_swiss_cheese?.timeframe || '1-6 months',
    probability: agent_outputs.agent3_swiss_cheese?.probability || 25,
    confidence: agent_outputs.agent3_swiss_cheese?.confidence || 'MEDIUM',
    causalChain: Array.isArray(agent_outputs.agent3_swiss_cheese?.causalChain)
      ? agent_outputs.agent3_swiss_cheese.causalChain
      : Array.isArray(agent_outputs.agent3_swiss_cheese?.causal_chain)
      ? agent_outputs.agent3_swiss_cheese.causal_chain
      : [
          {
            stage: 'Initial Condition',
            description: 'Analysis completed with V2 backend',
            evidence: 'Multi-agent pipeline execution'
          }
        ],
    leadingIndicators: agent_outputs.agent3_swiss_cheese?.leadingIndicators || agent_outputs.agent3_swiss_cheese?.leading_indicators || {
      behavioral: [],
      environmental: [],
      organizational: [],
      technical: []
    },
    interventions: {
      preventive: Array.isArray(agent_outputs.agent3_swiss_cheese?.immediate_actions)
        ? agent_outputs.agent3_swiss_cheese.immediate_actions.map((action: any, idx: number) => ({
            tier: ['Elimination', 'Engineering', 'Administrative', 'PPE'][idx % 4] as any,
            action: typeof action === 'string' ? action : action.action || 'Safety intervention',
            breaksChainAt: 'Initial conditions',
            feasibility: 'HIGH' as const,
            timeToImplement: 'Immediate',
            cost: 'MEDIUM' as const,
            effectivenessReduction: '50-75%'
          }))
        : [],
      mitigative: Array.isArray(agent_outputs.agent3_swiss_cheese?.short_term_actions)
        ? agent_outputs.agent3_swiss_cheese.short_term_actions.map((action: any) => ({
            action: typeof action === 'string' ? action : action.action || 'Mitigating action',
            reducesHarm: 'Reduces severity by 50%'
          }))
        : [],
      recommended: agent_outputs.agent3_swiss_cheese?.recommended_action || 'Follow all safety protocols'
    },
    oshaPatternMatch: agent_outputs.agent3_swiss_cheese?.oshaPatternMatch
  };

  // Transform Agent 4 (Final Report)
  const goNoGoDecision: GoNoGoDecision = {
    decision: mapV2DecisionToV1(summary.go_no_go_decision),
    basis: {
      highestRiskScore: summary.overall_risk_score,
      criticalGapsCount: agent_outputs.agent1_validation?.missingCritical?.length || 0,
      weatherSeverity: 'NORMAL' as const,
      regulatoryViolations: 0,
      emergencyReadiness: true
    },
    conditions: agent_outputs.agent4_final_report?.conditions || [],
    timeRestriction: agent_outputs.agent4_final_report?.timeRestriction
  };

  const agent4: Agent4Output = {
    metadata,
    executiveSummary: {
      decision: goNoGoDecision,
      overallRiskLevel: agent_outputs.agent2_risk_assessment?.risk_level || 'EXTREME',
      incidentProbability: (agent_outputs.agent3_swiss_cheese?.probability || 0.25) * 100,
      topThreats: Array.isArray(agent_outputs.agent4_final_report?.top_threats)
        ? agent_outputs.agent4_final_report.top_threats
        : Array.isArray(agent_outputs.agent2_risk_assessment?.top_hazards)
        ? agent_outputs.agent2_risk_assessment.top_hazards
        : ['Fall hazards', 'Equipment failure', 'Weather conditions'],
      criticalActions: Array.isArray(agent_outputs.agent4_final_report?.critical_actions)
        ? agent_outputs.agent4_final_report.critical_actions
        : Array.isArray(agent_outputs.agent1_validation?.critical_gaps)
        ? agent_outputs.agent1_validation.critical_gaps
        : ['Verify fall protection', 'Check equipment', 'Monitor weather']
    },
    dataQuality: {
      score: agent1.qualityScore,
      rating: agent1.dataQuality,
      missingCritical: agent1.missingCritical,
      concerns: agent1.concerns
    },
    riskAssessment: {
      hazards: agent2.hazards,
      industryContext: agent2.riskSummary.industryContext,
      oshaStatistics: agent_outputs.agent2_risk_assessment?.oshaStatistics || {}
    },
    incidentPrediction: {
      scenario: agent3.incidentName,
      probability: agent3.probability,
      timeframe: agent3.timeframe,
      causalChain: agent3.causalChain,
      leadingIndicators: agent3.leadingIndicators
    },
    weatherAnalysis: agent_outputs.agent4_final_report?.weatherAnalysis,
    complianceGaps: agent_outputs.agent4_final_report?.complianceGaps || [],
    emergencyReadiness: agent_outputs.agent4_final_report?.emergencyReadiness,
    actionItems: agent_outputs.agent4_final_report?.actionItems || [],
    recommendedInterventions: agent3.interventions,
    approvals: agent_outputs.agent4_final_report?.approvals
  };

  return {
    agent1,
    agent2,
    agent3,
    agent4,
    metadata
  };
}

function mapV2DecisionToV1(v2Decision: string): GoNoGoDecision['decision'] {
  switch (v2Decision?.toUpperCase()) {
    case 'STOP_WORK':
      return 'STOP_WORK';
    case 'NO_GO':
      return 'NO_GO';
    case 'GO_WITH_CONDITIONS':
    case 'CONDITIONAL_GO':
      return 'CONDITIONAL_GO';
    case 'GO':
      return 'GO';
    default:
      return 'NO_GO'; // Safe default
  }
}