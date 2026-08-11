"use client";

import { Canvas } from "@react-three/fiber";

import BrandLogo from "./BrandLogo";
import Crystal from "./Crystal";
import NetworkCloud from "./NetworkCloud";

export default function CrystalScene() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 26,
          left: "clamp(20px, 5vw, 72px)",
          zIndex: 100,
        }}
      >
        <BrandLogo size="hero" />
      </div>

      <Canvas camera={{ position: [0, 0, 12] }}>
        <ambientLight intensity={2} />

        <pointLight
          position={[0, 0, 0]}
          intensity={20}
          color="#C084FC"
        />

        <group position={[0, -2.5, 0]}>
          <Crystal />
          <NetworkCloud />
        </group>
      </Canvas>
    </>
  );
}
