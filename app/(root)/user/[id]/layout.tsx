// app/(dashboard)/layout.tsx
import Sidebar from "@/components/SideBar";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Lorial Account",
	robots: {
		index: false,
		follow: false,
	},
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<section className="flex-1">{children}</section>
		</div>
	);
}
