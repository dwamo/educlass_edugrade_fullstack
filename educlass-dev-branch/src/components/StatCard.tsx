import React from "react";

export type StatCardTone = "primary" | "blue" | "amber" | "emerald" | "purple" | "rose";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: StatCardTone;
  trend?: string;
}

const TONE_CLASSES: Record<StatCardTone, { chip: string; icon: string }> = {
  primary: { chip: "bg-primary/10", icon: "text-primary" },
  blue: { chip: "bg-blue-100", icon: "text-blue-600" },
  amber: { chip: "bg-amber-100", icon: "text-amber-600" },
  emerald: { chip: "bg-emerald-100", icon: "text-emerald-600" },
  purple: { chip: "bg-purple-100", icon: "text-purple-600" },
  rose: { chip: "bg-rose-100", icon: "text-rose-600" },
};

// Standard stat-tile used across the admin, lecturer, and student dashboards
// so a single visual tweak (radius, shadow, chip style) only has to be made once.
const StatCard: React.FC<StatCardProps> = ({ label, value, icon, tone = "primary", trend }) => {
  const toneClasses = TONE_CLASSES[tone];
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
          {trend && <p className="text-sm font-medium text-emerald-600 mt-1">{trend}</p>}
        </div>
        <div className={`${toneClasses.chip} ${toneClasses.icon} p-3 rounded-full text-xl leading-none`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
