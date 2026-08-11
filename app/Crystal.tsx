"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const coreVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coreFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    float angle = atan(vPosition.z, vPosition.x);
    float bands = sin(angle * 8.0 - vPosition.y * 5.0 - uTime * 2.8);
    float turbulence = sin(vPosition.x * 11.0 + uTime * 2.0) * cos(vPosition.z * 10.0 - uTime * 1.5);
    float energy = smoothstep(-0.2, 0.82, bands * 0.58 + turbulence * 0.42);
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
    float center = 1.0 - smoothstep(0.08, 0.9, length(vPosition * vec3(0.7, 1.05, 0.7)));
    float hotCore = 1.0 - smoothstep(0.0, 0.48, length(vPosition * vec3(0.92, 1.12, 0.92)));
    float pulse = 0.92 + sin(uTime * 5.0) * 0.24;

    vec3 deep = vec3(0.0, 0.24, 0.08);
    vec3 emerald = vec3(0.0, 1.0, 0.34);
    vec3 mint = vec3(0.32, 1.0, 0.58);
    vec3 white = vec3(0.86, 1.0, 0.78);
    vec3 color = mix(deep, emerald, energy);
    color = mix(color, mint, center * 0.72 + fresnel * 0.45);
    color = mix(color, white, hotCore * 0.9);

    float alpha = (0.62 + energy * 0.42 + fresnel * 0.2 + center * 0.76 + hotCore * 0.72) * pulse;
    gl_FragColor = vec4(color * pulse, alpha);
  }
`;

export default function Crystal() {
  const groupRef = useRef<THREE.Group>(null);
  const coreMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const corePulseRef = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);

  const coreMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coreVertexShader,
        fragmentShader: coreFragmentShader,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.16;
      groupRef.current.rotation.x = Math.sin(time * 0.35) * 0.08;
    }
    if (coreMaterialRef.current) {
      coreMaterialRef.current.uniforms.uTime.value = time;
    }
    if (coreLightRef.current) {
      coreLightRef.current.intensity = 22 + Math.sin(time * 4.5) * 7;
    }
    if (corePulseRef.current) {
      const pulse = 1.14 + Math.sin(time * 5.0) * 0.16;
      corePulseRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef}>
      <pointLight ref={coreLightRef} color="#00FF66" intensity={22} distance={10} />

      <mesh scale={[1, 1.38, 1]}>
        <octahedronGeometry args={[1.55, 1]} />
        <meshPhysicalMaterial
          color="#00E66D"
          emissive="#00B84F"
          emissiveIntensity={1.15}
          roughness={0.06}
          metalness={0.08}
          transmission={0.92}
          thickness={1.35}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.04}
          transparent
          opacity={0.38}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh scale={[0.98, 1.32, 0.98]}>
        <icosahedronGeometry args={[1.12, 1]} />
        <primitive object={coreMaterial} ref={coreMaterialRef} attach="material" />
      </mesh>

      <mesh ref={corePulseRef}>
        <sphereGeometry args={[0.76, 64, 64]} />
        <meshBasicMaterial color="#D8FFD6" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[0.72, 48, 48]} />
        <meshBasicMaterial color="#00FF66" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <mesh scale={[1.34, 1.34, 1.34]}>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshBasicMaterial color="#B6FFD0" transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}







