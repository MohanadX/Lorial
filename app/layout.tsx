import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LightRays from "@/components/LightRays";
import Navbar from "@/components/Navbar";

const SchibstedGrotesk = localFont({
	src: [
		{
			path: "../public/fonts/schibsted-grotesk-latin-400-italic.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../public/fonts/schibsted-grotesk-latin-700-italic.woff2",
			weight: "700",
			style: "normal",
		},
	],
	variable: "--font-schibsted-grotesk",
	display: "swap",
});

const MartianMono = localFont({
	src: [
		{
			path: "../public/fonts/MartianMono-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../public/fonts/MartianMono-Bold.woff2",
			weight: "700",
			style: "normal",
		},
	],
	variable: "--font-martian-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Lorial – Developer Community Events Hub",
	description:
		"The Hub For every Developers events For better Development Future",
	openGraph: {
		title: "Lorial – Developer Community Events Hub",
		description:
			"The Hub For every Developers events For better Development Future",
		images: ["https://lorial.dev/favicon.ico"],
		siteName: "Lorial",
		type: "website",
	},
	other: {
		"application/ld+json": JSON.stringify({
			"@context": "http://schema.org",
			"@type": "WebSite",
			name: "Lorial",
			url: "https://lorial.dev",
			description:
				"A platform for developers to discover, share, and attend the latest developer community events.",
			publisher: {
				"@type": "Organization",
				name: "Lorial",
				logo: {
					"@type": "ImageObject",
					url: "https://lorial.dev/images/logo.png", // your logo URL
				},
			},
		}),
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${SchibstedGrotesk.variable} ${MartianMono.variable} min-h-screen antialiased`}
			>
				<Navbar />
				<div className="absolute inset-0 top-0 z-[-1] min-h-screen">
					<LightRays
						raysOrigin="top-center-offset"
						raysColor="#5dfece"
						raysSpeed={1.5}
						lightSpread={0.8}
						rayLength={1.2}
						followMouse={true}
						mouseInfluence={0.02}
						noiseAmount={0}
						distortion={0.05}
					/>
				</div>
				<main>{children}</main>
			</body>
		</html>
	);
}
