'use client'

import { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface FactoryModelProps {
  url: string
  onMeshCount?: (count: number) => void
}

export function FactoryModel({ url, onMeshCount }: FactoryModelProps) {
  const { scene } = useGLTF(url)
  const meshCountRef = useRef(0)

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

  return <primitive object={scene} />
}
