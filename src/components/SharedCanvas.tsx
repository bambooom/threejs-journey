// src/components/SharedCanvas.tsx
import { FC, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { threeManager } from '../utils/ThreeManager';

const SharedCanvas: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // 创建粒子系统
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;

    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      // 将粒子放置在球体上
      const radius = 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = radius * Math.cos(phi);

      // 随机颜色
      colorsArray[i] = Math.random();
      colorsArray[i + 1] = Math.random();
      colorsArray[i + 2] = Math.random();
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3)
    );
    particlesGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colorsArray, 3)
    );

    // 粒子材质
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });

    // 创建粒子系统
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // 创建章节对象
    const chapterObjects: THREE.Mesh[] = [];

    // 章节形状和颜色
    const chapterShapes = ['box', 'sphere', 'torus', 'cone'];
    const chapterColors = [
      '#4e54c8', // 第一章: 偏紫色蓝
      '#00b894', // 第二章: 薄荷绿
      '#e84393', // 第三章: 粉色
      '#f39c12', // 第四章: 橙色
    ];

    // 创建4个章节对象
    for (let i = 0; i < 4; i++) {
      let geometry;

      // 根据章节创建不同几何体
      switch (chapterShapes[i % chapterShapes.length]) {
        case 'sphere':
          geometry = new THREE.SphereGeometry(0.5, 16, 16);
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(0.3, 0.2, 8, 16);
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(0.5, 1, 16);
          break;
        case 'box':
        default:
          geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      }

      // 创建材质
      const material = new THREE.MeshStandardMaterial({
        color: chapterColors[i % chapterColors.length],
        metalness: 0.3,
        roughness: 0.4,
      });

      // 创建网格
      const mesh = new THREE.Mesh(geometry, material);

      // 初始位置
      mesh.position.set(-5 - i * 2, 0, 0);

      scene.add(mesh);
      chapterObjects.push(mesh);
    }

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 鼠标位置追踪
    const mousePosition = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 动画函数
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // 旋转粒子系统
      particleSystem.rotation.y = elapsedTime * 0.05;

      // 动画章节对象
      chapterObjects.forEach((obj, index) => {
        // 旋转对象
        obj.rotation.x = elapsedTime * 0.2 + index * 0.2;
        obj.rotation.y = elapsedTime * 0.3 + index * 0.3;

        // 根据滚动位置移动对象
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // 获取对应章节元素
        const section = document.getElementById(`chapter-${index}`);
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + scrollY;
          const sectionMiddle = sectionTop + rect.height / 2;

          // 计算章节与视口中心的距离
          const distanceFromMiddle =
            sectionMiddle - (scrollY + windowHeight / 2);
          const normalizedDistance = Math.max(
            -1,
            Math.min(1, distanceFromMiddle / windowHeight)
          );

          // 设置目标位置
          const targetX = 3 + normalizedDistance * 2;
          const targetY = -normalizedDistance * 2;

          // 平滑插值当前位置到目标位置
          obj.position.x += (targetX - obj.position.x) * 0.05;
          obj.position.y += (targetY - obj.position.y) * 0.05;
        }
      });
    };

    // 获取容器尺寸
    const rect = containerRef.current.getBoundingClientRect();

    // 将场景添加到管理器
    threeManager.addScene('mainBackground', scene, camera, animate, {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    });

    // 处理窗口大小变化
    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      // 更新相机宽高比
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // 更新场景视口
      threeManager.addScene('mainBackground', scene, camera, animate, {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      // 清理资源
      threeManager.removeScene('mainBackground');
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      chapterObjects.forEach((obj) => {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default SharedCanvas;
