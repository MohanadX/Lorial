"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

// Optional: you can just import toast directly if tree-shaking isn't a concern.
// import { toast } from "sonner";

let toastModule: typeof import("sonner") | null = null;

const getToast = async () => {
	if (!toastModule) {
		toastModule = await import("sonner");
	}
	return toastModule.toast;
};

export default function LoginToast({
	login,
	logout,
}: {
	login?: string;
	logout?: string;
}) {
	const [, startTransition] = useTransition()
	const router = useRouter();

	useEffect(() => {
		startTransition(async () => {
			if (login === "success") {
				const toast = await getToast();
				toast.success("🎉 Your login was successful!");
				router.refresh();
				router.replace("/", { scroll: false });
			} else if (logout === "success") {
				const toast = await getToast();
				toast.info("👋 Signed out successfully!");
				router.refresh();
				router.replace("/", { scroll: false });
			}
		});
	}, [login, logout, router]); // <-- add logout to deps

	return null;
}
