"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { FaUserEdit, FaCalendarCheck, FaBars, FaTimes } from "react-icons/fa";
import { Route } from "next";

export default function Sidebar() {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const params = useParams();
	const userId = params.id;

	// Derive a stable base user path (avoid using the current pathname)
	const userBase = `/user/${userId}`;

	const menuItems = [
		{
			label: "Edit Profile",
			href: `${userBase}`,
			icon: <FaUserEdit />,
		},
		{
			label: "Bookings",
			href: `${userBase}/bookings?userId=${userId}`,
			icon: <FaCalendarCheck />,
		},
	];

	return (
		<>
			{/* Toggle Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="md:hidden fixed top-4 left-4 z-50 text-2xl text-white bg-gray-800 p-2 rounded-lg"
			>
				{isOpen ? <FaTimes /> : <FaBars />}
			</button>

			{/* Sidebar */}
			<aside
				className={`fixed mr-6 top-0 left-0 h-screen w-64 bg-black border-r border-gray-600 transform transition-transform duration-300 ease-in-out z-40 
				${isOpen ? "translate-x-0" : "-translate-x-full"} 
				md:translate-x-0 md:relative`}
			>
				<div className="flex flex-col h-full">
					<h2 className="text-xl font-bold mb-6 text-white">Lorial Menu</h2>

					<nav className="flex flex-col max-md:mt-10 gap-3">
						{menuItems.map((item) => (
							<Link
								key={item.href}
								href={item.href as Route}
								className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition ${
									// Treat a menu item as active when the current pathname matches either
									// the full href (rare) or the href without query params.
									(() => {
										const hrefBase = item.href.split("?")[0];
										return pathname === item.href || pathname === hrefBase
											? "bg-gray-700 font-semibold"
											: "";
									})()
								}`}
								onClick={() => setIsOpen(false)} // auto close when selecting a link (mobile)
							>
								{item.icon}
								<span>{item.label}</span>
							</Link>
						))}
					</nav>

					<div className="mt-auto p-4 text-gray-400 text-sm">
						© {new Date().getFullYear()} Lorial
					</div>
				</div>
			</aside>

			{/* Background overlay for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</>
	);
}
