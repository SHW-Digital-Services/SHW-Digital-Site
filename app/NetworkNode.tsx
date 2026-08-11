"use client";

import { Html } from "@react-three/drei";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { PageNode } from "./NetworkCloud";
import PlasmaOrb from "./PlasmaOrb";

export default function NetworkNode({ color, position, label, description, href, speed }: PageNode) {
  const ref = useRef<THREE.Group>(null);
  const router = useRouter();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed;
    ref.current.position.x = position[0] + Math.sin(t) * 0.12;
    ref.current.position.y = position[1] + Math.cos(t * 0.8) * 0.12;
  });

  return (
    <group
      ref={ref}
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        router.push(href);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <PlasmaOrb color={color} position={[0, 0, 0]} speed={speed} />
      <Html center distanceFactor={7} position={[0, 1.32, 0]}>
        <Link href={href} className="node-link" style={{ textShadow: `0 0 8px #070411, 0 0 18px ${color}, 0 0 28px ${color}` }}>
          <div className="node-title">{label.toUpperCase()}</div>
          <div className="node-description" style={{ textShadow: `0 0 10px #070411, 0 0 22px ${color}, 0 0 34px ${color}` }}>{description}</div>
        </Link>
      </Html>
    </group>
  );
}





