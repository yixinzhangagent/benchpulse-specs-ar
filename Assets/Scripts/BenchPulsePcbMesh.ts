// Copyright 2026 BenchPulse Project for Learn AR with SPECS.
// Built with Snap CLAD (/mesh-builder-scripting) for procedural 3D PCB,
// spatial target rings (PadRing_1..4), WayfinderArrow, and MultimeterStationRoot.

@component
export class BenchPulsePcbMesh extends BaseScriptComponent {
  @ui.label("BenchPulse 3D PCB & Spatial Ring Mesh Builder")
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("PCB board width in centimeters (default 32 cm)")
  @widget(new SliderWidget(20, 45, 1))
  boardWidthCm: number = 32

  @input
  @hint("PCB board depth in centimeters (default 22 cm)")
  @widget(new SliderWidget(14, 32, 1))
  boardDepthCm: number = 22

  @input
  @hint("Active target ring pulse speed (radians per second)")
  @widget(new SliderWidget(1.0, 8.0, 0.5))
  ringPulseSpeed: number = 3.5

  @input
  @hint("Enable collider bounds debugging")
  debugColliders: boolean = false
  @ui.group_end

  private padRings: SceneObject[] = []
  private wayfinderArrow: SceneObject | null = null
  private multimeterRoot: SceneObject | null = null
  private activePadIndex: number = -1
  private elapsedTime: number = 0

  private readonly padLocalPositions: vec3[] = [
    new vec3(-8.5, 1.5, 3.5),  // PadRing_1: C1 (+3.3V Decoupling Cap)
    new vec3(-2.5, 1.5, 3.5),  // PadRing_2: U1 Pin 8 (GND Reference)
    new vec3(3.5, 1.5, -2.0),  // PadRing_3: J2 Pin 1 (I2C_SDA Bus)
    new vec3(9.0, 1.5, -2.0),  // PadRing_4: J2 Pin 2 (I2C_SCL Clock)
  ]

  onAwake(): void {
    this.buildWorkbenchPcb()
    this.buildSpatialPadRings()
    this.buildOutOfViewMultimeterAndArrow()

    this.createEvent("UpdateEvent").bind((ev) => {
      this.elapsedTime += ev.getDeltaTime()
      this.animateActiveSpatialRing()
    })
  }

  private buildWorkbenchPcb(): void {
    const pcbRoot = global.scene.createSceneObject("BenchPcbRoot")
    pcbRoot.setParent(this.sceneObject)
    pcbRoot.getTransform().setLocalPosition(new vec3(0, -22.0, -85.0))

    // Procedural PCB substrate mesh via MeshBuilder
    const builder = new MeshBuilder([
      { name: "position", components: 3 },
      { name: "normal", components: 3 },
    ])
    builder.topology = MeshTopology.Triangles
    builder.indexType = MeshIndexType.UInt16

    const hw = this.boardWidthCm * 0.5
    const hd = this.boardDepthCm * 0.5
    const h = 0.4

    // Top face of PCB board
    builder.appendVerticesInterleaved([
      -hw, h, -hd, 0, 1, 0,
       hw, h, -hd, 0, 1, 0,
       hw, h,  hd, 0, 1, 0,
      -hw, h,  hd, 0, 1, 0,
    ])
    builder.appendIndices([0, 2, 1, 0, 3, 2])
    if (builder.isValid()) {
      builder.updateMesh()
    }
  }

  private buildSpatialPadRings(): void {
    const pcbRoot =
      this.sceneObject.getChild(0) || this.sceneObject

    for (let i = 0; i < this.padLocalPositions.length; i++) {
      const ringName = `PadRing_${i + 1}`
      const ringObj = global.scene.createSceneObject(ringName)
      ringObj.setParent(pcbRoot)
      ringObj.getTransform().setLocalPosition(this.padLocalPositions[i])
      // Start in ambient idle state (1.2 cm quiet dot; active ring disabled until board locked)
      ringObj.enabled = false
      this.padRings.push(ringObj)
    }
  }

  private buildOutOfViewMultimeterAndArrow(): void {
    // Out-of-view bench multimeter station at x = +48 cm (35 deg to the right of PCB)
    const meterObj = global.scene.createSceneObject("MultimeterStationRoot")
    meterObj.setParent(this.sceneObject)
    meterObj.getTransform().setLocalPosition(new vec3(48.0, -10.0, -90.0))
    this.multimeterRoot = meterObj

    // In-view edge wayfinder arrow pointing right toward MultimeterStationRoot
    const arrowObj = global.scene.createSceneObject("WayfinderArrow")
    arrowObj.setParent(this.sceneObject)
    arrowObj.getTransform().setLocalPosition(new vec3(12.0, -4.0, -85.0))
    arrowObj.enabled = false
    this.wayfinderArrow = arrowObj
  }

  private animateActiveSpatialRing(): void {
    if (this.activePadIndex >= 0 && this.activePadIndex < this.padRings.length) {
      const activeObj = this.padRings[this.activePadIndex]
      if (activeObj && activeObj.enabled) {
        const pulse = 1.0 + 0.12 * Math.sin(this.elapsedTime * this.ringPulseSpeed)
        activeObj.getTransform().setLocalScale(new vec3(pulse, 1.0, pulse))
      }
    }

    if (this.wayfinderArrow && this.wayfinderArrow.enabled) {
      const bobOffset = 12.0 + 0.8 * Math.sin(this.elapsedTime * 5.0)
      this.wayfinderArrow
        .getTransform()
        .setLocalPosition(new vec3(bobOffset, -4.0, -85.0))
    }
  }

  public setActivePadIndex(stepZeroBased: number): void {
    this.activePadIndex = stepZeroBased
    for (let i = 0; i < this.padRings.length; i++) {
      const ring = this.padRings[i]
      if (i === stepZeroBased) {
        ring.enabled = true
        ring.getTransform().setLocalScale(new vec3(1.0, 1.0, 1.0))
      } else if (i < stepZeroBased) {
        // Completed pads recede into quiet 0.35x check dots
        ring.enabled = true
        ring.getTransform().setLocalScale(new vec3(0.35, 0.35, 0.35))
      } else {
        ring.enabled = false
      }
    }
  }

  public setThermalPulseBoost(heating: boolean): void {
    if (this.activePadIndex >= 0 && this.activePadIndex < this.padRings.length) {
      const ring = this.padRings[this.activePadIndex]
      const s = heating ? 1.25 : 1.0
      ring.getTransform().setLocalScale(new vec3(s, 1.0, s))
    }
  }

  public setWayfinderArrowVisible(visible: boolean): void {
    if (this.wayfinderArrow) {
      this.wayfinderArrow.enabled = visible
    }
  }
}
