'use client'

import { DigitalTwinNavigator } from '@/components/digital-twin/DigitalTwinNavigator'
import { CAMERA_PRESETS } from '@/components/digital-twin/camera-presets'

export default function DigitalTwinPage() {
  return (
    <main className="bg-zinc-950">
      <DigitalTwinNavigator
        modelUrl="/models/factory.glb"
        presets={CAMERA_PRESETS}
        initialPreset="overview"
        devMode={true}
        environment="warehouse"
        autoTour={false}
        autoTourInterval={5000}
        showHotspots={true}
        showNavPanel={true}
        className="w-full h-screen"
      />
    </main>
  )
}
