export interface EventItem {
	title: string;
	image: string;
	slug: string;
	location: string;
	date: string; // human-friendly date or range
	time: string; // human-friendly time
}

export const events: EventItem[] = [
	{
		title: "Frontend Meetup — Event 1",
		image: "/images/event1.png",
		slug: "frontend-meetup-event-1",
		location: "Berlin, Germany",
		date: "Nov 14, 2025",
		time: "18:30",
	},
	{
		title: "Full-Stack Hack Night",
		image: "/images/event2.png",
		slug: "fullstack-hack-night-2025",
		location: "London, UK",
		date: "Dec 03, 2025",
		time: "19:00",
	},
	{
		title: "Open Source Contributors Day",
		image: "/images/event3.png",
		slug: "open-source-contributors-day",
		location: "Remote",
		date: "Dec 10, 2025",
		time: "10:00 AM UTC",
	},
	{
		title: "AI & Web Summit",
		image: "/images/event4.png",
		slug: "ai-web-summit-2026",
		location: "Lisbon, Portugal",
		date: "Feb 12, 2026",
		time: "09:30",
	},
	{
		title: "Blockchain Builders Hackathon",
		image: "/images/event5.png",
		slug: "blockchain-builders-hackathon",
		location: "Berlin, Germany",
		date: "Mar 05–07, 2026",
		time: "All day",
	},
	{
		title: "Community Tech Night",
		image: "/images/event6.png",
		slug: "community-tech-night",
		location: "San Francisco, CA, USA",
		date: "Apr 07, 2026",
		time: "18:00",
	},
];

// Usage: import { events } from '@/lib/constants'
