import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { PlusCircle } from "lucide-react";

const reports = [
  { id: 'REP-001', project: 'Alpha Tower', date: '2024-07-20', status: 'Open', reportedBy: 'John Doe' },
  { id: 'REP-002', project: 'Omega Bridge', date: '2024-07-19', status: 'Under Review', reportedBy: 'Jane Smith' },
  { id: 'REP-003', project: 'City Center Plaza', date: '2024-07-18', status: 'Closed', reportedBy: 'John Doe' },
  { id: 'REP-004', project: 'Alpha Tower', date: '2024-07-17', status: 'Closed', reportedBy: 'Peter Jones' },
  { id: 'REP-005', project: 'Seaport Expansion', date: '2024-07-16', status: 'Closed', reportedBy: 'John Doe' },
];

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Safety Reports" description="Track and manage all safety incidents and reports.">
        <Button asChild>
          <Link href="/dashboard/reports/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>A complete log of all submitted safety reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{report.project}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>
                    <Badge variant={report.status === 'Open' ? 'destructive' : report.status === 'Under Review' ? 'secondary' : 'default'}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.reportedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
