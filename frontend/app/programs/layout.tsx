import DashboardLayout from '../dashboard/layout';

export default function ProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
