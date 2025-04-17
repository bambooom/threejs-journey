import * as THREE from 'three';

export const getGeometryForLesson = (title: string): THREE.BufferGeometry => {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('geometries')) {
    return new THREE.IcosahedronGeometry(1, 0);
  } else if (lowerTitle.includes('materials')) {
    return new THREE.TorusKnotGeometry(0.7, 0.3, 64, 8);
  }
  // ... 其他几何体逻辑
  return new THREE.OctahedronGeometry(1);
};

export const getMaterialForLesson = (title: string, color: string): THREE.Material => {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('materials')) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.9,
      roughness: 0.1,
    });
  }
  // ... 其他材质逻辑
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.7,
  });
};