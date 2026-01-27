"use client"

// 1. Import the hook
import { useToast } from "@/hooks/use-toast" 

export default function OrganizerClassroomPage() {
    // 2. Initialize the hook
    const { toast } = useToast() 

    const handleCreateClassroom = async () => {
        // ... (your logic) ...
        
        if (success) {
            // 3. Trigger the toast
            toast({
                title: "Success",
                description: "Classroom created successfully!",
                variant: "default", // or just omit for default
            })
        } else {
            toast({
                title: "Error",
                description: "Failed to create classroom.",
                variant: "destructive", // Makes it red
            })
        }
    }

    return (
        // ... your JSX ...
    )
}