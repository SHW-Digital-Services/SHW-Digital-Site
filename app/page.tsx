import CrystalScene from "./CrystalScene";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        height: "100dvh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
        background:
          "radial-gradient(circle at top,#24124D,#1A1038,#120824,#070411)",
      }}
    >
      <CrystalScene />
    </main>
  );
}
