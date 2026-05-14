import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function VaultLock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0xffffff, 20);
    mainSpot.position.set(5, 5, 10);
    mainSpot.angle = 0.4;
    mainSpot.penumbra = 0.3;
    mainSpot.castShadow = true;
    mainSpot.shadow.bias = -0.0001;
    scene.add(mainSpot);

    const blueRim = new THREE.PointLight(0x0090ff, 15);
    blueRim.position.set(-6, 2, 4);
    scene.add(blueRim);

    const redRim = new THREE.PointLight(0xb8002b, 10);
    redRim.position.set(6, -2, 4);
    scene.add(redRim);

    // Materials
    const baseParams = { color: 0x222222, metalness: 0.9, roughness: 0.4 };
    const baseMaterial = new THREE.MeshStandardMaterial(baseParams);
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.1,
      emissive: 0xffffff,
      emissiveIntensity: 0.2,
    });
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0x0090ff,
      emissive: 0x0090ff,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.9,
    });

    // Master Group
    const vaultGroup = new THREE.Group();
    scene.add(vaultGroup);

    // Helper: createNotchedRing
    function createNotchedRing(radius: number, tube: number, notches: number): THREE.Mesh {
      const ringProfile = new THREE.Shape();
      ringProfile.moveTo(0, -tube * 0.6);
      ringProfile.lineTo(tube * 0.3, -tube * 0.6);
      ringProfile.absarc(tube * 0.4, 0, tube * 0.1, -Math.PI / 2, Math.PI / 2, false);
      ringProfile.lineTo(tube * 0.3, tube * 0.6);
      ringProfile.absarc(0, tube * 0.6, tube * 0.3, 0, Math.PI, false);
      ringProfile.lineTo(-tube * 0.3, tube * 0.6);
      ringProfile.absarc(-tube * 0.4, 0, tube * 0.1, Math.PI / 2, -Math.PI / 2, false);
      ringProfile.lineTo(-tube * 0.3, -tube * 0.6);
      ringProfile.absarc(0, -tube * 0.6, tube * 0.3, Math.PI, 0, false);

      const ringGeo = new THREE.ExtrudeGeometry(ringProfile, {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3,
      });
      ringGeo.center();
      ringGeo.rotateX(Math.PI / 2);

      const ringMesh = new THREE.Mesh(ringGeo, baseMaterial);
      const notchGeo = new THREE.BoxGeometry(0.5, 0.3, 0.6);

      for (let i = 0; i < notches; i++) {
        const angle = (i / notches) * Math.PI * 2;
        const notch = new THREE.Mesh(notchGeo, accentMaterial);
        notch.position.x = Math.cos(angle) * radius;
        notch.position.z = Math.sin(angle) * radius;
        notch.rotation.y = -angle;
        ringMesh.add(notch);
      }

      return ringMesh;
    }

    // Build Rings
    const ring1 = createNotchedRing(3.5, 0.8, 12);
    const ring2 = createNotchedRing(4.8, 0.6, 18);
    const ring3 = createNotchedRing(6.1, 0.7, 24);
    vaultGroup.add(ring1);
    vaultGroup.add(ring2);
    vaultGroup.add(ring3);

    // Central Hub
    const hubGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.6, 64);
    const hub = new THREE.Mesh(hubGeo, accentMaterial);
    hub.rotation.x = Math.PI / 2;
    vaultGroup.add(hub);

    // Keyhole Slot
    const slotGeo = new THREE.BoxGeometry(0.5, 1.2, 0.8);
    const slot = new THREE.Mesh(slotGeo, glowMaterial);
    slot.position.z = 0.1;
    hub.add(slot);

    // Spindles
    const spindleGeo = new THREE.CylinderGeometry(0.3, 0.3, 2.5, 32);
    const spindle1 = new THREE.Mesh(spindleGeo, baseMaterial);
    const spindle2 = new THREE.Mesh(spindleGeo, baseMaterial);
    spindle1.position.x = -2.5;
    spindle1.position.z = 1;
    spindle2.position.x = 2.5;
    spindle2.position.z = -1;
    vaultGroup.add(spindle1);
    vaultGroup.add(spindle2);

    // Interaction State
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetRotationY = (e.clientX / window.innerWidth - 0.5) * 2;
      targetRotationX = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    container.addEventListener('mousemove', onMouseMove);

    // Intro Animation
    vaultGroup.scale.set(0, 0, 0);
    gsap.to(vaultGroup.rotation, {
      y: -Math.PI * 1.5,
      duration: 2.5,
      ease: 'power4.inOut',
    });
    gsap.to(vaultGroup.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 2,
      ease: 'back.out(1.2)',
    });

    // Render Loop
    const clock = new THREE.Clock();

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      vaultGroup.rotation.x += (targetRotationX * 0.3 - vaultGroup.rotation.x) * 0.05;
      vaultGroup.rotation.y += (targetRotationY * 0.5 - vaultGroup.rotation.y) * 0.05;
      vaultGroup.rotation.y += Math.sin(t * 0.2) * 0.0005;

      ring1.rotation.z += 0.002;
      ring2.rotation.z -= 0.003;
      ring3.rotation.z += 0.0015;

      spindle1.position.z = 1 + Math.sin(t * 2) * 0.05;
      spindle2.position.z = -1 + Math.cos(t * 2) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      container.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
}
