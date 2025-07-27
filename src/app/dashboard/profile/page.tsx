import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const certifications = [
  { id: 1, name: 'OSHA 30-Hour Construction', issueDate: '2023-01-15', expiryDate: '2026-01-15', status: 'Active' },
  { id: 2, name: 'Certified Safety Professional (CSP)', issueDate: '2022-06-01', expiryDate: '2025-06-01', status: 'Active' },
  { id: 3, name: 'Forklift Operator License', issueDate: '2024-07-01', expiryDate: '2024-07-31', status: 'Expiring Soon' },
  { id: 4, name: 'First Aid/CPR', issueDate: '2022-05-20', expiryDate: '2024-05-20', status: 'Expired' },
];

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="User Profile" description="Manage your personal information and certifications." />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
           <Card>
                <CardHeader className="items-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="@shadcn" data-ai-hint="person avatar" />
                        <AvatarFallback className="text-3xl">JD</AvatarFallback>
                    </Avatar>
                    <CardTitle>John Doe</CardTitle>
                    <CardDescription>Project Manager</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    <div className="flex justify-between py-2 border-b"><span>Email</span><span className="font-medium text-foreground">john.doe@example.com</span></div>
                    <div className="flex justify-between py-2 border-b"><span>Company</span><span className="font-medium text-foreground">Acme Construction</span></div>
                    <div className="flex justify-between pt-2"><span>Role</span><span className="font-medium text-foreground">Project Manager</span></div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Certifications</CardTitle>
                    <CardDescription>Your current and past certifications.</CardDescription>
                </div>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Certification
                </Button>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Certification Name</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {certifications.map((cert) => (
                        <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.name}</TableCell>
                        <TableCell>{cert.expiryDate}</TableCell>
                        <TableCell>
                            <Badge variant={cert.status === 'Active' ? 'default' : cert.status === 'Expired' ? 'destructive' : 'secondary'}>
                            {cert.status}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
