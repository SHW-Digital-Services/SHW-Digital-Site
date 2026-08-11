"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import NetworkNode from "./NetworkNode";

export type PageNode = {
  color: string;
  position: [number, number, number];
  label: string;
  description: string;
  href: string;
  speed: number;
};

const crystalGreen = "#005B32";

const nodes: PageNode[] = [
  { color: "#8B5CF6", position: [5.2, 2.4, -0.4], label: "Services", description: "Digital consultancy", href: "/services", speed: 0.85 },
  { color: "#EF4444", position: [-4.8, 3.1, 0.3], label: "About", description: "The consultancy", href: "/about", speed: 1.05 },
  { color: "#2563EB", position: [4.4, -3.7, 0.5], label: "Process", description: "A tailored approach", href: "/process", speed: 0.95 },
  { color: "#F97316", position: [-5.3, -2.3, -0.2], label: "Contact", description: "Start a conversation", href: "/contact", speed: 1.15 },
];

function EnergyPulse({ color, end, delay, speed }: { color: string; end: [number, number, number]; delay: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const startColor = useMemo(() => new THREE.Color(crystalGreen), []);
  const endColor = useMemo(() => new THREE.Color(color), [color]);
  const currentColor = useMemo(() => new THREE.Color(crystalGreen), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const progress = ((clock.elapsedTime * speed + delay) % 2) / 2;
    const eased = progress * progress * (3 - 2 * progress);
    ref.current.position.lerpVectors(new THREE.Vector3(0, 0, 0), new THREE.Vector3(...end), eased);
    ref.current.scale.setScalar(0.82 + Math.sin(clock.elapsedTime * 12) * 0.2 + progress * 0.22);

    if (materialRef.current) {
      const colorProgress = THREE.MathUtils.smoothstep(eased, 0.28, 1);
      currentColor.copy(startColor).lerp(endColor, colorProgress);
      materialRef.current.color.copy(currentColor);
      materialRef.current.opacity = 0.75 + progress * 0.25;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.16, 20, 20]} />
      <meshBasicMaterial ref={materialRef} color={crystalGreen} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

export default function NetworkCloud() {
  return (
    <>
      {nodes.map((node, index) => (
        <group key={node.label}>
          <EnergyPulse color={node.color} end={node.position} delay={index * 0.43} speed={node.speed} />
          <NetworkNode {...node} />
        </group>
      ))}
    </>
  );
}

