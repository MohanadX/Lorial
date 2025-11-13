import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<SessionProvider>{children}</SessionProvider>
			<Toaster
				closeButton
				richColors
				theme="dark"
				duration={4000}
				position="bottom-right"
			/>
		</>
	);
}
