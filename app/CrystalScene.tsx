"use client";

import { Canvas, useThree } from "@react-three/fiber";

import BrandLogo from "./BrandLogo";
import Crystal from "./Crystal";
import NetworkCloud from "./NetworkCloud";

function HomeSceneContent() {
  const { size } = useThree();
  const isMobile = size.width < 720;

  return (
    <group position={[0, isMobile ? -1.15 : -2.5, 0]} scale={isMobile ? 0.72 : 1}>
      <Crystal />
      <NetworkCloud />
    </group>
  );
}

export default function CrystalScene() {
  return (
    <>
      <div className="home-logo-panel">
        <BrandLogo size="hero" />
      </div>

      <Canvas camera={{ position: [0, 0, 12] }}>
        <ambientLight intensity={2} />

        <pointLight
          position={[0, 0, 0]}
          intensity={20}
          color="#C084FC"
        />

        <HomeSceneContent />
      </Canvas>
    </>
  );
}
