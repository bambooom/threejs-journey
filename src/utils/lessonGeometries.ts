import * as THREE from 'three';

export const getGeometryForLesson = (title: string): THREE.BufferGeometry => {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('text')) {
    return new THREE.TorusKnotGeometry(0.7, 0.2, 64, 8);
  } else if (lowerTitle.includes('geometries')) {
    return new THREE.IcosahedronGeometry(1, 0);
  } else if (lowerTitle.includes('materials')) {
    return new THREE.TorusKnotGeometry(0.7, 0.3, 64, 8);
  } else if (lowerTitle.includes('lights')) {
    return new THREE.SphereGeometry(0.8, 16, 16);
  } else if (lowerTitle.includes('shadows')) {
    return new THREE.BoxGeometry(0.8, 0.8, 0.8);
  } else if (lowerTitle.includes('particles') || lowerTitle.includes('galaxy')) {
    const particleCount = 20;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  } else if (lowerTitle.includes('physics')) {
    return new THREE.SphereGeometry(0.8, 16, 16);
  } else if (lowerTitle.includes('models')) {
    return new THREE.CylinderGeometry(0.5, 0.8, 1, 8);
  } else if (lowerTitle.includes('shaders')) {
    return new THREE.TorusGeometry(0.7, 0.3, 16, 32);
  } else if (lowerTitle.includes('animation')) {
    return new THREE.TorusGeometry(0.7, 0.3, 16, 32);
  } else if (lowerTitle.includes('raycaster')) {
    return new THREE.IcosahedronGeometry(0.8, 0);
  } else if (lowerTitle.includes('sea')) {
    return new THREE.CylinderGeometry(0.6, 0.6, 0.2, 32);
  } else if (lowerTitle.includes('transform')) {
    return new THREE.BoxGeometry(0.7, 0.7, 0.7);
  } else if (lowerTitle.includes('camera')) {
    return new THREE.ConeGeometry(0.7, 1.2, 32);
  } else if (lowerTitle.includes('fullscreen') || lowerTitle.includes('resizing')) {
    return new THREE.TorusGeometry(0.5, 0.8, 32);
  } else if (lowerTitle.includes('debug')) {
    return new THREE.TorusGeometry(0.5, 0.2, 8, 24);
  } else if (lowerTitle.includes('texture')) {
    return new THREE.BoxGeometry(0.8, 0.8, 0.8);
  } else if (lowerTitle.includes('haunted')) {
    return new THREE.ConeGeometry(0.7, 1.2, 4);
  } else if (lowerTitle.includes('scroll')) {
    return new THREE.CylinderGeometry(0.2, 0.2, 1.5, 32);
  } else if (lowerTitle.includes('environment')) {
    return new THREE.SphereGeometry(0.8, 32, 32);
  } else if (lowerTitle.includes('render')) {
    return new THREE.TorusKnotGeometry(0.6, 0.2, 64, 8);
  } else if (lowerTitle.includes('structuring')) {
    return new THREE.BoxGeometry(0.6, 0.9, 0.3);
  }

  return new THREE.IcosahedronGeometry(0.8, 0);
};

export const getMaterialForLesson = (title: string, color: string): THREE.Material => {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('materials')) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.9,
      roughness: 0.1,
    });
  } else if (lowerTitle.includes('lights')) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.5,
    });
  } else if (lowerTitle.includes('particles') || lowerTitle.includes('galaxy')) {
    return new THREE.PointsMaterial({
      color,
      size: 0.01,
      sizeAttenuation: true
    });
  } else if (lowerTitle.includes('shaders')) {
    return new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
    });
  } else if (lowerTitle.includes('physics')) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.7,
      roughness: 0.2,
    });
  } else if (lowerTitle.includes('text')) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.5,
      roughness: 0.5,
    });
  } else if (lowerTitle.includes('texture')) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.7,
      flatShading: true,
    });
  } else if (lowerTitle.includes('debug')) {
    return new THREE.MeshToonMaterial({
      color,
    });
  } else if (lowerTitle.includes('haunted')) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.2,
      roughness: 0.9,
    });
  } else if (lowerTitle.includes('environment')) {
    return new THREE.MeshPhysicalMaterial({
      color,
      reflectivity: 1.0,
      clearcoat: 1.0,
    });
  } else if (lowerTitle.includes('render')) {
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 0.5,
    });
  }

  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.7,
  });
};
