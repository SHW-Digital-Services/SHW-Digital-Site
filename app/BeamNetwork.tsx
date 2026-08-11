"use client";

import { useEffect, useState } from "react";
import AnimatedBeam from "./AnimatedBeam";

const nodes: [number, number, number][] = [
  [5, 0, 0],
  [-5, 0, 0],
  [3.5, 4, 0],
  [-3.5, 4, 0],
  [3.5, -4, 0],
  [-3.5, -4, 0],
];

export default function BeamNetwork() {
  const [currentNode, setCurrentNode] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNode(Math.floor(Math.random() * nodes.length));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return <AnimatedBeam end={nodes[currentNode]} />;
}