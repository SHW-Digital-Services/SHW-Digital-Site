"use client";

import { Canvas } from "@react-three/fiber";

import Crystal from "./Crystal";
import NetworkCloud from "./NetworkCloud";

export default function CrystalScene() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 100,
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            marginBottom: "0.5rem",
            letterSpacing: "0.1em",
          }}
        >
          SHW DIGITAL SERVICES
        </h1>

        <p
          style={{
            color: "#D8B4FE",
            fontSize: "1.25rem",
          }}
        >
          Transform. Automate. Grow.
        </p>
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