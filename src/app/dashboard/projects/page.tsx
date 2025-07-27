import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { PlusCircle, DollarSign, HardHat, Wrench, Users, ShieldCheck, AreaChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const project = {
  project_name: "Downtown Office Building",
  project_number: "DOB-2025-001",
  location: "123 Main St, Chicago, IL",
  client: "ABC Development Corp",
  project_manager: "John Smith",
  start_date: "2025-01-15",
  end_date: "2025-12-15",
  budget: 2500000,
  status: "active",
  team_members: [
    { employee_id: "emp_001", name: "Mike Wilson", role: "Site Supervisor", certifications: ["OSHA 30", "First Aid"], contact: "555-0123" },
    { employee_id: "emp_002", name: "Jane Foster", role: "Lead Engineer", certifications: ["PE", "LEED AP"], contact: "555-0124" },
  ],
  equipment: [
    { equipment_id: "eq_001", name: "Caterpillar 320 Excavator", status: "Operational", daily_rate: 450 },
  ],
  tools: [
    { tool_id: "tool_001", name: "Hilti Hammer Drill", condition: "good", assigned_to: "Mike Wilson" },
  ],
  subcontractors: [
    { contractor_id: "sub_001", company: "Elite Electrical", trade: "electrical", contract_value: 75000 },
  ],
  phases: [
    { phase_id: "phase_001", name: "Foundation", status: "in_progress", percentage_complete: 65 },
    { phase_id: "phase_002", name: "Structural Steel", status: "not_started", percentage_complete: 0 },
  ],
  documents: [
    { doc_id: "doc_001", name: "Building Permit", type: "permit", expiry_date: "2026-01-10" },
    { doc_id: "doc_002", name: "JHSA-045", type: "safety_report", upload_date: "2025-03-15" },
  ],
  financials: {
    budget_vs_actual: 1850000,
    equipment_costs: 25000,
    subcontractor_payments: 45000,
  }
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" description="Manage all your construction projects.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </PageHeader>
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>{project.project_name} ({project.project_number})</CardTitle>
              <CardDescription>{project.location}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Project Manager</p>
                <p className="font-medium">{project.project_manager}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="font-medium">{project.start_date} - {project.end_date}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium">${project.budget.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resource Management</CardTitle>
              <CardDescription>Equipment schedules, tool assignments, and material tracking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><Wrench className="mr-2 h-5 w-5"/>Equipment</h3>
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Daily Rate</TableHead></TableRow></TableHeader>
                  <TableBody>{project.equipment.map(e => <TableRow key={e.equipment_id}><TableCell>{e.name}</TableCell><TableCell>{e.status}</TableCell><TableCell>${e.daily_rate}</TableCell></TableRow>)}</TableBody>
                </Table>
              </div>
               <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><HardHat className="mr-2 h-5 w-5"/>Tools</h3>
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Condition</TableHead><TableHead>Assigned To</TableHead></TableRow></TableHeader>
                  <TableBody>{project.tools.map(t => <TableRow key={t.tool_id}><TableCell>{t.name}</TableCell><TableCell>{t.condition}</TableCell><TableCell>{t.assigned_to}</TableCell></TableRow>)}</TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Administration</CardTitle>
              <CardDescription>Certifications, assignments, and contact info.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Certifications</TableHead><TableHead>Contact</TableHead></TableRow></TableHeader>
                  <TableBody>{project.team_members.map(t => <TableRow key={t.employee_id}><TableCell>{t.name}</TableCell><TableCell>{t.role}</TableCell><TableCell>{t.certifications.join(', ')}</TableCell><TableCell>{t.contact}</TableCell></TableRow>)}</TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="financials">
          <Card>
            <CardHeader>
              <CardTitle>Financial Tracking</CardTitle>
              <CardDescription>Budget vs actual, equipment costs, subcontractor payments.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground flex items-center"><DollarSign className="mr-2 h-4 w-4"/>Budget vs Actual</p>
                <p className="text-2xl font-bold">${project.financials.budget_vs_actual.toLocaleString()}</p>
              </div>
               <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground flex items-center"><Wrench className="mr-2 h-4 w-4"/>Equipment Costs</p>
                <p className="text-2xl font-bold">${project.financials.equipment_costs.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground flex items-center"><Users className="mr-2 h-4 w-4"/>Subcontractor Payments</p>
                <p className="text-2xl font-bold">${project.financials.subcontractor_payments.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Management</CardTitle>
              <CardDescription>Permits, insurance, safety reports, and inspections.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                  <TableHeader><TableRow><TableHead>Document Name</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                  <TableBody>{project.documents.map(d => <TableRow key={d.doc_id}><TableCell>{d.name}</TableCell><TableCell>{d.type.replace('_', ' ')}</TableCell><TableCell>{d.expiry_date || d.upload_date}</TableCell></TableRow>)}</TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Progress Reporting</CardTitle>
              <CardDescription>Phase completion, milestone tracking, and client updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {project.phases.map(p => (
                  <div key={p.phase_id}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.percentage_complete}%</p>
                    </div>
                    <Progress value={p.percentage_complete} />
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
