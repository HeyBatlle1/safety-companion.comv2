'use server';

/**
 * @fileOverview An AI agent that analyzes construction safety checklist data to provide predictive safety intelligence.
 *
 * - analyzeChecklist - A function that handles the checklist analysis.
 * - AnalyzeChecklistInput - The input type for the analyzeChecklist function.
 * - AnalyzeChecklistOutput - The return type for the analyzeChecklist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeChecklistInputSchema = z.object({
  projectContext: z
    .string()
    .describe('Details about the project, like name, location, and type of work being performed (e.g., high-rise glass installation).'),
  checklistResponses: z
    .array(
      z.object({
        itemId: z.string(),
        text: z.string(),
        passed: z.boolean(),
        priority: z.string(),
        category: z.string(),
        photoAttached: z.boolean(),
      })
    )
    .describe('An array of all checklist item responses, including failures and passes.'),
});
export type AnalyzeChecklistInput = z.infer<typeof AnalyzeChecklistInputSchema>;

export const AnalyzeChecklistOutputSchema = z.object({
  executiveSummary: z.string().describe('A high-level summary for management, focusing on overall risk, critical failures, and recommended immediate actions.'),
  technicalReport: z.string().describe('A detailed report for safety officers, including analysis of each failed item, potential OSHA violations, and specific mitigation advice.'),
  trendAnalysis: z.string().describe('Analysis for insurance documentation, identifying patterns, potential long-term risks, and comparison to safety benchmarks. Mention items that are frequently failed.'),
  trainingRecommendations: z.string().describe('Actionable training recommendations for crew supervisors based on identified knowledge or performance gaps.'),
});
export type AnalyzeChecklistOutput = z.infer<
  typeof AnalyzeChecklistOutputSchema
>;

export async function analyzeChecklist(
  input: AnalyzeChecklistInput
): Promise<AnalyzeChecklistOutput> {
  return analyzeChecklistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeChecklistPrompt',
  input: {schema: AnalyzeChecklistInputSchema},
  output: {schema: AnalyzeChecklistOutputSchema},
  prompt: `You are a world-class construction safety expert and data analyst with a specialization in predictive risk assessment for high-risk jobs like commercial glass installation. A safety checklist has just been submitted. Your task is to analyze it with extreme scrutiny and provide predictive safety intelligence.

Analyze the provided checklist responses in the context of the project. Go beyond just listing failures. Identify correlations, potential cascading failures, and hidden risks. A single failed item can have massive implications.

Project Context:
{{{projectContext}}}

Checklist Responses (JSON):
{{{json stringify=checklistResponses}}}

Based on your analysis, generate the following four distinct reports:

1.  **Executive Summary:** For a busy construction executive. Be concise. Start with an overall risk assessment (e.g., "High-Risk," "Action Required"). Immediately highlight any CRITICAL failures and their potential consequences (e.g., "Immediate work stoppage required due to critical fall protection failure, posing a fatality risk."). Provide a bulleted list of 2-3 essential actions.

2.  **Detailed Technical Report:** For the on-site Safety Officer. Be thorough and reference specific standards. For each failed item, provide:
    *   **Root Cause Analysis:** What are the likely reasons for this failure? (e.g., "Lack of training," "Faulty equipment," "Complacency").
    *   **Potential OSHA Citations:** Which specific OSHA standards might be violated? (e.g., "Potential violation of 1926.502(d)").
    *   **Mitigation Steps:** What specific, immediate actions must be taken?

3.  **Trend & Insurance Analysis:** For the Risk Manager or Insurance provider. Focus on patterns and long-term risk. Are there recurring failures in a specific category (e.g., "repeated failures in Equipment Safety")? How does this checklist compare to industry benchmarks? What are the potential financial and legal liabilities associated with these failures?

4.  **Crew Training Recommendations:** For the Crew Supervisor. Be direct and actionable. Based on the failures, what specific training is needed? (e.g., "Immediate retraining on proper fitting of personal fall arrest systems is required for the entire crew."). Suggest specific "toolbox talk" topics.

Your analysis must reflect the life-or-death importance of this information. Every insight you provide can prevent an accident. Do not be generic. Provide specific, actionable intelligence.`,
});

const analyzeChecklistFlow = ai.defineFlow(
  {
    name: 'analyzeChecklistFlow',
    inputSchema: AnalyzeChecklistInputSchema,
    outputSchema: AnalyzeChecklistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
`,
  </change>
  <change>
    <file>src/app/dashboard/checklists/page.tsx</file>
    <content><![CDATA[
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { HardHat, ShieldAlert, AlertTriangle, Building, Wrench, Siren, CheckCircle2, Camera, Upload, Loader2, BrainCircuit } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Confetti from "./confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { glassWorkChecklist } from "./checklist-data";
import { analyzeChecklist, AnalyzeChecklistOutput } from "@/ai/flows/analyze-checklist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const categoryIcons: Record<string, JSX.Element> = {
    fall_protection: <ShieldAlert className="h-6 w-6" />,
    glass_handling: <Building className="h-6 w-6" />,
    equipment_safety: <Wrench className="h-6 w-6" />,
    site_conditions: <AlertTriangle className="h-6 w-6" />,
};


type ChecklistState = Record<string, { checked: boolean; photo?: string | null }>;

export default function ChecklistsPage() {
    const totalItems = glassWorkChecklist.categories.reduce((acc, category) => acc + category.items.length, 0);

    const [checkedState, setCheckedState] = useState<ChecklistState>(() => {
        const initialState: ChecklistState = {};
        glassWorkChecklist.categories.forEach(category => {
            category.items.forEach(item => {
                initialState[item.id] = { checked: false, photo: null };
            });
        });
        return initialState;
    });

    const [showConfetti, setShowConfetti] = useState(false);
    const [currentItemForPhoto, setCurrentItemForPhoto] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeChecklistOutput | null>(null);
    const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();

    const checkedCount = Object.values(checkedState).filter(item => item.checked).length;
    const completionPercentage = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

    useEffect(() => {
        if (completionPercentage === 100) {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds
        return () => clearTimeout(timer);
        }
    }, [completionPercentage]);

    useEffect(() => {
        if (isCameraOpen) {
            const getCameraPermission = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    setHasCameraPermission(true);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (error) {
                    console.error('Error accessing camera:', error);
                    setHasCameraPermission(false);
                    toast({
                        variant: 'destructive',
                        title: 'Camera Access Denied',
                        description: 'Please enable camera permissions in your browser settings to use this feature.',
                    });
                    setIsCameraOpen(false);
                }
            };
            getCameraPermission();
        } else {
             if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        }
    }, [isCameraOpen, toast]);

    const handleCheckChange = (itemId: string) => {
        setCheckedState(prevState => ({
        ...prevState,
        [itemId]: { ...prevState[itemId], checked: !prevState[itemId].checked },
        }));
    };

    const handleTakePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if(context){
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                if (currentItemForPhoto) {
                    setCheckedState(prevState => ({
                        ...prevState,
                        [currentItemForPhoto]: { ...prevState[currentItemForPhoto], photo: dataUrl, checked: true },
                    }));
                }
                setIsCameraOpen(false);
                setCurrentItemForPhoto(null);
            }
        }
    };
    
    const openCameraDialog = (itemText: string) => {
        setCurrentItemForPhoto(itemText);
        setIsCameraOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAnalysisResult(null);

        const responses = glassWorkChecklist.categories.flatMap(category => 
            category.items.map(item => ({
                itemId: item.id,
                text: item.text,
                passed: checkedState[item.id].checked,
                priority: category.priority,
                category: category.name,
                photoAttached: !!checkedState[item.id].photo,
            }))
        );
        
        try {
            const result = await analyzeChecklist({
                projectContext: "Alpha Tower, high-rise commercial glass installation",
                checklistResponses: responses,
            });
            setAnalysisResult(result);
            setIsAnalysisDialogOpen(true);
        } catch(error) {
            console.error("Error analyzing checklist:", error);
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: "The AI analysis could not be completed. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return 'border-l-4 border-red-500';
            case 'HIGH':
                return 'border-l-4 border-yellow-500';
            case 'MEDIUM':
                return 'border-l-4 border-blue-500';
            default:
                return 'border-l-4 border-green-500';
        }
    }
    
    const getPriorityIconColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return 'text-red-500';
            case 'HIGH':
                return 'text-yellow-500';
            case 'MEDIUM':
                return 'text-blue-500';
            default:
                return 'text-green-500';
        }
    }

  return (
    <>
      {showConfetti && <Confetti />}
      <PageHeader title="Commercial Glass Installation Checklist" description={`${glassWorkChecklist.metadata.industry} - Risk Level: ${glassWorkChecklist.metadata.riskLevel}`} />
      
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Photo Verification: {currentItemForPhoto ? glassWorkChecklist.categories.flatMap(c => c.items).find(i => i.id === currentItemForPhoto)?.text : ''}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
                 <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                 {hasCameraPermission === false && (
                    <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                        Please allow camera access in your browser to use this feature.
                        </AlertDescription>
                    </Alert>
                )}
                 <canvas ref={canvasRef} className="hidden" />
                 <Button onClick={handleTakePhoto} disabled={hasCameraPermission !== true} className="w-full h-12 text-lg">
                    <Camera className="mr-2"/>
                    Take Photo
                 </Button>
            </div>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                    <BrainCircuit className="h-8 w-8 text-primary"/>
                    Predictive Safety Analysis
                </DialogTitle>
                <DialogDescription>
                    AI-powered insights based on your checklist submission.
                </DialogDescription>
            </DialogHeader>
            {analysisResult && (
                 <Tabs defaultValue="summary" className="w-full h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                        <TabsTrigger value="technical">Technical Report</TabsTrigger>
                        <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
                        <TabsTrigger value="training">Training</TabsTrigger>
                    </TabsList>
                    <div className="flex-grow overflow-y-auto p-1 mt-2">
                        <TabsContent value="summary" className="prose dark:prose-invert max-w-none">
                            <Card><CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader><CardContent><p>{analysisResult.executiveSummary}</p></CardContent></Card>
                        </TabsContent>
                        <TabsContent value="technical" className="prose dark:prose-invert max-w-none">
                            <Card><CardHeader><CardTitle>Technical Report</CardTitle></CardHeader><CardContent><p>{analysisResult.technicalReport}</p></CardContent></Card>
                        </TabsContent>
                        <TabsContent value="trends" className="prose dark:prose-invert max-w-none">
                             <Card><CardHeader><CardTitle>Trend & Insurance Analysis</CardTitle></CardHeader><CardContent><p>{analysisResult.trendAnalysis}</p></CardContent></Card>
                        </TabsContent>
                        <TabsContent value="training" className="prose dark:prose-invert max-w-none">
                            <Card><CardHeader><CardTitle>Crew Training Recommendations</CardTitle></CardHeader><CardContent><p>{analysisResult.trainingRecommendations}</p></CardContent></Card>
                        </TabsContent>
                    </div>
                </Tabs>
            )}
        </DialogContent>
      </Dialog>


      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle>Site: Alpha Tower | Date: {new Date().toLocaleDateString()}</CardTitle>
                <CardDescription>Check each item to confirm compliance. Critical items require photo proof.</CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit}>
                    {glassWorkChecklist.categories.map((category) => (
                    <div key={category.id} className={`mb-8 p-6 rounded-lg bg-card ${getPriorityClass(category.priority)}`}>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className={getPriorityIconColor(category.priority)}>{categoryIcons[category.id] || <Siren className="h-6 w-6"/>}</span>
                            {category.name}
                        </h3>
                        <Separator className="mb-6" />
                        <div className="space-y-6">
                        {category.items.map((item) => {
                            const state = checkedState[item.id];
                            const photoRequired = item.type.includes('photo');
                            return (
                            <div key={item.id} className={`flex items-start space-x-4 p-4 rounded-md transition-all ease-in-out duration-300 ${!state.checked && category.priority === 'CRITICAL' ? 'animate-pulse bg-red-500/10' : ''}`}>
                                <Checkbox
                                    id={item.id}
                                    checked={state.checked}
                                    onCheckedChange={() => handleCheckChange(item.id)}
                                    className="h-8 w-8 mt-1"
                                />
                                <div className="flex-1 space-y-2">
                                     <Label htmlFor={item.id} className="font-normal text-lg cursor-pointer flex-1 flex items-center">
                                        <span className="ml-3">{item.text}</span>
                                    </Label>
                                    {photoRequired && (
                                        <div className="flex items-center gap-4 pl-9">
                                            <Button type="button" variant="outline" size="sm" onClick={() => openCameraDialog(item.id)}>
                                                <Camera className="mr-2 h-4 w-4"/>
                                                {state.photo ? 'Retake Photo' : 'Verify with Photo'}
                                            </Button>
                                            {state.photo && (
                                                <Image src={state.photo} alt="Verification photo" width={64} height={64} className="rounded-md aspect-square object-cover border" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )})}
                        </div>
                    </div>
                    ))}
                    <Button type="submit" className="w-full mt-4 h-12 text-lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <><Loader2 className="mr-2 animate-spin" />Analyzing...</>
                        ) : (
                            <><Upload className="mr-2" />Submit & Analyze Checklist</>
                        )}
                    </Button>
                </form>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-20 shadow-lg">
            <CardHeader className="items-center text-center">
              <CardTitle>Checklist Progress</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex justify-center items-center">
                 <div className="relative h-40 w-40">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle
                            className="text-muted"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                        />
                        <circle
                            className="text-primary transition-all duration-500 ease-out"
                            strokeWidth="10"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - completionPercentage / 100)}`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{Math.round(completionPercentage)}%</span>
                    </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">{checkedCount} / {totalItems} items checked</p>
              </div>
              <Progress value={completionPercentage} className="h-4" />
               {completionPercentage === 100 && (
                <div className="flex flex-col items-center text-center p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 animate-bounce" />
                    <p className="mt-2 text-lg font-semibold text-green-800 dark:text-green-200">All Done! Great Job!</p>
                </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
