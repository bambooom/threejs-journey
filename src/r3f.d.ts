declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: any;
      bufferAttribute: {
        attach?: string;
        array?: any;
        count?: number;
        itemSize?: number;
        [key: string]: any;
      };
      bufferGeometry: any;
      mesh: any;
    }
  }
}

export {};
