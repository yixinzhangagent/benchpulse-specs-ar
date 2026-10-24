// Copyright 2026 BenchPulse Project for Learn AR with SPECS.
// Built with Snap CLAD (/specs-build-ui) using SpectaclesUIKit & SIK.
// Implements the Preview Stand-In Control Dock & Out-of-View Continuity Fault Banner.

import { FlexLayout } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import { FlexItem } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {
  FlexAlign,
  FlexDirection,
  FlexJustify,
  FlexAlignSelf,
} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import { Frame } from "SpectaclesUIKit.lspkg/Scripts/Components/Frame/Frame"
import { Button } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import { ElementContent } from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"
import { Event } from "SpectaclesInteractionKit.lspkg/Utils/Event"

const FONT_SIZE_SCALE = 1.0

type TextRole = "Headline2" | "Subheadline" | "Button" | "Callout" | "Body" | "Caption"

const TYPE_SCALE: Record<TextRole, { size: number; weight: number }> = {
  Headline2: { size: 48, weight: 700 },
  Subheadline: { size: 41, weight: 700 },
  Button: { size: 39, weight: 500 },
  Callout: { size: 39, weight: 700 },
  Body: { size: 39, weight: 500 },
  Caption: { size: 38, weight: 500 },
}

function roleSize(role: TextRole, distanceCm: number = 85): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}

function applyTextRole(t: Text, role: TextRole, distanceCm: number = 85): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & { weight?: number }).weight = TYPE_SCALE[role].weight
}

@component
export class BenchPulseDiagnosticsUI extends BaseScriptComponent {
  @ui.label("BenchPulse Preview Stand-In Dock & Continuity Fault Alert UI")
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Stand-in dock width in centimeters (default 24 cm)")
  @widget(new SliderWidget(18, 32, 1))
  dockWidthCm: number = 24

  @input
  @hint("Stand-in dock height in centimeters (default 15 cm)")
  @widget(new SliderWidget(12, 22, 1))
  dockHeightCm: number = 15

  @input
  @hint("High-luminance alert color for continuity short warning")
  @widget(new ColorWidget())
  alertColor: vec4 = new vec4(1.0, 0.38, 0.28, 1.0)

  @input
  @hint("High-luminance cyan label color")
  @widget(new ColorWidget())
  dockTitleColor: vec4 = new vec4(0.3, 0.94, 1.0, 1.0)
  @ui.group_end

  // Channel A: Public Event emitters for stand-in actions
  public readonly onLockBoardStandIn: Event<void> = new Event<void>()
  public readonly onHeatPadStandIn: Event<void> = new Event<void>()
  public readonly onTriggerShortStandIn: Event<void> = new Event<void>()
  public readonly onAcknowledgeFault: Event<void> = new Event<void>()

  private faultPopupRoot: SceneObject | null = null
  private faultMessageText: Text | null = null
  private multimeterReadoutText: Text | null = null

  onAwake(): void {
    // 1. Root Canvas for Stand-In Dock Frame
    this.sceneObject.createComponent("Component.Canvas")
    const frame = this.sceneObject.createComponent(Frame.getTypeName()) as Frame
    frame.autoShowHide = false
    frame.autoScaleContent = false
    frame.allowScaling = false

    frame.onInitialized.add(() => {
      frame.innerSize = new vec2(this.dockWidthCm, this.dockHeightCm)
      frame.padding = new vec2(1.5, 1.5)

      const content = global.scene.createSceneObject("StandInDockContent")
      content.setParent(frame.contentTransform.getSceneObject())
      content.getTransform().setLocalPosition(new vec3(0, 0, 0.6))

      const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
      flex.width = this.dockWidthCm
      flex.height = this.dockHeightCm
      flex.direction = FlexDirection.Column
      flex.alignItems = FlexAlign.Stretch
      flex.justifyContent = FlexJustify.Center
      flex.rowGap = 1.2
      flex.paddingTop = 1.2
      flex.paddingBottom = 1.2
      flex.paddingLeft = 1.2
      flex.paddingRight = 1.2

      const titleItem = this.buildDockTitle(content)
      const topButtonsItem = this.buildStandInRowTop(content)
      const bottomButtonItem = this.buildStandInRowBottom(content)

      flex.addItems([titleItem, topButtonsItem, bottomButtonItem])
    })

    // 2. Build Continuity Fault Popup (starts hidden per G3 at the tail of frame.onInitialized)
    this.buildContinuityFaultPopup()
  }

  private buildDockTitle(parent: SceneObject): FlexItem {
    const so = global.scene.createSceneObject("StandInDockHeader")
    so.setParent(parent)

    const t = so.createComponent("Component.Text") as Text
    t.text = "PREVIEW STAND-INS (Fakes Sensing)"
    t.depthTest = true
    applyTextRole(t, "Caption", 85)
    t.textFill.color = this.dockTitleColor
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(-0.5, 0.5, -0.5, 0.5)

    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.alignSelf = FlexAlignSelf.Stretch
    item.overrideHeight = 2.0
    return item
  }

  private buildStandInRowTop(parent: SceneObject): FlexItem {
    const rowObj = global.scene.createSceneObject("StandInRowTop")
    rowObj.setParent(parent)

    const rowFlex = rowObj.createComponent(FlexLayout.getTypeName()) as FlexLayout
    rowFlex.direction = FlexDirection.Row
    rowFlex.justifyContent = FlexJustify.Center
    rowFlex.alignItems = FlexAlign.Center
    rowFlex.columnGap = 1.4

    // Stand-in 1: LockBoardButton ("Found Board")
    const lockObj = global.scene.createSceneObject("LockBoardButton")
    lockObj.setParent(rowObj)
    const lockBtn = lockObj.createComponent(Button.getTypeName()) as Button
    const lockEc = lockObj.createComponent(
      ElementContent.getTypeName()
    ) as ElementContent
    lockEc.text = "Found Board"
    lockEc.textSize = roleSize("Button", 85)
    lockBtn.onInitialized.add(() => {
      lockBtn.size = new vec3(8.5, 4.5, 1.0)
    })
    this.createEvent("OnStartEvent").bind(() => {
      lockBtn.onTriggerUp.add(() => {
        this.onLockBoardStandIn.invoke()
      })
    })
    const lockItem = lockObj.createComponent(FlexItem.getTypeName()) as FlexItem

    // Stand-in 2: HeatPadButton ("Heat Pad 3.5s")
    const heatObj = global.scene.createSceneObject("HeatPadButton")
    heatObj.setParent(rowObj)
    const heatBtn = heatObj.createComponent(Button.getTypeName()) as Button
    const heatEc = heatObj.createComponent(
      ElementContent.getTypeName()
    ) as ElementContent
    heatEc.text = "Heat Pad 3.5s"
    heatEc.textSize = roleSize("Button", 85)
    heatBtn.onInitialized.add(() => {
      heatBtn.size = new vec3(8.5, 4.5, 1.0)
    })
    this.createEvent("OnStartEvent").bind(() => {
      heatBtn.onTriggerUp.add(() => {
        this.onHeatPadStandIn.invoke()
      })
    })
    const heatItem = heatObj.createComponent(FlexItem.getTypeName()) as FlexItem

    rowFlex.addItems([lockItem, heatItem])

    const containerItem = rowObj.createComponent(FlexItem.getTypeName()) as FlexItem
    containerItem.alignSelf = FlexAlignSelf.Stretch
    containerItem.overrideHeight = 4.8
    return containerItem
  }

  private buildStandInRowBottom(parent: SceneObject): FlexItem {
    const rowObj = global.scene.createSceneObject("StandInRowBottom")
    rowObj.setParent(parent)

    const rowFlex = rowObj.createComponent(FlexLayout.getTypeName()) as FlexLayout
    rowFlex.direction = FlexDirection.Row
    rowFlex.justifyContent = FlexJustify.Center
    rowFlex.alignItems = FlexAlign.Center

    // Stand-in 3: TriggerShortButton ("Simulate Short")
    const shortObj = global.scene.createSceneObject("TriggerShortButton")
    shortObj.setParent(rowObj)
    const shortBtn = shortObj.createComponent(Button.getTypeName()) as Button
    const shortEc = shortObj.createComponent(
      ElementContent.getTypeName()
    ) as ElementContent
    shortEc.text = "Simulate Short"
    shortEc.textSize = roleSize("Button", 85)
    shortBtn.onInitialized.add(() => {
      shortBtn.size = new vec3(14.0, 4.5, 1.0)
    })
    this.createEvent("OnStartEvent").bind(() => {
      shortBtn.onTriggerUp.add(() => {
        this.onTriggerShortStandIn.invoke()
      })
    })
    const shortItem = shortObj.createComponent(FlexItem.getTypeName()) as FlexItem

    rowFlex.addItems([shortItem])

    const containerItem = rowObj.createComponent(FlexItem.getTypeName()) as FlexItem
    containerItem.alignSelf = FlexAlignSelf.Stretch
    containerItem.overrideHeight = 4.8
    return containerItem
  }

  private buildContinuityFaultPopup(): void {
    const popupRoot = global.scene.createSceneObject("FaultPopupRoot")
    popupRoot.setParent(this.sceneObject)
    popupRoot.getTransform().setLocalPosition(new vec3(-12.0, 10.0, 2.0))
    this.faultPopupRoot = popupRoot

    popupRoot.createComponent("Component.Canvas")
    const faultFrame = popupRoot.createComponent(Frame.getTypeName()) as Frame
    faultFrame.autoShowHide = false
    faultFrame.autoScaleContent = false
    faultFrame.allowScaling = false

    // Per Hard Rule G3: build all content inside frame.onInitialized.add and disable at the very end
    faultFrame.onInitialized.add(() => {
      faultFrame.innerSize = new vec2(26.0, 11.0)
      faultFrame.padding = new vec2(1.4, 1.4)

      const content = global.scene.createSceneObject("FaultPopupContent")
      content.setParent(faultFrame.contentTransform.getSceneObject())
      content.getTransform().setLocalPosition(new vec3(0, 0, 0.6))

      const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
      flex.width = 26.0
      flex.height = 11.0
      flex.direction = FlexDirection.Column
      flex.alignItems = FlexAlign.Stretch
      flex.justifyContent = FlexJustify.Center
      flex.rowGap = 1.0
      flex.paddingTop = 1.0
      flex.paddingBottom = 1.0
      flex.paddingLeft = 1.2
      flex.paddingRight = 1.2

      const msgObj = global.scene.createSceneObject("FaultAlertText")
      msgObj.setParent(content)
      const msgText = msgObj.createComponent("Component.Text") as Text
      msgText.text = "SHORT DETECTED: Look Right → Multimeter (0.2 Ω)"
      msgText.depthTest = true
      applyTextRole(msgText, "Callout", 85)
      msgText.textFill.color = this.alertColor
      msgText.horizontalAlignment = HorizontalAlignment.Center
      msgText.verticalAlignment = VerticalAlignment.Center
      msgText.horizontalOverflow = HorizontalOverflow.Overflow
      msgText.verticalOverflow = VerticalOverflow.Overflow
      msgText.layoutRect = Rect.create(-0.5, 0.5, -0.5, 0.5)
      this.faultMessageText = msgText
      const msgItem = msgObj.createComponent(FlexItem.getTypeName()) as FlexItem
      msgItem.alignSelf = FlexAlignSelf.Stretch
      msgItem.overrideHeight = 3.0

      const ackObj = global.scene.createSceneObject("AcknowledgeFaultButton")
      ackObj.setParent(content)
      const ackBtn = ackObj.createComponent(Button.getTypeName()) as Button
      const ackEc = ackObj.createComponent(
        ElementContent.getTypeName()
      ) as ElementContent
      ackEc.text = "Clear Fault & Re-heat"
      ackEc.textSize = roleSize("Button", 85)
      ackBtn.onInitialized.add(() => {
        ackBtn.size = new vec3(15.0, 4.5, 1.0)
      })
      this.createEvent("OnStartEvent").bind(() => {
        ackBtn.onTriggerUp.add(() => {
          this.onAcknowledgeFault.invoke()
        })
      })
      const ackItem = ackObj.createComponent(FlexItem.getTypeName()) as FlexItem
      ackItem.alignSelf = FlexAlignSelf.Center
      ackItem.overrideHeight = 4.8

      flex.addItems([msgItem, ackItem])

      // G3: Disable ONLY at the tail of frame.onInitialized
      popupRoot.enabled = false
    })
  }

  // ── Channel A Setters (called by BenchPulseMain) ──────────────────────────

  public setContinuityFaultVisible(
    visible: boolean,
    resistanceOhm: number = 0.2
  ): void {
    if (!this.faultPopupRoot) return
    this.faultPopupRoot.enabled = visible
    if (visible && this.faultMessageText) {
      this.faultMessageText.text = `SHORT DETECTED: Look Right → Multimeter (${resistanceOhm.toFixed(1)} Ω)`
    }
    if (this.multimeterReadoutText) {
      this.multimeterReadoutText.text = visible
        ? `CONT SHORT: ${resistanceOhm.toFixed(1)} Ω [BEEPING]`
        : "CONT: OPEN (OL Ω)"
    }
  }
}
