"use client";

import React from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface BaseMachineMeshProps {
  wireframe?: boolean;
}

export const BaseMachineMesh: React.FC<BaseMachineMeshProps> = ({ wireframe = false }) => {
  const storeWireframe = useConfiguratorStore((s) => s.wireframeMode);
  const machine = useConfiguratorStore((s) => s.machine);
  const isWire = wireframe || storeWireframe;

  const matChassis = isWire ? industrialMaterials.wireframeMat : industrialMaterials.chassisSteel;
  const matAluminum = isWire ? industrialMaterials.wireframeMat : industrialMaterials.brushedAluminum;
  const matChrome = isWire ? industrialMaterials.wireframeMat : industrialMaterials.polishedChrome;
  const matYellow = isWire ? industrialMaterials.wireframeMat : industrialMaterials.safetyYellow;
  const matGranite = isWire ? industrialMaterials.wireframeMat : industrialMaterials.graniteBlack;
  const matOrange = isWire ? industrialMaterials.wireframeMat : industrialMaterials.industrialOrange;
  const matHydraulic = isWire ? industrialMaterials.wireframeMat : industrialMaterials.hydraulicDark;

  const slug = machine?.slug || "mx-500";

  // 1. CNC-3000: 5-Axis Heavy Milling Center
  if (slug === "cnc-3000") {
    return (
      <group position={[0, 0, 0]} name="CNC_3000_CHASSIS">
        {/* Mineral-Casting Base Bed (Massive polymer concrete bed) */}
        <mesh position={[0, 0.45, 0]} material={matChassis} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.7, 2.0]} />
        </mesh>
        {/* Foundation Leveling Wedges */}
        {[-1.1, 0, 1.1].map((x) =>
          [-0.8, 0.8].map((z) => (
            <mesh key={`pad-${x}-${z}`} position={[x, 0.05, z]} material={matChrome}>
              <cylinderGeometry args={[0.09, 0.1, 0.1, 16]} />
            </mesh>
          ))
        )}
        {/* T-Slot Precision Machining Table */}
        <mesh position={[0, 0.85, 0]} material={matChrome} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.12, 1.1]} />
        </mesh>
        {/* T-slots grooves visual detailing */}
        {[-0.35, -0.15, 0.05, 0.25, 0.45].map((z, idx) => (
          <mesh key={`tslot-${idx}`} position={[0, 0.915, z]} material={matChassis}>
            <boxGeometry args={[1.48, 0.015, 0.025]} />
          </mesh>
        ))}
        {/* Dual Heavy Gantry Columns (Left & Right) */}
        <mesh position={[-0.95, 1.45, 0]} material={matChassis} castShadow>
          <boxGeometry args={[0.35, 1.3, 1.4]} />
        </mesh>
        <mesh position={[0.95, 1.45, 0]} material={matChassis} castShadow>
          <boxGeometry args={[0.35, 1.3, 1.4]} />
        </mesh>
        {/* Upper Gantry Crossbeam (Bridge) */}
        <mesh position={[0, 2.05, 0]} material={matChassis} castShadow>
          <boxGeometry args={[2.25, 0.4, 0.7]} />
        </mesh>
        {/* Precision Linear Guideways (Dual THK rails) */}
        <mesh position={[0, 2.15, 0.36]} material={matChrome}>
          <boxGeometry args={[1.9, 0.04, 0.03]} />
        </mesh>
        <mesh position={[0, 1.95, 0.36]} material={matChrome}>
          <boxGeometry args={[1.9, 0.04, 0.03]} />
        </mesh>
        {/* Z-Axis Vertical Saddle Carriage */}
        <mesh position={[0, 1.85, 0.45]} material={matAluminum} castShadow>
          <boxGeometry args={[0.45, 0.55, 0.25]} />
        </mesh>
        {/* Telescopic Stainless Chip Bellows */}
        <mesh position={[-0.55, 2.05, 0.37]} material={matAluminum}>
          <boxGeometry args={[0.65, 0.32, 0.02]} />
        </mesh>
        <mesh position={[0.55, 2.05, 0.37]} material={matAluminum}>
          <boxGeometry args={[0.65, 0.32, 0.02]} />
        </mesh>
        {/* Coolant Collection Basin & Chip Auger Gutter */}
        <mesh position={[0, 0.2, 0.85]} material={matHydraulic}>
          <boxGeometry args={[2.2, 0.2, 0.25]} />
        </mesh>
        {/* High-visibility safety accent stripe */}
        <mesh position={[0, 2.26, 0.36]} material={matYellow}>
          <boxGeometry args={[2.25, 0.02, 0.02]} />
        </mesh>
      </group>
    );
  }

  // 2. PK-1200: High-Speed Delta Pick & Place Robot
  if (slug === "pk-1200") {
    return (
      <group position={[0, 0, 0]} name="PK_1200_CHASSIS">
        {/* 3 Heavy Triangular Tubular Uprights (120° apart) */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => {
          const radius = 0.95;
          const x = radius * Math.cos(angle);
          const z = radius * Math.sin(angle);
          return (
            <group key={`pylon-${idx}`} position={[x, 1.1, z]}>
              <mesh material={matChassis} castShadow>
                <cylinderGeometry args={[0.06, 0.08, 2.2, 16]} />
              </mesh>
              <mesh position={[0, -1.05, 0]} material={matChrome}>
                <cylinderGeometry args={[0.12, 0.14, 0.08, 16]} />
              </mesh>
            </group>
          );
        })}
        {/* Upper Mounting Gantry Apex Ring (Suspension Platform) */}
        <mesh position={[0, 2.15, 0]} material={matChassis} castShadow>
          <cylinderGeometry args={[0.85, 0.85, 0.12, 6]} />
        </mesh>
        {/* Circular Inner Cutout Rim */}
        <mesh position={[0, 2.15, 0]} material={matAluminum}>
          <torusGeometry args={[0.55, 0.04, 12, 32]} />
        </mesh>
        {/* Gantry Reinforcement Diagonal Struts */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => {
          return (
            <mesh
              key={`strut-${idx}`}
              position={[0.45 * Math.cos(angle), 1.95, 0.45 * Math.sin(angle)]}
              rotation={[0, -angle, 0.45]}
              material={matAluminum}
            >
              <boxGeometry args={[0.05, 0.5, 0.05]} />
            </mesh>
          );
        })}
        {/* Lower Infeed Product Deck (Stainless drip tray) */}
        <mesh position={[0, 0.5, 0]} material={matAluminum} receiveShadow>
          <boxGeometry args={[1.8, 0.08, 0.85]} />
        </mesh>
        {/* Yellow Safety Alert Strips on Upper Gantry */}
        <mesh position={[0, 2.22, 0]} material={matYellow}>
          <torusGeometry args={[0.82, 0.015, 8, 32]} />
        </mesh>
      </group>
    );
  }

  // 3. AGV-500: Autonomous Mobile Tugger
  if (slug === "agv-500") {
    return (
      <group position={[0, 0, 0]} name="AGV_500_CHASSIS">
        {/* Main Low-Profile Welded Steel Monocoque Hull */}
        <mesh position={[0, 0.28, 0]} material={matChassis} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.32, 0.8]} />
        </mesh>
        {/* Front & Rear Soft Safety Bumpers */}
        <mesh position={[0.77, 0.22, 0]} material={matYellow} castShadow>
          <boxGeometry args={[0.06, 0.18, 0.78]} />
        </mesh>
        <mesh position={[-0.77, 0.22, 0]} material={matYellow} castShadow>
          <boxGeometry args={[0.06, 0.18, 0.78]} />
        </mesh>
        {/* Top T-Slot Aluminum Mounting Deck */}
        <mesh position={[0, 0.45, 0]} material={matAluminum} castShadow receiveShadow>
          <boxGeometry args={[1.44, 0.03, 0.76]} />
        </mesh>
        {/* Recessed Left & Right Drive Wheel Well Openings */}
        <mesh position={[0, 0.16, 0.41]} rotation={[Math.PI / 2, 0, 0]} material={matGranite}>
          <cylinderGeometry args={[0.14, 0.14, 0.08, 24]} />
        </mesh>
        <mesh position={[0, 0.16, -0.41]} rotation={[Math.PI / 2, 0, 0]} material={matGranite}>
          <cylinderGeometry args={[0.14, 0.14, 0.08, 24]} />
        </mesh>
        {/* Front & Rear Heavy Swivel Casters */}
        {[-0.6, 0.6].map((x, idx) => (
          <group key={`caster-${idx}`} position={[x, 0.08, 0]}>
            <mesh material={matChrome}>
              <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
            </mesh>
          </group>
        ))}
        {/* Front LiDAR Sensor Recess Niche */}
        <mesh position={[0.74, 0.28, 0]} material={matChassis}>
          <boxGeometry args={[0.08, 0.14, 0.25]} />
        </mesh>
        {/* 360-Degree Safety LED Status Light Strip */}
        <mesh position={[0, 0.43, 0.405]} material={matYellow}>
          <boxGeometry args={[1.48, 0.02, 0.01]} />
        </mesh>
        <mesh position={[0, 0.43, -0.405]} material={matYellow}>
          <boxGeometry args={[1.48, 0.02, 0.01]} />
        </mesh>
      </group>
    );
  }

  // 4. INJ-450: Hydraulic-Electric Injection Molding Machine
  if (slug === "inj-450") {
    return (
      <group position={[0, 0, 0]} name="INJ_450_CHASSIS">
        {/* Elongated Heavy Bed Foundation (5.4m total) */}
        <mesh position={[0, 0.38, 0]} material={matChassis} castShadow receiveShadow>
          <boxGeometry args={[4.8, 0.65, 1.4]} />
        </mesh>
        {/* Foundation Anchor Studs */}
        {[-2.1, -1.0, 0.0, 1.0, 2.1].map((x) =>
          [-0.6, 0.6].map((z) => (
            <mesh key={`inj-pad-${x}-${z}`} position={[x, 0.04, z]} material={matChrome}>
              <cylinderGeometry args={[0.08, 0.09, 0.08, 16]} />
            </mesh>
          ))
        )}

        {/* CLAMP UNIT (Left Side: x from -2.2 to -0.2) */}
        {/* Rear Toggle Thrust Platen */}
        <mesh position={[-2.1, 1.15, 0]} material={matHydraulic} castShadow>
          <boxGeometry args={[0.35, 0.9, 1.1]} />
        </mesh>
        {/* Front Stationary Mold Platen */}
        <mesh position={[-0.3, 1.15, 0]} material={matHydraulic} castShadow>
          <boxGeometry args={[0.4, 0.95, 1.15]} />
        </mesh>
        {/* Center Moving Mold Platen */}
        <mesh position={[-1.15, 1.15, 0]} material={matAluminum} castShadow>
          <boxGeometry args={[0.3, 0.9, 1.1]} />
        </mesh>
        {/* 4 Massive High-Tensile Chrome Tie Bars */}
        {[
          [-0.45, 0.4],
          [-0.45, -0.4],
          [0.45, 0.4],
          [0.45, -0.4],
        ].map(([yOffset, zOffset], idx) => (
          <mesh
            key={`tiebar-${idx}`}
            position={[-1.2, 1.15 + yOffset, zOffset]}
            rotation={[0, 0, Math.PI / 2]}
            material={matChrome}
          >
            <cylinderGeometry args={[0.05, 0.05, 2.1, 24]} />
          </mesh>
        ))}

        {/* INJECTION UNIT (Right Side: x from 0 to 2.2) */}
        {/* Injection Carriage Linear Slide Rails */}
        <mesh position={[1.2, 0.74, 0.35]} material={matChrome}>
          <boxGeometry args={[2.0, 0.06, 0.06]} />
        </mesh>
        <mesh position={[1.2, 0.74, -0.35]} material={matChrome}>
          <boxGeometry args={[2.0, 0.06, 0.06]} />
        </mesh>
        {/* Insulated Heating Barrel Cover Shroud */}
        <mesh position={[0.7, 1.25, 0]} rotation={[0, 0, Math.PI / 2]} material={matAluminum} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 1.4, 24]} />
        </mesh>
        {/* Resin Pellet Hopper Feed Throat Adapter */}
        <mesh position={[1.3, 1.5, 0]} material={matAluminum}>
          <cylinderGeometry args={[0.18, 0.12, 0.35, 16]} />
        </mesh>
        {/* Yellow Safety Clamp Enclosure Edge */}
        <mesh position={[-1.2, 1.65, 0.6]} material={matYellow}>
          <boxGeometry args={[1.9, 0.04, 0.04]} />
        </mesh>
      </group>
    );
  }

  // 5. WLD-600: Robotic Fiber Laser Welding Cell
  if (slug === "wld-600") {
    return (
      <group position={[0, 0, 0]} name="WLD_600_CHASSIS">
        {/* Heavy Base Machine Plinth */}
        <mesh position={[0, 0.25, 0]} material={matChassis} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.45, 2.2]} />
        </mesh>
        {/* Class-1 Laser Safety Cabin Corner Posts */}
        {[
          [-1.25, -1.05],
          [-1.25, 1.05],
          [1.25, -1.05],
          [1.25, 1.05],
        ].map(([x, z], idx) => (
          <mesh key={`post-${idx}`} position={[x, 1.35, z]} material={matChassis} castShadow>
            <boxGeometry args={[0.08, 1.8, 0.08]} />
          </mesh>
        ))}
        {/* Laser Protective Enclosure Panels (Rear & Sides) */}
        <mesh position={[0, 1.35, -1.05]} material={matGranite}>
          <boxGeometry args={[2.45, 1.6, 0.02]} />
        </mesh>
        <mesh position={[-1.25, 1.35, 0]} material={matGranite}>
          <boxGeometry args={[0.02, 1.6, 2.05]} />
        </mesh>
        {/* Front Observation Safety Glass Tint (Green/Gold Laser Rated) */}
        <mesh position={[0, 1.35, 1.05]} material={industrialMaterials.hmiScreen}>
          <boxGeometry args={[1.6, 1.1, 0.015]} />
        </mesh>
        {/* Center Dual-Station Rotary Turntable Bed Plinth */}
        <mesh position={[0, 0.52, 0.35]} material={matHydraulic} castShadow>
          <cylinderGeometry args={[0.65, 0.7, 0.15, 32]} />
        </mesh>
        <mesh position={[0, 0.61, 0.35]} material={matAluminum} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.04, 32]} />
        </mesh>
        {/* Center Partition Baffle on Turntable */}
        <mesh position={[0, 0.85, 0.35]} material={matAluminum}>
          <boxGeometry args={[0.03, 0.45, 1.18]} />
        </mesh>
        {/* Robot Pedestal Plinth at Rear */}
        <mesh position={[0, 0.6, -0.5]} material={matChassis} castShadow>
          <cylinderGeometry args={[0.35, 0.38, 0.35, 24]} />
        </mesh>
        {/* Overhead Fume Exhaust Extraction Collar */}
        <mesh position={[0, 2.25, 0]} material={matAluminum}>
          <cylinderGeometry args={[0.2, 0.24, 0.3, 24]} />
        </mesh>
        {/* Safety Warning Beacon Mount Bar */}
        <mesh position={[1.2, 2.25, 1.0]} material={matYellow}>
          <boxGeometry args={[0.04, 0.2, 0.04]} />
        </mesh>
      </group>
    );
  }

  // 6. PLZ-800: High-Payload End-of-Line Palletizer
  if (slug === "plz-800") {
    return (
      <group position={[0, 0, 0]} name="PLZ_800_CHASSIS">
        {/* Massive Reinforced Foundation Bed Plate */}
        <mesh position={[0, 0.15, 0]} material={matChassis} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.25, 2.8]} />
        </mesh>
        {/* Main Robot Plinth Pedestal (Center) */}
        <mesh position={[0, 0.55, 0]} material={matChassis} castShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.65, 32]} />
        </mesh>
        {/* Radial Web Gussets on Plinth */}
        {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((ang, idx) => (
          <mesh
            key={`gus-${idx}`}
            position={[0, 0.45, 0]}
            rotation={[0, ang, 0]}
            material={matChassis}
          >
            <boxGeometry args={[1.15, 0.45, 0.04]} />
          </mesh>
        ))}
        {/* Empty Pallet Infeed Guide Rails (Left side: x = -1.4) */}
        <mesh position={[-1.4, 0.32, 0.45]} material={matAluminum}>
          <boxGeometry args={[0.05, 0.12, 1.4]} />
        </mesh>
        <mesh position={[-1.4, 0.32, -0.45]} material={matAluminum}>
          <boxGeometry args={[0.05, 0.12, 1.4]} />
        </mesh>
        {/* Pallet Locating Floor Stop Blocks */}
        <mesh position={[-1.4, 0.35, 0]} material={matYellow}>
          <boxGeometry args={[0.1, 0.15, 0.8]} />
        </mesh>
        {/* Full-Height Perimeter Safety Enclosure Uprights */}
        {[
          [-1.6, -1.35],
          [-1.6, 1.35],
          [1.6, -1.35],
          [1.6, 1.35],
        ].map(([x, z], idx) => (
          <mesh key={`penc-${idx}`} position={[x, 1.25, z]} material={matYellow}>
            <boxGeometry args={[0.06, 2.2, 0.06]} />
          </mesh>
        ))}
      </group>
    );
  }

  // 7. PRS-250: Precision Servo-Mechanical Stamping Press
  if (slug === "prs-250") {
    return (
      <group position={[0, 0, 0]} name="PRS_250_CHASSIS">
        {/* Heavy Press Lower Bed Bolster Casting */}
        <mesh position={[0, 0.45, 0]} material={matChassis} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.85, 1.8]} />
        </mesh>
        {/* Bolster Plate (Hardened Ground Steel) */}
        <mesh position={[0, 0.9, 0]} material={matChrome} castShadow>
          <boxGeometry args={[1.5, 0.1, 1.3]} />
        </mesh>
        {/* 4 Massive Tie-Rod Upright Columns */}
        {[
          [-0.8, -0.7],
          [-0.8, 0.7],
          [0.8, -0.7],
          [0.8, 0.7],
        ].map(([x, z], idx) => (
          <mesh key={`col-${idx}`} position={[x, 1.85, z]} material={matChassis} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 1.8, 24]} />
          </mesh>
        ))}
        {/* Precision Bronze Gib Slide Guides on Columns */}
        {[
          [-0.7, 0],
          [0.7, 0],
        ].map(([x, z], idx) => (
          <mesh key={`gib-${idx}`} position={[x, 1.7, z]} material={matAluminum}>
            <boxGeometry args={[0.08, 1.2, 0.6]} />
          </mesh>
        ))}
        {/* Moving Ram / Slide Bolster */}
        <mesh position={[0, 1.6, 0]} material={matChassis} castShadow>
          <boxGeometry args={[1.35, 0.35, 1.15]} />
        </mesh>
        {/* Upper Crown Bridge Casting */}
        <mesh position={[0, 2.7, 0]} material={matChassis} castShadow>
          <boxGeometry args={[2.1, 0.65, 1.85]} />
        </mesh>
        {/* Servo Motor Flange Mount Ring */}
        <mesh position={[0, 3.05, 0]} material={matAluminum}>
          <cylinderGeometry args={[0.4, 0.45, 0.1, 24]} />
        </mesh>
        {/* High-Visibility Safety Orange Ram Zone Markers */}
        <mesh position={[0, 1.6, 0.6]} material={matOrange}>
          <boxGeometry args={[1.36, 0.04, 0.02]} />
        </mesh>
        <mesh position={[0, 2.36, 0.9]} material={matYellow}>
          <boxGeometry args={[2.1, 0.03, 0.03]} />
        </mesh>
      </group>
    );
  }

  // 8. QAX-100: Automated Coordinate Optical Inspection CMM
  if (slug === "qax-100") {
    return (
      <group position={[0, 0, 0]} name="QAX_100_CHASSIS">
        {/* 4 Pneumatic Air-Bearing Vibration Isolation Mounts */}
        {[
          [-0.7, -0.55],
          [-0.7, 0.55],
          [0.7, -0.55],
          [0.7, 0.55],
        ].map(([x, z], idx) => (
          <group key={`air-mount-${idx}`} position={[x, 0.2, z]}>
            <mesh material={matChassis}>
              <cylinderGeometry args={[0.12, 0.14, 0.35, 24]} />
            </mesh>
            <mesh position={[0, 0.18, 0]} material={matChrome}>
              <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
            </mesh>
          </group>
        ))}
        {/* Grade 00 Solid Black Granite Surface Plate */}
        <mesh position={[0, 0.5, 0]} material={matGranite} castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.25, 1.4]} />
        </mesh>
        {/* Threaded Insert Grid Matrix Detailing */}
        {[-0.5, -0.25, 0, 0.25, 0.5].map((gx) =>
          [-0.4, -0.2, 0, 0.2, 0.4].map((gz) => (
            <mesh key={`grid-${gx}-${gz}`} position={[gx, 0.63, gz]} material={matChrome}>
              <cylinderGeometry args={[0.008, 0.008, 0.005, 8]} />
            </mesh>
          ))
        )}
        {/* Fixed Ceramic X-Axis Guideway along Granite Edge */}
        <mesh position={[0, 0.64, -0.6]} material={matAluminum}>
          <boxGeometry args={[1.65, 0.04, 0.08]} />
        </mesh>
        {/* Moving Granite Bridge Gantry Uprights */}
        <mesh position={[0, 1.15, -0.62]} material={matGranite} castShadow>
          <boxGeometry args={[0.22, 1.05, 0.18]} />
        </mesh>
        <mesh position={[0, 1.15, 0.62]} material={matGranite} castShadow>
          <boxGeometry args={[0.22, 1.05, 0.18]} />
        </mesh>
        {/* Granite Crossbeam (Bridge Top) */}
        <mesh position={[0, 1.7, 0]} material={matGranite} castShadow>
          <boxGeometry args={[0.24, 0.22, 1.45]} />
        </mesh>
        {/* Ceramic Y-Axis Air-Bearing Guideway */}
        <mesh position={[0.11, 1.7, 0]} material={matAluminum}>
          <boxGeometry args={[0.02, 0.14, 1.35]} />
        </mesh>
        {/* Precision Z-Spindle Ram Carriage */}
        <mesh position={[0.16, 1.5, 0]} material={matChrome} castShadow>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
        </mesh>
      </group>
    );
  }

  // 9. RX-900: Robotic Assembly Workcell
  if (slug === "rx-900") {
    return (
      <group position={[0, 0, 0]} name="RX_900_CHASSIS">
        {/* Heavy Steel Base Platform */}
        <mesh position={[0, 0.2, 0]} material={matChassis} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.35, 2.2]} />
        </mesh>
        {/* Robot Pedestal Plinth in Center */}
        <mesh position={[0, 0.52, 0]} material={matChassis} castShadow>
          <cylinderGeometry args={[0.38, 0.44, 0.35, 32]} />
        </mesh>
        {/* Plinth Chrome Mounting Flange */}
        <mesh position={[0, 0.69, 0]} material={matChrome}>
          <cylinderGeometry args={[0.35, 0.35, 0.04, 32]} />
        </mesh>
        {/* Peripheral Safety Light Fence Uprights */}
        {[
          [-1.05, -1.05],
          [-1.05, 1.05],
          [1.05, -1.05],
          [1.05, 1.05],
        ].map(([x, z], idx) => (
          <mesh key={`rx-post-${idx}`} position={[x, 1.05, z]} material={matYellow}>
            <boxGeometry args={[0.06, 1.7, 0.06]} />
          </mesh>
        ))}
        {/* Cable Drag Chain Guide Channel */}
        <mesh position={[-0.8, 0.38, 0]} material={matAluminum}>
          <boxGeometry args={[0.15, 0.04, 1.6]} />
        </mesh>
      </group>
    );
  }

  // 10. MX-500 (Default): Modular Industrial Conveyor Frame
  const length = 3.2;
  const width = 0.85;
  const height = 0.75;
  const beamThickness = 0.08;

  return (
    <group position={[0, 0, 0]} name="BASE_CONVEYOR_FRAME">
      {/* 6 Vertical Structural Legs */}
      {[
        [-length / 2 + 0.2, 0, -width / 2 + 0.05],
        [-length / 2 + 0.2, 0, width / 2 - 0.05],
        [length / 2 - 0.2, 0, -width / 2 + 0.05],
        [length / 2 - 0.2, 0, width / 2 - 0.05],
        [0, 0, -width / 2 + 0.05],
        [0, 0, width / 2 - 0.05],
      ].map(([x, y, z], idx) => (
        <group key={`leg-${idx}`} position={[x, height / 2, z]}>
          <mesh material={matChassis} castShadow receiveShadow>
            <boxGeometry args={[beamThickness, height, beamThickness]} />
          </mesh>
          <mesh position={[0, -height / 2 + 0.02, 0]} material={matChrome} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.04, 16]} />
          </mesh>
          <mesh position={[0, -height / 2 + 0.06, 0]} material={matChrome}>
            <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
          </mesh>
          <mesh position={[0, height / 4, 0]} material={matYellow}>
            <boxGeometry args={[beamThickness * 1.05, 0.04, beamThickness * 1.05]} />
          </mesh>
        </group>
      ))}

      {/* Main Longitudinal Side Rails (I-beams) */}
      <mesh
        position={[0, height - beamThickness / 2, width / 2 - 0.05]}
        material={matChassis}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[length, beamThickness, beamThickness]} />
      </mesh>
      <mesh
        position={[0, height - beamThickness / 2, -width / 2 + 0.05]}
        material={matChassis}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[length, beamThickness, beamThickness]} />
      </mesh>

      {/* Lower Longitudinal Tie Bars */}
      <mesh position={[0, height * 0.25, width / 2 - 0.05]} material={matAluminum} castShadow>
        <boxGeometry args={[length - 0.4, 0.04, 0.04]} />
      </mesh>
      <mesh position={[0, height * 0.25, -width / 2 + 0.05]} material={matAluminum} castShadow>
        <boxGeometry args={[length - 0.4, 0.04, 0.04]} />
      </mesh>

      {/* Transverse Cross-members (Struts) */}
      {[-length / 2 + 0.2, -length / 4, 0, length / 4, length / 2 - 0.2].map((xPos, idx) => (
        <group key={`cross-${idx}`} position={[xPos, 0, 0]}>
          <mesh position={[0, height - beamThickness / 2, 0]} material={matChassis} castShadow>
            <boxGeometry args={[beamThickness, beamThickness, width - 0.1]} />
          </mesh>
          <mesh position={[0, height * 0.25, 0]} material={matAluminum} castShadow>
            <boxGeometry args={[0.04, 0.04, width - 0.1]} />
          </mesh>
        </group>
      ))}

      {/* Primary Drive Axle Pillow Block Bearings */}
      <group position={[-1.45, height - 0.02, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={matChrome} castShadow>
          <cylinderGeometry args={[0.025, 0.025, width + 0.1, 24]} />
        </mesh>
        <mesh position={[0, 0, width / 2]} material={matChassis} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.05]} />
        </mesh>
        <mesh position={[0, 0, -width / 2]} material={matChassis} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.05]} />
        </mesh>
        <mesh position={[0, -0.15, width / 2 + 0.15]} material={matChassis} castShadow>
          <boxGeometry args={[0.35, 0.04, 0.35]} />
        </mesh>
        <mesh
          position={[0, -0.3, width / 2 + 0.08]}
          rotation={[0.5, 0, 0]}
          material={matAluminum}
          castShadow
        >
          <boxGeometry args={[0.04, 0.25, 0.04]} />
        </mesh>
      </group>

      {/* Outfeed Idler Axle */}
      <group position={[1.45, height - 0.02, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={matChrome} castShadow>
          <cylinderGeometry args={[0.02, 0.02, width, 24]} />
        </mesh>
      </group>

      {/* Safety Yellow High-Visibility Edge Stripes */}
      <mesh position={[0, height + 0.005, width / 2 - 0.01]} material={matYellow}>
        <boxGeometry args={[length, 0.015, 0.015]} />
      </mesh>
      <mesh position={[0, height + 0.005, -width / 2 + 0.01]} material={matYellow}>
        <boxGeometry args={[length, 0.015, 0.015]} />
      </mesh>
    </group>
  );
};
