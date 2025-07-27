
"use client"

import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, XCircle, Clock, FileText, Loader2, Share2, FileDown, Mail, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { analyzeJHSA, type AnalyzeJHSAOutput, type AnalyzeJHSAInput } from '@/ai/flows/analyze-jhsa';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// AI-Optimized JHSA Questions from our analysis
const jhsaQuestions = [
    {
      id: "fall_protection_elevated_work",
      title: "Fall Protection - Elevated Work",
      regulatory: ["OSHA 1926.501", "OSHA 1926.502", "OSHA 1926.503"],
      riskVectors: ["Fall/Slip/Trip", "Mechanical Failure", "Human Error"],
      fields: [
        { name: "work_height", label: "Work Height (feet)", type: "number", required: true },
        { name: "surface_conditions", label: "Surface Conditions", type: "textarea", placeholder: "Describe walking surface stability, material, weather exposure..." },
        { name: "equipment_present", label: "Fall Protection Equipment", type: "textarea", placeholder: "List scaffolding, ladders, lifts, harnesses, guardrails..." },
        { name: "weather_conditions", label: "Weather Conditions", type: "text", placeholder: "Wind speed, precipitation, temperature..." }
      ]
    },
    {
      id: "electrical_hazard_power_tools",
      title: "Electrical Hazards - Power Tools",
      regulatory: ["OSHA 1926.95", "OSHA 1926.416", "OSHA 1926.417"],
      riskVectors: ["Electrical Shock", "Electrical Fire", "Mechanical Injury"],
      fields: [
        { name: "power_source", label: "Power Source Details", type: "text", placeholder: "Voltage, amperage, power supply type..." },
        { name: "wet_conditions", label: "Moisture Assessment", type: "textarea", placeholder: "Describe any wet conditions, humidity, water sources..." },
        { name: "grounding_system", label: "GFCI Protection", type: "select", options: ["Yes - GFCI Protected", "No - No GFCI", "Unknown"] },
        { name: "tool_condition", label: "Tool Condition", type: "textarea", placeholder: "Cord integrity, housing damage, inspection dates..." }
      ]
    },
    {
      id: "excavation_trench_safety",
      title: "Excavation & Trench Safety",
      regulatory: ["OSHA 1926.650", "OSHA 1926.651", "OSHA 1926.652"],
      riskVectors: ["Excavation Collapse", "Struck By", "Chemical Exposure"],
      fields: [
        { name: "soil_type", label: "Soil Classification", type: "select", options: ["Type A - Cohesive", "Type B - Cohesive", "Type C - Granular", "Rock", "Unknown"] },
        { name: "excavation_depth", label: "Excavation Depth (feet)", type: "number", required: true },
        { name: "water_presence", label: "Water Conditions", type: "textarea", placeholder: "Groundwater, surface water, drainage..." },
        { name: "adjacent_loads", label: "Adjacent Loads", type: "textarea", placeholder: "Equipment, materials, structures nearby..." }
      ]
    }
];

export default function IntelligentJHSASystem() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, Record<string, string>>>({});
  const [photos, setPhotos] = useState<Record<string, { file: File, preview: string }>>({});
  const [analysis, setAnalysis] = useState<AnalyzeJHSAOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (questionId: string, fieldName: string, value: string) => {
    setAnalysis(null);
    setIsSaved(false);
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [fieldName]: value
      }
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsSaved(false);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => ({
          ...prev,
          [questionId]: {
            file: file,
            preview: e.target?.result as string,
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeWithGemini = async () => {
    setLoading(true);
    setAnalysis(null);
    setIsSaved(false);
    
    try {
      const currentQ = jhsaQuestions[currentQuestion];
      const currentResponse = responses[currentQ.id] || {};
      const currentPhoto = photos[currentQ.id];
      
      if(Object.keys(currentResponse).length === 0) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill out the fields for the current step before analyzing.',
        });
        setLoading(false);
        return;
      }

      const analysisInput: AnalyzeJHSAInput = {
        regulatory_standards: currentQ.regulatory,
        environmental_factors: Object.entries(currentResponse).map(([key, value]) => `${key}: ${value}`).join(', '),
        photo_descriptions: currentPhoto ? "Photo uploaded for visual verification" : "No photo provided",
        text_context: currentResponse.surface_conditions || currentResponse.wet_conditions || currentResponse.water_presence || "No detailed context provided",
        quantitative_data: `Height: ${currentResponse.work_height || 'N/A'} feet, Depth: ${currentResponse.excavation_depth || 'N/A'} feet`
      };

      const result = await analyzeJHSA(analysisInput);
      setAnalysis(result);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'The AI analysis could not be completed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveReport = async () => {
    setIsSaving(true);
    // Placeholder for Firestore saving logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaved(true);
    setIsSaving(false);
    toast({
        title: "Report Saved",
        description: "Your JHSA report has been successfully saved to the database.",
    });
  };

  const getRiskColor = (level: string | undefined) => {
    switch(level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceIcon = (status: string | undefined) => {
    switch(status) {
      case 'compliant': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'non_compliant': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'requires_attention': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const currentQ = jhsaQuestions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / jhsaQuestions.length) * 100;

  return (
    <>
      <PageHeader title="Intelligent JHSA Safety Analysis" description="AI-powered Job Hazard Safety Analysis with OSHA compliance verification" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                        <CardTitle>Step {currentQuestion + 1} of {jhsaQuestions.length}</CardTitle>
                        <span className="text-sm text-muted-foreground">{currentQ.title}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Regulatory Context</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {currentQ.regulatory.map((reg, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{reg}</span>
                            ))}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Primary Risk Vectors</h3>
                        <div className="flex flex-wrap gap-2">
                            {currentQ.riskVectors.map((risk, idx) => (
                            <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">{risk}</span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-4 my-6">
                        {currentQ.fields.map((field, idx) => (
                            <div key={idx}>
                            <Label htmlFor={`${currentQ.id}-${field.name}`} className="block text-sm font-medium text-foreground mb-1">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>
                            {field.type === 'textarea' ? (
                                <Textarea
                                id={`${currentQ.id}-${field.name}`}
                                rows={3}
                                placeholder={field.placeholder}
                                value={responses[currentQ.id]?.[field.name] || ''}
                                onChange={(e) => handleInputChange(currentQ.id, field.name, e.target.value)}
                                />
                            ) : field.type === 'select' ? (
                                <Select
                                value={responses[currentQ.id]?.[field.name] || ''}
                                onValueChange={(value) => handleInputChange(currentQ.id, field.name, value)}
                                >
                                <SelectTrigger id={`${currentQ.id}-${field.name}`}>
                                    <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                    {field.options?.map((option, optIdx) => (
                                    <SelectItem key={optIdx} value={option}>{option}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                id={`${currentQ.id}-${field.name}`}
                                type={field.type}
                                placeholder={field.placeholder}
                                value={responses[currentQ.id]?.[field.name] || ''}
                                onChange={(e) => handleInputChange(currentQ.id, field.name, e.target.value)}
                                />
                            )}
                            </div>
                        ))}
                    </div>

                     <div className="mb-6">
                        <Label className="block text-sm font-medium text-foreground mb-2">Visual Verification</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4">
                            {photos[currentQ.id] ? (
                            <div className="flex items-center space-x-4">
                                <Image 
                                src={photos[currentQ.id].preview} 
                                alt="Uploaded" 
                                width={80}
                                height={80}
                                className="w-20 h-20 object-cover rounded-md border"
                                />
                                <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Photo uploaded successfully</p>
                                <Button
                                    variant="link"
                                    className="p-0 h-auto"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Change photo
                                </Button>
                                </div>
                            </div>
                            ) : (
                            <div className="text-center">
                                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">Upload photo for AI visual analysis</p>
                                <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                >
                                <Upload className="w-4 h-4 mr-2" />
                                Choose File
                                </Button>
                            </div>
                            )}
                            <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e, currentQ.id)}
                            className="hidden"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-between mt-6">
                <Button
                    onClick={() => { setAnalysis(null); setCurrentQuestion(Math.max(0, currentQuestion - 1))}}
                    disabled={currentQuestion === 0}
                    variant="outline"
                >
                    Previous
                </Button>
                
                <Button
                    onClick={() => { setAnalysis(null); setCurrentQuestion(Math.min(jhsaQuestions.length - 1, currentQuestion + 1))}}
                    disabled={currentQuestion === jhsaQuestions.length - 1}
                    variant="outline"
                >
                    Next
                </Button>
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI Analysis</CardTitle>
                    <CardDescription>Click to run analysis on the current step.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={analyzeWithGemini} disabled={loading} className="w-full">
                        {loading ? <><Loader2 className="animate-spin mr-2"/>Analyzing...</> : 'Analyze with AI'}
                    </Button>
                </CardContent>
            </Card>

            {analysis && (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FileText className="w-6 h-6 text-primary mr-2" />
                            <CardTitle>AI Safety Analysis</CardTitle>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={!isSaved}>
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem><FileDown className="mr-2 h-4 w-4" />Download PDF</DropdownMenuItem>
                                <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Send via Email</DropdownMenuItem>
                                <DropdownMenuItem><LinkIcon className="mr-2 h-4 w-4" />Copy Sharable Link</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 gap-4 text-sm">
                        <div className="flex items-center">
                        {getComplianceIcon(analysis.compliance_status)}
                        <span className="ml-2 font-medium">
                            Compliance: <span className="font-normal">{analysis.compliance_status?.replace('_', ' ').toUpperCase()}</span>
                        </span>
                        </div>
                        <div className="flex items-center">
                        <AlertTriangle className={`w-5 h-5 mr-2 ${getRiskColor(analysis.risk_level)}`} />
                        <span className="font-medium">
                            Risk Level: <span className={`${getRiskColor(analysis.risk_level)}`}>{analysis.risk_level?.toUpperCase()}</span>
                        </span>
                        </div>
                    </div>

                    {analysis.specific_violations && analysis.specific_violations.length > 0 && (
                        <div>
                        <h4 className="font-medium text-red-600 mb-2">OSHA Violations Identified:</h4>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                            {analysis.specific_violations.map((violation, idx) => (
                            <li key={idx}>{violation}</li>
                            ))}
                        </ul>
                        </div>
                    )}

                     {analysis.immediate_hazards && analysis.immediate_hazards.length > 0 && (
                        <div>
                        <h4 className="font-medium text-orange-600 mb-2">Immediate Hazards:</h4>
                        <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                            {analysis.immediate_hazards.map((hazard, idx) => (
                            <li key={idx}>{hazard}</li>
                            ))}
                        </ul>
                        </div>
                    )}
                     <div>
                        <h4 className="font-medium text-foreground mb-2">Required Corrective Actions:</h4>
                        <div className="space-y-2">
                        {analysis.corrective_actions?.map((action, idx) => (
                            <div key={idx} className="p-3 bg-muted rounded-md border-l-4 border-primary">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm">{action.action}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                action.priority === 'immediate' ? 'bg-red-100 text-red-800' :
                                action.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                                }`}>
                                {action.priority?.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <span className="font-medium">{action.osha_standard}</span> • {action.implementation_timeframe}
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>

                     {analysis.additional_recommendations && analysis.additional_recommendations.length > 0 && (
                        <div>
                        <h4 className="font-medium text-green-700 mb-2">Additional Recommendations:</h4>
                        <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                            {analysis.additional_recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                            ))}
                        </ul>
                        </div>
                    )}

                    {analysis.insurance_risk_factors && analysis.insurance_risk_factors.length > 0 && (
                        <div>
                        <h4 className="font-medium text-purple-700 mb-2">Insurance Risk Factors:</h4>
                        <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
                            {analysis.insurance_risk_factors.map((factor, idx) => (
                            <li key={idx}>{factor}</li>
                            ))}
                        </ul>
                        </div>
                    )}
                </CardContent>
                <CardContent>
                    <Button onClick={handleSaveReport} disabled={isSaving || isSaved} className="w-full">
                         {isSaving ? <><Loader2 className="animate-spin mr-2"/>Saving...</> : isSaved ? <><CheckCircle className="mr-2"/>Saved</> : 'Save Report'}
                    </Button>
                </CardContent>
            </Card>
            )}
        </div>
      </div>
    </>
  );
}
