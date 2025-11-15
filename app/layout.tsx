import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LightRays from "@/components/LightRays";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";
import Loader from "@/components/Loader";

const BASE_URL = process.env.BASE_URL;

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
	keywords: [
		"developer events",
		"tech conferences",
		"developer meetups",
		"Lorial",
		"software community",
		"frontend",
		"AI",
		"DevOps",
		"Kubernetes",
	],
	openGraph: {
		title: "Lorial – Developer Community Events Hub",
		description:
			"The Hub For every Developers events For better Development Future",
		images: [`${BASE_URL}/favicon.ico`],
		siteName: "Lorial",
		url: BASE_URL,
		type: "website",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-snippet": -1,
			"max-image-preview": "large",
			"max-video-preview": -1,
		},
	},
	other: {
		"application/ld+json": JSON.stringify({
			"@context": "http://schema.org",
			"@type": "WebSite",
			name: "Lorial",
			url: BASE_URL,
			description:
				"A platform for developers to discover, share, and attend the latest developer community events.",
			publisher: {
				"@type": "Organization",
				name: "Lorial",
				logo: {
					"@type": "ImageObject",
					url: `${BASE_URL}/favicon.ico`, // your logo URL
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
				className={`${SchibstedGrotesk.variable} ${MartianMono.variable} min-h-screen w-full antialiased`}
			>
				<Suspense fallback={<Loader type="navbar" />}>
					<Navbar />
				</Suspense>
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
