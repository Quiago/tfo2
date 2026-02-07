'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

export interface MeshClickEvent {
  meshName: string
  worldPosition: [number, number, number]
}

interface FactoryModelProps {
  url: string
  onMeshCount?: (count: number) => void
  onMeshClick?: (event: MeshClickEvent) => void
}

const HIGHLIGHT_COLOR = new THREE.Color(0xff8c00) // orange-500 ish
const HIGHLIGHT_EMISSIVE = new THREE.Color(0x442200)

export function FactoryModel({ url, onMeshCount, onMeshClick }: FactoryModelProps) {
  const { scene } = useGLTF(url)
  const meshCountRef = useRef(0)
  const [hoveredMesh, setHoveredMesh] = useState<THREE.Mesh | null>(null)
  const originalMaterialsRef = useRef<WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>>(
    new WeakMap()
  )

  useEffect(() => {
    let count = 0
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        count++
      }
    })
    meshCountRef.current = count
    onMeshCount?.(count)
  }, [scene, onMeshCount])

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      const mesh = e.object as THREE.Mesh
      if (!mesh.isMesh) return

      document.body.style.cursor = 'pointer'

      // Store original material if not already stored
      if (!originalMaterialsRef.current.has(mesh)) {
        originalMaterialsRef.current.set(mesh, mesh.material)
      }

      // Create highlight material
      const original = mesh.material
      const mat = Array.isArray(original) ? original[0] : original
      if (mat && 'color' in mat) {
        const highlighted = (mat as THREE.MeshStandardMaterial).clone()
        highlighted.emissive = HIGHLIGHT_EMISSIVE
        highlighted.emissiveIntensity = 0.4
        mesh.material = highlighted
      }

      setHoveredMesh(mesh)
    },
    []
  )

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      const mesh = e.object as THREE.Mesh
      if (!mesh.isMesh) return

      document.body.style.cursor = 'auto'

      // Restore original material
      const original = originalMaterialsRef.current.get(mesh)
      if (original) {
        mesh.material = original
      }

      setHoveredMesh((prev) => (prev === mesh ? null : prev))
    },
    []
  )

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      const mesh = e.object as THREE.Mesh
      if (!mesh.isMesh || !onMeshClick) return

      // Walk up to find the most meaningful name.
      // Stop at "Scene", "DefaultScene", or root. Collect the FIRST
      // ancestor with a descriptive name (length > 1) — that's the
      // component/group this mesh belongs to.
      const SKIP_NAMES = new Set(['Scene', 'DefaultScene', 'RootNode', 'Root'])
      let name = mesh.name || ''
      let bestName = ''
      let current: THREE.Object3D | null = mesh
      while (current && !SKIP_NAMES.has(current.name)) {
        if (current.name && current.name.length > 1) {
          bestName = current.name
        }
        current = current.parent
      }
      name = bestName || mesh.name || `Mesh_${mesh.id}`

      // Use e.point — the exact raycast intersection coordinate
      onMeshClick({
        meshName: name || `Mesh_${mesh.id}`,
        worldPosition: e.point.toArray() as [number, number, number],
      })
    },
    [onMeshClick]
  )

  return (
    <primitive
      object={scene}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  )
}
