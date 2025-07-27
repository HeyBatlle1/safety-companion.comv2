import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";

const checklistItems = {
  "Personal Protective Equipment (PPE)": [
    "Hard hats are worn by all personnel.",
    "Safety glasses/goggles are in use.",
    "High-visibility vests are worn.",
    "Appropriate footwear is worn.",
  ],
  "Work Area Safety": [
    "Walkways and access points are clear of debris.",
    "Proper signage is in place (e.g., caution, danger).",
    "Fire extinguishers are accessible and charged.",
    "First aid kits are available and stocked.",
  ],
  "Tools and Equipment": [
    "Tools are in good condition and properly stored.",
    "Power tools have guards in place.",
    "Heavy equipment has been inspected before use.",
    "Ladders are secure and used correctly.",
  ],
};

export default function ChecklistsPage() {
  return (
    <>
      <PageHeader title="Daily Safety Checklist" description="Complete this before starting any work." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Site: Alpha Tower | Date: {new Date().toLocaleDateString()}</CardTitle>
              <CardDescription>Check each item to confirm it has been inspected and is compliant.</CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                {Object.entries(checklistItems).map(([category, items]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{category}</h3>
                    <Separator className="mb-4" />
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Checkbox id={`${category}-${index}`} />
                          <Label htmlFor={`${category}-${index}`} className="font-normal">
                            {item}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Button type="submit" className="w-full mt-4">Submit Checklist</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Checklist Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <p className="text-sm font-medium">Progress</p>
                <div className="text-2xl font-bold">0 / 12</div>
              </div>
              <div>
                <p className="text-sm font-medium">Score</p>
                <div className="text-2xl font-bold text-green-600">0%</div>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                The safety score is calculated based on the number of checked items. Ensure all items are verified.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
