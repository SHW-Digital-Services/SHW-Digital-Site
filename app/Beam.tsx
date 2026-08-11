"use client";

import { Line } from "@react-three/drei";

export default function Beam() {
  return (
    <>
      <Line
        points={[
          [0, 0, 0],
          [5, 2, 0],
        ]}
        color="#C084FC"
        lineWidth={2}
      />

      <Line
        points={[
          [0, 0, 0],
          [-5, 1, 0],
        ]}
        color="#A855F7"
        lineWidth={2}
      />

      <Line
        points={[
          [0, 0, 0],
          [0, 5, 0],
        ]}
        color="#8B5CF6"
        lineWidth={2}
      />
    </>
  );
}