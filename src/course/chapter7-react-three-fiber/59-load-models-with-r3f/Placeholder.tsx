import { type ThreeElements } from '@react-three/fiber'

type PlaceholderProps = ThreeElements['mesh']

export default function Placeholder(props: PlaceholderProps) {
  return (
    <mesh {...props}>
      <boxGeometry args={ [ 1, 1, 1, 2, 2, 2 ] } />
      <meshBasicMaterial wireframe color="red" />
    </mesh>
  )
}
