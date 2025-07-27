
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { HardHat, ShieldAlert, AlertTriangle, ShieldCheck, Construction, Tool, FireExtinguisher, FirstAidKit, CheckCircle2, Siren } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Confetti from "./confetti";

const checklistData = {
  "Critical Safety (PPE)": {
    priority: "critical",
    items: [
      { text: "Hard hats are worn by all personnel.", icon: <HardHat className="h-6 w-6 text-red-500" /> },
      { text: "Fall protection equipment used at heights over 6 feet.", icon: <ShieldAlert className="h-6 w-6 text-red-500" /> },
    ],
  },
  "Important (Work Area Safety)": {
    priority: "important",
    items: [
      { text: "Walkways and access points are clear of debris.", icon: <Construction className="h-6 w-6 text-yellow-500" /> },
      { text: "Proper signage is in place (e.g., caution, danger).", icon: <AlertTriangle className="h-6 w-6 text-yellow-500" /> },
      { text: "Fire extinguishers are accessible and charged.", icon: <FireExtinguisher className="h-6 w-6 text-yellow-500" /> },
      { text: "First aid kits are available and stocked.", icon: <FirstAidKit className="h-6 w-6 text-yellow-500" /> },
    ],
  },
  "Standard (Tools and Equipment)": {
    priority: "standard",
    items: [
      { text: "Tools are in good condition and properly stored.", icon: <Tool className="h-6 w-6 text-green-500" /> },
      { text: "Power tools have guards in place.", icon: <ShieldCheck className="h-6 w-6 text-green-500" /> },
      { text: "Ladders are secure and used correctly.", icon: <Construction className="h-6 w-6 text-green-500" /> },
    ],
  },
};

type ChecklistState = Record<string, boolean>;

export default function ChecklistsPage() {
  const totalItems = Object.values(checklistData).reduce((acc, category) => acc + category.items.length, 0);

  const [checkedState, setCheckedState] = useState<ChecklistState>(() => {
    const initialState: ChecklistState = {};
    Object.values(checklistData).forEach(category => {
      category.items.forEach(item => {
        initialState[item.text] = false;
      });
    });
    return initialState;
  });
  
  const [showConfetti, setShowConfetti] = useState(false);
  const checkedCount = Object.values(checkedState).filter(Boolean).length;
  const completionPercentage = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  useEffect(() => {
    if (completionPercentage === 100) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [completionPercentage]);


  const handleCheckChange = (itemText: string) => {
    setCheckedState(prevState => ({
      ...prevState,
      [itemText]: !prevState[itemText],
    }));
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
      <PageHeader title="Daily Safety Checklist" description="Complete this before starting any work." />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle>Site: Alpha Tower | Date: {new Date().toLocaleDateString()}</CardTitle>
                <CardDescription>Check each item to confirm it has been inspected and is compliant.</CardDescription>
                </CardHeader>
                <CardContent>
                <form>
                    {Object.entries(checklistData).map(([category, data]) => (
                    <div key={category} className={`mb-8 p-4 rounded-lg bg-card ${getPriorityClass(data.priority)}`}>
                        <h3 className="text-xl font-bold mb-4">{category}</h3>
                        <Separator className="mb-6" />
                        <div className="space-y-6">
                        {data.items.map((item, index) => (
                            <div key={index} className={`flex items-center space-x-4 p-3 rounded-md transition-all ease-in-out duration-300 ${!checkedState[item.text] && data.priority === 'critical' ? 'animate-pulse bg-red-500/10' : ''}`}>
                                {item.icon}
                                <Checkbox
                                    id={`${category}-${index}`}
                                    checked={checkedState[item.text]}
                                    onCheckedChange={() => handleCheckChange(item.text)}
                                    className="h-8 w-8"
                                />
                                <Label htmlFor={`${category}-${index}`} className="font-normal text-base cursor-pointer flex-1">
                                    {item.text}
                                </Label>
                            </div>
                        ))}
                        </div>
                    </div>
                    ))}
                    <Button type="submit" className="w-full mt-4 h-12 text-lg">Submit Checklist</Button>
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
