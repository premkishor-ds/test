"use client";

import React from "react";

interface ComponentVisualPreviewProps {
  categorySlug?: string;
  partNumber?: string;
  name?: string;
  className?: string;
}

export const ComponentVisualPreview: React.FC<ComponentVisualPreviewProps> = ({
  categorySlug = "",
  partNumber = "",
  name = "",
  className = "",
}) => {
  const slug = categorySlug.toLowerCase();
  const part = partNumber.toUpperCase();

  // 1. MOTORS & POWERTRAIN
  if (slug.includes("motor") || part.startsWith("MTR")) {
    const isHighPower = part.includes("010") || name.includes("10HP");
    const isMediumPower = part.includes("005") || name.includes("5HP");
    const accentColor = isHighPower ? "#38bdf8" : isMediumPower ? "#06b6d4" : "#22d3ee";

    return (
      <div className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1527] to-[#070b14] border border-slate-800/80 ${className}`}>
        {/* Ambient radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        <svg viewBox="0 0 240 140" className="w-full h-full max-h-[130px] p-2 transition-transform duration-500 group-hover:scale-105" fill="none">
          {/* Subtle Ground Grid */}
          <ellipse cx="120" cy="115" rx="75" ry="16" fill="rgba(6,182,212,0.06)" />
          <ellipse cx="120" cy="115" rx="55" ry="10" stroke="rgba(56,189,248,0.15)" strokeDasharray="3 3" />

          {/* Motor Mounting Foot Plate */}
          <rect x="70" y="98" width="85" height="10" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <circle cx="80" cy="103" r="2.5" fill="#475569" />
          <circle cx="145" cy="103" r="2.5" fill="#475569" />

          {/* Main Cylindrical Motor Housing */}
          <rect x="75" y="44" width="75" height="56" rx="8" fill="url(#motorGrad)" stroke="#475569" strokeWidth="1.5" />

          {/* Cooling Fin Slits */}
          {[84, 91, 98, 105, 112, 119, 126, 133, 140].map((x) => (
            <line key={x} x1={x} y1="48" x2={x} y2="96" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          ))}

          {/* Front Endshield Bell & Flange */}
          <path d="M150 48 L168 56 L168 88 L150 96 Z" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
          <ellipse cx="168" cy="72" rx="4" ry="16" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

          {/* Output Drive Shaft & Keyway */}
          <rect x="172" y="67" width="28" height="10" rx="2" fill="url(#shaftGrad)" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="176" y1="72" x2="196" y2="72" stroke="#64748b" strokeWidth="1.5" />
          {/* Keyway */}
          <rect x="180" y="66" width="10" height="2" fill="#334155" />

          {/* Shaft Rotation Dynamic Indicator */}
          <path d="M192 60 A 14 14 0 0 1 192 84" stroke={accentColor} strokeWidth="1.5" strokeDasharray="3 2" />
          <polygon points="190,83 194,86 195,81" fill={accentColor} />

          {/* Terminal Connection Box */}
          <rect x="90" y="32" width="36" height="14" rx="2" fill="#0f172a" stroke={accentColor} strokeWidth="1.2" />
          <circle cx="108" cy="39" r="2.5" fill={accentColor} />

          {/* Rear Fan Shroud */}
          <path d="M75 50 L60 56 L60 88 L75 94 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <ellipse cx="60" cy="72" rx="3" ry="16" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <line x1="57" y1="64" x2="57" y2="80" stroke="#475569" strokeWidth="1.5" />

          {/* Specs Badge Overlay */}
          <g transform="translate(18, 22)">
            <rect width="52" height="18" rx="4" fill="#090e1a" stroke="#1e293b" />
            <text x="26" y="13" textAnchor="middle" fill={accentColor} fontSize="9" fontFamily="monospace" fontWeight="bold">
              {isHighPower ? "10 HP" : isMediumPower ? "5 HP" : "2 HP"}
            </text>
          </g>

          <defs>
            <linearGradient id="motorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="40%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="shaftGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 2. CONVEYORS & BEDS
  if (slug.includes("conveyor") || part.startsWith("CVY")) {
    const isLong = part.includes("006") || name.includes("6m");
    const isMedium = part.includes("004") || name.includes("4m");
    const lengthTag = isLong ? "6.0 METERS" : isMedium ? "4.0 METERS" : "2.0 METERS";

    return (
      <div className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1527] to-[#070b14] border border-slate-800/80 ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <svg viewBox="0 0 240 140" className="w-full h-full max-h-[130px] p-2 transition-transform duration-500 group-hover:scale-105" fill="none">
          <ellipse cx="120" cy="116" rx="85" ry="14" fill="rgba(16,185,129,0.06)" />

          {/* Aluminum Extrusion Side Rails */}
          <rect x="25" y="65" width="190" height="14" rx="2" fill="#334155" stroke="#475569" strokeWidth="1.5" />
          <line x1="25" y1="72" x2="215" y2="72" stroke="#1e293b" strokeWidth="2" />

          {/* Support Legs */}
          <rect x="45" y="79" width="8" height="34" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
          <rect x="187" y="79" width="8" height="34" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
          <line x1="41" y1="113" x2="57" y2="113" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          <line x1="183" y1="113" x2="199" y2="113" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />

          {/* Top PVC Belt Surface */}
          <rect x="30" y="55" width="180" height="12" rx="3" fill="#065f46" stroke="#059669" strokeWidth="1.2" />

          {/* Modular Belt Flight Links */}
          {[42, 60, 78, 96, 114, 132, 150, 168, 186, 204].map((x) => (
            <line key={x} x1={x} y1="56" x2={x} y2="66" stroke="#10b981" strokeWidth="1" opacity="0.6" />
          ))}

          {/* End Rollers */}
          <circle cx="32" cy="62" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="32" cy="62" r="3" fill="#10b981" />
          <circle cx="208" cy="62" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="208" cy="62" r="3" fill="#10b981" />

          {/* Motion Velocity Arrows */}
          <path d="M100 48 L130 48 M125 44 L132 48 L125 52" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Length Tag */}
          <g transform="translate(85, 96)">
            <rect width="70" height="16" rx="4" fill="#090e1a" stroke="#065f46" />
            <text x="35" y="12" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">
              {lengthTag}
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 3. SENSORS & TELEMETRY
  if (slug.includes("sensor") || slug.includes("optics") || part.startsWith("SNS") || part.startsWith("OPT")) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1527] to-[#070b14] border border-slate-800/80 ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent pointer-events-none" />

        <svg viewBox="0 0 240 140" className="w-full h-full max-h-[130px] p-2 transition-transform duration-500 group-hover:scale-105" fill="none">
          <ellipse cx="120" cy="115" rx="70" ry="14" fill="rgba(244,63,94,0.06)" />

          {/* Sensor Mounting Bracket */}
          <rect x="55" y="80" width="30" height="32" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <circle cx="70" cy="96" r="4" fill="#0f172a" stroke="#475569" strokeWidth="1" />

          {/* Cylindrical M18 Barrel Sensor Body */}
          <rect x="65" y="55" width="85" height="22" rx="3" fill="url(#sensorBrassGrad)" stroke="#d97706" strokeWidth="1.5" />

          {/* Thread Grooves */}
          {[72, 78, 84, 90, 96, 102, 108, 114, 120, 126, 132, 138].map((x) => (
            <line key={x} x1={x} y1="56" x2={x} y2="76" stroke="#78350f" strokeWidth="1.2" opacity="0.6" />
          ))}

          {/* Locknuts */}
          <rect x="80" y="50" width="12" height="32" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1.2" />
          <rect x="110" y="50" width="12" height="32" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1.2" />

          {/* Optical Front Cap & Lens */}
          <rect x="150" y="57" width="8" height="18" rx="2" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" />
          <circle cx="154" cy="66" r="3.5" fill="#f43f5e" />

          {/* Emitted Laser Beam / Optical Field */}
          <polygon points="158,66 220,44 220,88" fill="url(#laserConeGrad)" opacity="0.4" />
          <line x1="158" y1="66" x2="225" y2="66" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* Status Telemetry LED */}
          <circle cx="58" cy="66" r="3" fill="#10b981" />
          <circle cx="58" cy="66" r="6" stroke="#10b981" strokeWidth="1" opacity="0.6" />

          {/* Connecting Cable */}
          <path d="M55 66 C40 66, 32 80, 25 90" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

          <defs>
            <linearGradient id="sensorBrassGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="laserConeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 4. CONTROLS, HMIS & AUTOMATION
  if (slug.includes("control") || part.startsWith("CTR")) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1527] to-[#070b14] border border-slate-800/80 ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

        <svg viewBox="0 0 240 140" className="w-full h-full max-h-[130px] p-2 transition-transform duration-500 group-hover:scale-105" fill="none">
          <ellipse cx="120" cy="118" rx="65" ry="12" fill="rgba(59,130,246,0.06)" />

          {/* Stand / Articulated Pendant Arm */}
          <rect x="114" y="94" width="12" height="24" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <ellipse cx="120" cy="116" rx="24" ry="5" fill="#334155" stroke="#475569" strokeWidth="1" />

          {/* Stainless Steel NEMA Bezel Enclosure */}
          <rect x="52" y="32" width="136" height="66" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />

          {/* High-Resolution Color Touchscreen Display */}
          <rect x="62" y="40" width="116" height="50" rx="3" fill="#090d18" stroke="#38bdf8" strokeWidth="1" />

          {/* Live Waveform UI Graphic */}
          <path d="M68 68 L82 68 L88 52 L94 80 L102 62 L108 68 L140 68" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M68 80 L88 80 L96 72 L106 82 L120 78 L140 80" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Telemetry Metric Widgets on Screen */}
          <rect x="146" y="44" width="26" height="18" rx="2" fill="#0f172a" stroke="#1e293b" />
          <text x="159" y="56" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">98.4%</text>

          <rect x="146" y="66" width="26" height="18" rx="2" fill="#0f172a" stroke="#1e293b" />
          <text x="159" y="78" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">RUN</text>

          {/* Physical Start / Stop Pushbuttons */}
          <circle cx="196" cy="46" r="4.5" fill="#10b981" stroke="#059669" strokeWidth="1.5" />
          <circle cx="196" cy="58" r="4.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
          <rect x="192" y="70" width="8" height="8" rx="1.5" fill="#f59e0b" />
        </svg>
      </div>
    );
  }

  // 5. SAFETY & GUARDING
  if (slug.includes("safety") || part.startsWith("SFT")) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1527] to-[#070b14] border border-slate-800/80 ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <svg viewBox="0 0 240 140" className="w-full h-full max-h-[130px] p-2 transition-transform duration-500 group-hover:scale-105" fill="none">
          <ellipse cx="120" cy="118" rx="75" ry="12" fill="rgba(245,158,11,0.06)" />

          {/* Yellow Safety Posts */}
          <rect x="45" y="32" width="10" height="84" rx="2" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
          <rect x="185" y="32" width="10" height="84" rx="2" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
          <rect x="38" y="112" width="24" height="6" rx="1.5" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
          <rect x="178" y="112" width="24" height="6" rx="1.5" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />

          {/* Top & Bottom Yellow Horizontal Rails */}
          <rect x="55" y="36" width="130" height="7" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
          <rect x="55" y="102" width="130" height="7" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />

          {/* Wire Mesh Interlocking Grid */}
          <rect x="56" y="44" width="128" height="57" fill="#090e1a" opacity="0.6" />
          {[66, 78, 90, 102, 114, 126, 138, 150, 162, 174].map((x) => (
            <line key={x} x1={x} y1="44" x2={x} y2="101" stroke="#ca8a04" strokeWidth="1" opacity="0.5" />
          ))}
          {[52, 60, 68, 76, 84, 92].map((y) => (
            <line key={y} x1="56" y1={y} x2="184" y2={y} stroke="#ca8a04" strokeWidth="1" opacity="0.5" />
          ))}

          {/* Emergency Stop Button Mounted */}
          <circle cx="120" cy="72" r="14" fill="#0f172a" stroke="#eab308" strokeWidth="2" />
          <circle cx="120" cy="72" r="9" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
          <circle cx="120" cy="72" r="4" fill="#f87171" />

          {/* OSHA Hazard Stripes */}
          <path d="M47 38 L53 44 M47 48 L53 54 M47 58 L53 64" stroke="#000" strokeWidth="2" />
          <path d="M187 38 L193 44 M187 48 L193 54 M187 58 L193 64" stroke="#000" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // 6. TOOLING, ROBOTICS, ACTUATORS & FEED (Default Machinery Tooling)
  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1527] to-[#070b14] border border-slate-800/80 ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

      <svg viewBox="0 0 240 140" className="w-full h-full max-h-[130px] p-2 transition-transform duration-500 group-hover:scale-105" fill="none">
        <ellipse cx="120" cy="116" rx="65" ry="12" fill="rgba(99,102,241,0.06)" />

        {/* Machine Mounting Flange */}
        <rect x="75" y="32" width="90" height="12" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <circle cx="85" cy="38" r="2.5" fill="#64748b" />
        <circle cx="155" cy="38" r="2.5" fill="#64748b" />

        {/* High-Speed Spindle / Articulated Joint Housing */}
        <rect x="92" y="44" width="56" height="42" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
        <line x1="92" y1="58" x2="148" y2="58" stroke="#1e293b" strokeWidth="2" />
        <line x1="92" y1="72" x2="148" y2="72" stroke="#1e293b" strokeWidth="2" />

        {/* ISO 30 Toolholder Collet Chuck */}
        <polygon points="100,86 140,86 132,106 108,106" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />

        {/* High-Performance Carbide Endmill / Dispenser Tip */}
        <rect x="116" y="106" width="8" height="18" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
        <line x1="116" y1="112" x2="124" y2="114" stroke="#94a3b8" strokeWidth="1" />
        <line x1="116" y1="118" x2="124" y2="120" stroke="#94a3b8" strokeWidth="1" />

        {/* Dynamic Rotation or Precision Indicator */}
        <ellipse cx="120" cy="100" rx="20" ry="4" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 2" />
        <polygon points="138,101 142,98 141,104" fill="#818cf8" />
      </svg>
    </div>
  );
};
