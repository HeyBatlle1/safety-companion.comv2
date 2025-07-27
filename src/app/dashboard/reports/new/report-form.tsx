"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { recommendRelevantRegulations, RecommendRelevantRegulationsOutput } from "@/ai/flows/recommend-relevant-regulations";
import { generateSafetyReportDraft } from "@/ai/flows/generate-safety-report-draft";
import { Loader2, Wand2, FileText, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  projectDetails: z.string().min(10, "Please provide more project details."),
  violationDescription: z.string().min(20, "Please describe the violation in more detail."),
});

type FormValues = z.infer<typeof formSchema>;

export function ReportForm() {
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendRelevantRegulationsOutput | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectDetails: "",
      violationDescription: "",
    },
  });

  const handleGetRecommendations = async () => {
    const violationDescription = form.getValues("violationDescription");
    if (!violationDescription || violationDescription.length < 20) {
      form.trigger("violationDescription");
      return;
    }

    setIsLoadingRecommendations(true);
    setRecommendations(null);

    try {
      const result = await recommendRelevantRegulations({ violationDescription });
      setRecommendations(result);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI recommendations. Please try again.",
      });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };
  
  const handleGenerateDraft = async () => {
    const { projectDetails, violationDescription } = form.getValues();
    if (!recommendations) return;
    
    setIsLoadingDraft(true);
    setDraft(null);

    try {
      const result = await generateSafetyReportDraft({
          projectDetails,
          violationDescription,
          relevantRegulations: recommendations.relevantRegulations.join('\n- ')
      });
      setDraft(result.reportDraft);
    } catch (error) {
       console.error("Error generating draft:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report draft. Please try again.",
      });
    } finally {
        setIsLoadingDraft(false);
    }
  }


  return (
    <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})} className="space-y-8">
                <CardHeader>
                    <CardTitle>1. Incident Details</CardTitle>
                    <CardDescription>Provide details about the project and the safety violation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="projectDetails"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Project Details</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., Project Alpha, Site 1, near the main crane area. Involved personnel: John Doe's team." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="violationDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Violation Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Describe the safety violation in detail. What happened, where, and when?" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="button" onClick={handleGetRecommendations} disabled={isLoadingRecommendations}>
                        {isLoadingRecommendations ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Get AI Recommendations
                    </Button>
                </CardFooter>
            </form>
            </Form>

            {recommendations && (
                <>
                <Separator className="my-6" />
                <CardHeader>
                    <CardTitle>2. AI-Powered Insights</CardTitle>
                    <CardDescription>Our AI has identified relevant regulations and information for your report.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Relevant Regulations</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5 mt-2">
                            {recommendations.relevantRegulations.map((reg, i) => <li key={i}>{reg}</li>)}
                            </ul>
                        </AlertDescription>
                    </Alert>
                    <Alert className="mt-4">
                        <FileText className="h-4 w-4" />
                        <AlertTitle>Additional Information to Include</AlertTitle>
                        <AlertDescription>
                           {recommendations.relevantInformation}
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                     <Button type="button" onClick={handleGenerateDraft} disabled={isLoadingDraft}>
                        {isLoadingDraft ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileText className="mr-2 h-4 w-4" />
                        )}
                        Generate Draft Report
                    </Button>
                </CardFooter>
                </>
            )}

            {draft && (
                 <>
                <Separator className="my-6" />
                <CardHeader>
                    <CardTitle>3. Draft Report</CardTitle>
                    <CardDescription>Review and edit the AI-generated draft below, then save the final report.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={20} />
                </CardContent>
                <CardFooter>
                    <Button>Save Final Report</Button>
                </CardFooter>
                </>
            )}
        </Card>
        <div className="lg:col-span-1">
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>How it works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p><strong>Step 1:</strong> Fill in the project and incident details.</p>
                    <p><strong>Step 2:</strong> Click "Get AI Recommendations". Our system will analyze the incident and suggest relevant safety regulations to include in your report.</p>
                    <p><strong>Step 3:</strong> Once you have the recommendations, click "Generate Draft Report". A full draft will be created for you.</p>
                     <p><strong>Step 4:</strong> Review, edit, and save your final report.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
