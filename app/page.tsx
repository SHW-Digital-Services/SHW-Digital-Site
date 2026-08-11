import CrystalScene from "./CrystalScene";

export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top,#24124D,#1A1038,#120824,#070411)",
      }}
    >
      <CrystalScene />
    </main>
  );
}