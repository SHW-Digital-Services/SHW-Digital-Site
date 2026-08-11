"use client";

import { Line } from "@react-three/drei";

export default function AnimatedBeam({
  end,
}: {
  end: [number, number, number];
}) {
  return (
    <Line
      points={[
        [0, 0, 0],
        end,
      ]}
      color="#C084FC"
      lineWidth={2}
    />
  );
}