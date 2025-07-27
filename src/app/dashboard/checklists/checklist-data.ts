
// Master Glass Company Safety Checklist Logic
// For large commercial installations, high-rise work, storefront installations

export const glassWorkChecklist = {
  metadata: {
    industry: "Commercial Glass Installation",
    riskLevel: "HIGH",
    oshaStandards: ["1926.95", "1926.501", "1926.451"], // Fall protection, PPE, Scaffolding
    minimumPassingScore: 85, // Below 85% = job shutdown
    criticalFailureThreshold: 1 // Any critical failure = immediate stop
  },

  categories: [
    {
      id: "fall_protection",
      name: "Fall Protection & Height Safety",
      priority: "CRITICAL",
      failureAction: "IMMEDIATE_STOP",
      requiredFor: ["high_rise", "multi_story", "elevated_work"],
      items: [
        {
          id: "fp_001",
          text: "Personal fall arrest systems inspected and properly fitted",
          type: "verification_with_photo",
          weight: 20,
          failureCost: "FATALITY_RISK",
          oshaReference: "1926.502(d)"
        },
        {
          id: "fp_002", 
          text: "Anchor points tested to 5,000 lb minimum (certified within 12 months)",
          type: "documentation_check",
          weight: 15,
          requiredDoc: "anchor_point_certification"
        },
        {
          id: "fp_003",
          text: "Guardrails installed at all open edges above 6 feet",
          type: "visual_inspection_gps",
          weight: 15,
          gpsVerification: true
        },
        {
          id: "fp_004",
          text: "Safety nets deployed below glass installation areas",
          type: "photo_verification",
          weight: 10,
          applicableWhen: "exterior_high_rise"
        }
      ]
    },

    {
      id: "glass_handling",
      name: "Glass Handling & Material Safety", 
      priority: "CRITICAL",
      failureAction: "SUPERVISOR_OVERRIDE_REQUIRED",
      items: [
        {
          id: "gh_001",
          text: "Glass lifting equipment (suction cups, cranes) inspected within 24 hours",
          type: "daily_inspection_log",
          weight: 15,
          inspectionRequired: "certified_operator"
        },
        {
          id: "gh_002",
          text: "Tempered/laminated glass properly marked and oriented",
          type: "material_verification", 
          weight: 10,
          dataCapture: "glass_specs_photo"
        },
        {
          id: "gh_003",
          text: "Wind speed below 25 mph for exterior glass installation",
          type: "weather_data",
          weight: 20,
          autoCheck: "weather_api",
          threshold: "25_mph"
        },
        {
          id: "gh_004",
          text: "Exclusion zones established below glass work areas",
          type: "site_setup_verification",
          weight: 15,
          requiredDistance: "minimum_10_feet"
        }
      ]
    },

    {
      id: "equipment_safety",
      name: "Equipment & Tool Safety",
      priority: "HIGH",
      failureAction: "EQUIPMENT_LOCKOUT",
      items: [
        {
          id: "eq_001",
          text: "Cranes and hoists have current inspection certificates",
          type: "certification_check",
          weight: 15,
          validityPeriod: "annual"
        },
        {
          id: "eq_002",
          text: "Scaffolding erected by competent person with tags",
          type: "competent_person_verification",
          weight: 15,
          requiredCertification: "scaffolding_competent_person"
        },
        {
          id: "eq_003",
          text: "Power tools have GFCI protection",
          type: "electrical_safety_check",
          weight: 10
        },
        {
          id: "eq_004",
          text: "Glass cutting area properly ventilated and contained",
          type: "environmental_check",
          weight: 10,
          airQualityRequired: true
        }
      ]
    },

    {
      id: "site_conditions",
      name: "Site Conditions & Access",
      priority: "MEDIUM",
      failureAction: "MITIGATION_REQUIRED",
      items: [
        {
          id: "sc_001",
          text: "Pedestrian walkways protected from falling glass/debris",
          type: "public_safety_verification",
          weight: 15,
          liability: "HIGH"
        },
        {
          id: "sc_002",
          text: "Emergency access routes clear and marked",
          type: "site_layout_check",
          weight: 10
        },
        {
          id: "sc_003", 
          text: "Communication system established between ground and height workers",
          type: "communication_test",
          weight: 10,
          testRequired: true
        }
      ]
    }
  ],

  // Scoring algorithm that actually matters
  scoring: {
    calculateScore: (responses: any) => {
      let totalWeight = 0;
      let achievedWeight = 0;
      let criticalFailures = 0;
      
      const findItemById = (itemId: string) => {
        for (const category of glassWorkChecklist.categories) {
            const item = category.items.find(i => i.id === itemId);
            if (item) return { ...item, category };
        }
        return null;
      }

      responses.forEach((response: { itemId: string, passed: boolean }) => {
        const item = findItemById(response.itemId);
        if(!item) return;

        totalWeight += item.weight;
        
        if (response.passed) {
          achievedWeight += item.weight;
        } else if (item.category.priority === "CRITICAL") {
          criticalFailures++;
        }
      });

      const score = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;
      
      const getRecommendedAction = (score: number, criticalFailures: number) => {
        if (criticalFailures > 0) return "IMMEDIATE_WORK_STOPPAGE";
        if (score < 70) return "RETRAIN_CREW_BEFORE_PROCEEDING";
        if (score < 85) return "SUPERVISOR_REVIEW_REQUIRED";
        return "PROCEED_WITH_NORMAL_OPERATIONS";
      }

      return {
        score: Math.round(score),
        passed: score >= 85 && criticalFailures === 0,
        criticalFailures,
        recommendedAction: getRecommendedAction(score, criticalFailures)
      };
    }
  },

  // This is where the real intelligence lives
  adaptiveLogic: {
    // Generate follow-up checklists based on failures
    generateFollowUpChecklist: (failedItems: any) => {
      // If fall protection failed, add enhanced fall protection checklist
      // If weather failed, add weather monitoring checklist
      // If equipment failed, add equipment re-certification process
    },
    
    // Escalate based on failure patterns
    escalationRules: {
      "repeated_fall_protection_failures": "OSHA_NOTIFICATION",
      "weather_violations": "PROJECT_DELAY", 
      "equipment_failures": "EQUIPMENT_AUDIT"
    }
  }
};
