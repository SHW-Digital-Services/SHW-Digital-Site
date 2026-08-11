"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { useRef } from "react";
import * as THREE from "three";

type SpriteOrbProps = {
  position: [number, number, number];
  speed?: number;
};

export default function SpriteOrb({
  position,
  speed = 1,
}: SpriteOrbProps) {
  const spriteRef = useRef<THREE.Sprite>(null);

  const texture = useLoader(
    TextureLoader,
    "/textures/plasma-purple.png"
  );

  useFrame(({ clock }) => {
    if (!spriteRef.current) return;

    const t = clock.elapsedTime;

    spriteRef.current.position.x =
      position[0] +
      Math.sin(t * speed) * 0.15;

    spriteRef.current.position.y =
      position[1] +
      Math.cos(t * speed * 0.8) * 0.12;

    const pulse =
      1 +
      Math.sin(t * speed * 2) * 0.1;

    spriteRef.current.scale.set(
      2 * pulse,
      2 * pulse,
      1
    );

    spriteRef.current.material.rotation +=
      0.001;
  });

  return (
    <sprite
      ref={spriteRef}
      position={position}
      scale={[2, 2, 1]}
    >
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.95}
        color="#ffffff"
      />
    </sprite>
  );
}