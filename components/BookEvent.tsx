"use client";

import { useState } from "react";

const BookEvent = () => {
	const [email, setEmail] = useState<string>("");
	const [submitted, setSubmitted] = useState<boolean>(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		setTimeout(() => setSubmitted(true), 1000);
	};

	return (
		<div id="book-event">
			{submitted ? (
				<p className="text-sm">Thank you For signing up!</p>
			) : (
				<form onSubmit={handleSubmit}>
					<div>
						<label htmlFor="email">Email Address</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter Your Email Address"
							id="email"
						/>

						<button type="submit" className="button-submit">
							Submit
						</button>
					</div>
				</form>
			)}
		</div>
	);
};

export default BookEvent;
