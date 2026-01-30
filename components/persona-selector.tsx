import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface PersonaSelectorProps {
  value: string;
  onChange: (val: string) => void;
  allowedPersonas?: string[];
}

const ALL_PERSONAS = [
  { key: "organizer", label: "Organizer" },
  { key: "teacher", label: "Teacher" },
  { key: "student", label: "Student" },
];

export default function PersonaSelector({ value, onChange, allowedPersonas }: PersonaSelectorProps) {
  const [selected, setSelected] = useState(value);
  
  // Filter personas based on allowed list, default to all if not specified
  const personas = allowedPersonas 
    ? ALL_PERSONAS.filter(p => allowedPersonas.includes(p.key))
    : ALL_PERSONAS;

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (persona: string) => {
    setSelected(persona);
    onChange(persona);
    localStorage.setItem("selectedPersona", persona);
  };

  return (
    <div className="flex gap-4 mb-6">
      {personas.map((p) => (
        <Button
          key={p.key}
          variant={selected === p.key ? "default" : "outline"}
          onClick={() => handleSelect(p.key)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
