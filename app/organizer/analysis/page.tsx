
import { useEffect, useState } from "react";

export default function OrganizerAnalysisPage() {
	const [allowed, setAllowed] = useState(false);
	const [checked, setChecked] = useState(false);

	useEffect(() => {
		const persona = localStorage.getItem("selectedPersona");
		const userStr = localStorage.getItem("currentUser");
		let isApproved = false;
		if (userStr) {
			try {
				const user = JSON.parse(userStr);
				isApproved = user.role === "organizer" && (user.roleRequestStatus === "approved" || user.isApproved);
			} catch {}
		}
		setAllowed(persona === "organizer" && isApproved);
		setChecked(true);
	}, []);

	if (!checked) {
		return <div className="min-h-screen flex items-center justify-center bg-black text-white">Checking permissions...</div>;
	}
	if (!allowed) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">Access Denied</h2>
					<p>You must be an approved organizer and have selected the Organizer persona to view this page.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-black text-white">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-4">Organizer Analysis Page (Content TBD)</h2>
				<p>This page is only accessible to approved organizers with the Organizer persona selected.</p>
			</div>
		</div>
	);
}

