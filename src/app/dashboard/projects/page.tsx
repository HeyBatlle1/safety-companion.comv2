import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { PlusCircle } from "lucide-react";

const projects = [
  { id: 1, name: 'Alpha Tower', location: 'Metropolis', manager: 'Alice Johnson', status: 'Active' },
  { id: 2, name: 'Omega Bridge', location: 'Gotham City', manager: 'Bruce Wayne', status: 'Active' },
  { id: 3, name: 'City Center Plaza', location: 'Star City', manager: 'Oliver Queen', status: 'Planning' },
  { id: 4, name: 'Seaport Expansion', location: 'Coast City', manager: 'Hal Jordan', status: 'On Hold' },
  { id: 5, name: 'Residential Complex', location: 'Central City', manager: 'Barry Allen', status: 'Completed' },
];

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" description="Manage all your construction projects.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Project List</CardTitle>
          <CardDescription>A list of all projects managed in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Project Manager</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.location}</TableCell>
                  <TableCell>{project.manager}</TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'Active' ? 'default' : project.status === 'On Hold' ? 'destructive' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
