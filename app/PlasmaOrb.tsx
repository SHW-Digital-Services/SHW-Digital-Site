"use client";

import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  color?: string;
  position: [number, number, number];
  speed?: number;
};

export default function PlasmaOrb({ color = "#8B5CF6", position, speed = 1 }: Props) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const nodeColor = useMemo(() => new THREE.Color(color), [color]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        nodeColor: { value: nodeColor },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 nodeColor;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          vec2 uv = vUv - 0.5;
          float r = length(uv);
          float t = time * 0.35;
          float turbulence = noise(uv * 8.0 + t) * 0.6 + noise(uv * 15.0 - t * 1.5) * 0.4;
          float plasma = sin(turbulence * 10.0 - time * 4.0) * 0.5 + 0.5;
          float core = smoothstep(0.28, 0.0, r);
          float body = smoothstep(0.58, 0.12, r);
          float halo = smoothstep(0.88, 0.24, r);
          float flare = pow(max(0.0, sin(atan(uv.y, uv.x) * 8.0 + time)), 5.0);

          vec3 deep = nodeColor * 0.34;
          vec3 bright = mix(nodeColor, vec3(1.0), 0.28);
          vec3 color = mix(deep, nodeColor, plasma);
          color = mix(color, bright, body);
          color += flare * nodeColor * 0.65;
          color = mix(color, vec3(1.0), core * 0.62);

          float alpha = halo;
          if (r > 0.78 || alpha < 0.015) discard;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, [nodeColor]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.time.value = clock.elapsedTime;
    materialRef.current.uniforms.nodeColor.value = nodeColor;
  });

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.x = position[0] + Math.sin(t * speed) * 0.15;
    groupRef.current.position.y = position[1] + Math.cos(t * speed) * 0.12;
    const pulse = 1 + Math.sin(t * speed * 2) * 0.08;
    groupRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <group ref={groupRef} position={position}>
      <Billboard>
        <mesh>
          <sphereGeometry args={[1.05, 32, 32]} />
          <primitive object={material} attach="material" ref={materialRef} />
        </mesh>
      </Billboard>
    </group>
  );
}
