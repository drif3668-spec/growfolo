"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

function RubikCube() {
  const cubes = Array.from({ length: 27 }, (_, index) => {
    const x = (index % 3) - 1;
    const y = Math.floor(index / 3) % 3 - 1;
    const z = Math.floor(index / 9) - 1;
    return [x, y, z] as const;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.7}>
      <group rotation={[0.5, -0.65, 0.2]}>
        {cubes.map(([x, y, z]) => (
          <mesh key={`${x}-${y}-${z}`} position={[x * 0.62, y * 0.62, z * 0.62]}>
            <boxGeometry args={[0.54, 0.54, 0.54]} />
            <meshStandardMaterial
              color={x > 0 ? "#84cc16" : y > 0 ? "#a855f7" : "#1b1328"}
              emissive={x > 0 ? "#4ade80" : "#7c3aed"}
              emissiveIntensity={0.34}
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0.4, 0]}>
          <torusGeometry args={[1.85, 0.035, 16, 120]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
        </mesh>
        <mesh rotation={[Math.PI / 2, -0.45, 0]}>
          <torusGeometry args={[1.95, 0.035, 16, 120]} />
          <meshStandardMaterial color="#84cc16" emissive="#84cc16" emissiveIntensity={2} />
        </mesh>
      </group>
    </Float>
  );
}

export function HeroScene() {
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.28),transparent_55%),#050508] md:h-[430px]">
      <div className="absolute inset-8 rounded-full bg-purple-600/20 blur-3xl" />
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.45} />
        <pointLight position={[3, 3, 4]} intensity={55} color="#a855f7" />
        <pointLight position={[-3, -2, 3]} intensity={35} color="#84cc16" />
        <RubikCube />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
      </Canvas>
    </div>
  );
}
