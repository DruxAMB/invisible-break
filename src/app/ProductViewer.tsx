"use client";

import { useRef, Suspense, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  // Clone and normalize: center the model and scale it to fit a unit cube
  const normalized = useMemo(() => {
    const cloned = scene.clone(true);

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Find the largest dimension and scale to fit ~2 units
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 2 / maxDim : 1;

    // Center the model at origin
    cloned.position.sub(center.multiplyScalar(scale));
    cloned.scale.setScalar(scale);

    return cloned;
  }, [scene]);

  return <primitive object={normalized} />;
}

function ModelLoader({ url }: { url: string }) {
  return (
    <Suspense
      fallback={
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#e5e7eb" wireframe />
        </mesh>
      }
    >
      <Model url={url} />
    </Suspense>
  );
}

export function ProductViewer({ modelUrl }: { modelUrl: string }) {
  const controlsRef = useRef(null);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "#f3e5df" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />

      <ModelLoader url={modelUrl} />

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
        color="#333333"
      />

      <Environment preset="studio" />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={1.5}
      />
    </Canvas>
  );
}
