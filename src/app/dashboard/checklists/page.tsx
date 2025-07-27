
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { HardHat, ShieldAlert, AlertTriangle, ShieldCheck, Building, Wrench, FireExtinguisher, BriefcaseMedical, CheckCircle2, Camera, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Confetti from "./confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";


type ChecklistItem = {
    text: string;
    icon: JSX.Element;
    photoRequired: boolean;
};

type ChecklistCategory = {
    priority: 'critical' | 'important' | 'standard';
    items: ChecklistItem[];
};

const checklistData: Record<string, ChecklistCategory> = {
  "Critical Safety (PPE)": {
    priority: "critical",
    items: [
      { text: "Hard hats are worn by all personnel.", icon: <HardHat className="h-6 w-6 text-red-500" />, photoRequired: true },
      { text: "Fall protection equipment used at heights over 6 feet.", icon: <ShieldAlert className="h-6 w-6 text-red-500" />, photoRequired: true },
    ],
  },
  "Important (Work Area Safety)": {
    priority: "important",
    items: [
      { text: "Walkways and access points are clear of debris.", icon: <Building className="h-6 w-6 text-yellow-500" />, photoRequired: false },
      { text: "Proper signage is in place (e.g., caution, danger).", icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />, photoRequired: false },
      { text: "Fire extinguishers are accessible and charged.", icon: <FireExtinguisher className="h-6 w-6 text-yellow-500" />, photoRequired: false },
      { text: "First aid kits are available and stocked.", icon: <BriefcaseMedical className="h-6 w-6 text-yellow-500" />, photoRequired: false },
    ],
  },
  "Standard (Tools and Equipment)": {
    priority: "standard",
    items: [
      { text: "Tools are in good condition and properly stored.", icon: <Wrench className="h-6 w-6 text-green-500" />, photoRequired: false },
      { text: "Power tools have guards in place.", icon: <ShieldCheck className="h-6 w-6 text-green-500" />, photoRequired: false },
      { text: "Ladders are secure and used correctly.", icon: <Building className="h-6 w-6 text-green-500" />, photoRequired: false },
    ],
  },
};

type ChecklistState = Record<string, { checked: boolean; photo?: string | null }>;

export default function ChecklistsPage() {
    const totalItems = Object.values(checklistData).reduce((acc, category) => acc + category.items.length, 0);

    const [checkedState, setCheckedState] = useState<ChecklistState>(() => {
        const initialState: ChecklistState = {};
        Object.values(checklistData).forEach(category => {
        category.items.forEach(item => {
            initialState[item.text] = { checked: false, photo: null };
        });
        });
        return initialState;
    });

    const [showConfetti, setShowConfetti] = useState(false);
    const [currentItemForPhoto, setCurrentItemForPhoto] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    
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

    const handleCheckChange = (itemText: string) => {
        setCheckedState(prevState => ({
        ...prevState,
        [itemText]: { ...prevState[itemText], checked: !prevState[itemText].checked },
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

    const getPriorityClass = (priority: string) => {
        switch (priority) {
        case 'critical':
            return 'border-l-4 border-red-500';
        case 'important':
            return 'border-l-4 border-yellow-500';
        default:
            return 'border-l-4 border-green-500';
        }
    }

  return (
    <>
      {showConfetti && <Confetti />}
      <PageHeader title="Daily Safety Checklist" description="Complete this before starting any work. Photo verification is required for critical items." />
      
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Photo Verification: {currentItemForPhoto}</DialogTitle>
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
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle>Site: Alpha Tower | Date: {new Date().toLocaleDateString()}</CardTitle>
                <CardDescription>Check each item to confirm compliance. Critical items require photo proof.</CardDescription>
                </CardHeader>
                <CardContent>
                <form>
                    {Object.entries(checklistData).map(([category, data]) => (
                    <div key={category} className={`mb-8 p-6 rounded-lg bg-card ${getPriorityClass(data.priority)}`}>
                        <h3 className="text-xl font-bold mb-4">{category}</h3>
                        <Separator className="mb-6" />
                        <div className="space-y-6">
                        {data.items.map((item, index) => {
                            const state = checkedState[item.text];
                            return (
                            <div key={index} className={`flex items-start space-x-4 p-4 rounded-md transition-all ease-in-out duration-300 ${!state.checked && data.priority === 'critical' ? 'animate-pulse bg-red-500/10' : ''}`}>
                                <Checkbox
                                    id={`${category}-${index}`}
                                    checked={state.checked}
                                    onCheckedChange={() => handleCheckChange(item.text)}
                                    className="h-8 w-8 mt-1"
                                />
                                <div className="flex-1 space-y-2">
                                     <Label htmlFor={`${category}-${index}`} className="font-normal text-lg cursor-pointer flex-1 flex items-center">
                                        {item.icon}
                                        <span className="ml-3">{item.text}</span>
                                    </Label>
                                    {item.photoRequired && (
                                        <div className="flex items-center gap-4 pl-9">
                                            <Button type="button" variant="outline" size="sm" onClick={() => openCameraDialog(item.text)}>
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
                    <Button type="submit" className="w-full mt-4 h-12 text-lg">
                        <Upload className="mr-2" />
                        Submit Checklist
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

    