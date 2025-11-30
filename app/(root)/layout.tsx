import Provider from "@/components/QueryProvider";
import dynamic from "next/dynamic";
const Toaster = dynamic(() => import("sonner").then((mod) => mod.Toaster));

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Provider>{children}</Provider>
			<Toaster
				visibleToasts={1}
				closeButton
				richColors
				theme="dark"
				duration={4000}
				position="bottom-right"
			/>
		</>
	);
}
