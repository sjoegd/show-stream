import DashboardToaster from "@/components/dashboard-toaster";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

  return (
		<div className="flex h-screen w-full">
			<Sidebar />
			{children}
			<DashboardToaster />
		</div>
	);
}