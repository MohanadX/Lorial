// app/(dashboard)/layout.tsx
import Sidebar from "@/components/SideBar";

export const metadata = {
	title: "Lorial Account",
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<main className="flex-1 p-6">{children}</main>
		</div>
	);
}
