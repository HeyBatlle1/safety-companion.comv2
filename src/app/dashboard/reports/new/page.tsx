import { PageHeader } from "@/components/page-header";
import { ReportForm } from "./report-form";

export default function NewReportPage() {
  return (
    <>
      <PageHeader
        title="Create New Safety Report"
        description="Use our AI assistant to help you draft a comprehensive report."
      />
      <ReportForm />
    </>
  );
}
