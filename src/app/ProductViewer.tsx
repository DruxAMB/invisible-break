"use client";

import { useRef, Suspense, useMemo, useState, useEffect } from "react";
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
    const scale = maxDim > 0 ? 3 / maxDim : 1;

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

// Hand-drawn arrow icons — pixel-art style SVGs
function DragIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hand */}
      <path
        d="M10 14 L10 8 Q10 6 12 6 Q14 6 14 8 L14 12 L18 12 Q20 12 20 14 L20 18 Q20 22 16 22 L12 22 Q10 22 8 20 L6 16 Q5 14 7 13 Z"
        stroke="#000"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Arrows — rotate left/right */}
      <path d="M3 14 L1 12 L1 16 Z" fill="#000" />
      <path d="M25 14 L27 12 L27 16 Z" fill="#000" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hand with scroll */}
      <path
        d="M10 16 L10 8 Q10 6 12 6 Q14 6 14 8 L14 12 L18 12 Q20 12 20 14 L20 18 Q20 22 16 22 L12 22 Q10 22 8 20 L6 16 Q5 14 7 13 Z"
        stroke="#000"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Up/down arrows */}
      <path d="M14 1 L11 4 L17 4 Z" fill="#000" />
      <path d="M14 27 L11 24 L17 24 Z" fill="#000" />
    </svg>
  );
}

function ViewerOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(onDismiss, 300);
      return () => clearTimeout(t);
    }
  }, [visible, onDismiss]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-end justify-center pb-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center gap-4 rounded-[6px] border border-ink-black bg-arcade-cream px-3 py-2 shadow-[inset_0_1px_0_0_#f3e5df]">
        <div className="flex items-center gap-1">
          <DragIcon />
          <span className="text-[10px] font-normal leading-[1.5] text-ink-black">DRAG TO ROTATE</span>
        </div>
        <div className="h-4 w-px bg-ink-black" />
        <div className="flex items-center gap-1">
          <ZoomIcon />
          <span className="text-[10px] font-normal leading-[1.5] text-ink-black">SCROLL TO ZOOM</span>
        </div>
      </div>
    </div>
  );
}

export function ProductViewer({ modelUrl }: { modelUrl: string }) {
  const controlsRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(true);

  // Reset overlay when model changes
  useEffect(() => {
    setShowOverlay(true);
  }, [modelUrl]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "#f3e5df" }}
        onPointerDown={() => setShowOverlay(false)}
        onWheel={() => setShowOverlay(false)}
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

      {showOverlay && <ViewerOverlay onDismiss={() => setShowOverlay(false)} />}
    </div>
  );
}
