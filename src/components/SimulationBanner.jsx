import { useEffect, useState } from "react";
import { AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SimulationBanner() {
  const [simulating, setSimulating] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("adminTierSimulation");
    setSimulating(saved);
  }, []);

  const stopSimulation = () => {
    localStorage.removeItem("adminTierSimulation");
    window.location.reload();
  };

  if (!simulating) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-30 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">
            Simulating {simulating} Tier – Your real tier is Admin
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={stopSimulation}
          className="text-white hover:bg-white/20 gap-1 h-7 px-2"
        >
          <XCircle className="w-3 h-3" />
          Exit Simulation
        </Button>
      </div>
    </div>
  );
}