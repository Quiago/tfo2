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

      // Walk up to find the most meaningful name
      let name = mesh.name
      let current: THREE.Object3D | null = mesh
      while (current) {
        if (current.name && current.name.length > 1 && current.name !== 'Scene') {
          name = current.name
          // Prefer parent group names as they're usually more descriptive
          if (current.parent && current.parent.name && current.parent.name !== 'Scene' && current.parent.name.length > 2) {
            name = current.parent.name
          }
          break
        }
        current = current.parent
      }

      const worldPos = new THREE.Vector3()
      mesh.getWorldPosition(worldPos)

      onMeshClick({
        meshName: name || `Mesh_${mesh.id}`,
        worldPosition: worldPos.toArray() as [number, number, number],
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
