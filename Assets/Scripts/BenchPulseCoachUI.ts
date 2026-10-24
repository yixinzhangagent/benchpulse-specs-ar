// Copyright 2026 BenchPulse Project for Learn AR with SPECS.
// Built with Snap CLAD (/specs-build-ui) using SpectaclesUIKit & SIK.

import { FlexLayout } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import { FlexItem } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {
  FlexAlign,
  FlexDirection,
  FlexJustify,
  FlexAlignSelf,
} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import { Button } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import { ElementContent } from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"
import { Event } from "SpectaclesInteractionKit.lspkg/Utils/Event"

// ── Typography: Snap Specs authoritative type scale @ z = -110 cm ────────────
const FONT_SIZE_SCALE = 1.0

type TextRole =
  | "Title1"
  | "Title2"
  | "HeadlineXL"
  | "Headline1"
  | "Headline2"
  | "Subheadline"
  | "Button"
  | "Callout"
  | "Body"
  | "Caption"

const TYPE_SCALE: Record<TextRole, { size: number; weight: number }> = {
  Title1: { size: 105, weight: 700 },
  Title2: { size: 93, weight: 700 },
  HeadlineXL: { size: 62, weight: 700 },
  Headline1: { size: 54, weight: 700 },
  Headline2: { size: 48, weight: 700 },
  Subheadline: { size: 41, weight: 700 },
  Button: { size: 39, weight: 500 },
  Callout: { size: 39, weight: 700 },
  Body: { size: 39, weight: 500 },
  Caption: { size: 38, weight: 500 },
}

function roleSize(role: TextRole, distanceCm: number = 90): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}

function applyTextRole(t: Text, role: TextRole, distanceCm: number = 90): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & { weight?: number }).weight = TYPE_SCALE[role].weight
}

export interface StepCardData {
  stepIndex: number
  totalSteps: number
  padCode: string
  netName: string
  polarityNote: string
  targetTempC: number
  dwellSeconds: number
}

@component
export class BenchPulseCoachUI extends BaseScriptComponent {
  @ui.label("BenchPulse Step Coach Card UI (SpectaclesUIKit)")
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Panel width in centimeters (default 26 cm at z = -90 cm)")
  @widget(new SliderWidget(18, 36, 1))
  panelWidthCm: number = 26

  @input
  @hint("Vertical row gap in centimeters")
  @widget(new SliderWidget(0.8, 3.0, 0.2))
  rowGapCm: number = 1.4

  @input
  @hint("Padding around the coach card in centimeters")
  @widget(new SliderWidget(1.0, 3.5, 0.25))
  paddingCm: number = 1.8

  @input
  @hint("Primary header color (high-luminance cyan for additive display)")
  @widget(new ColorWidget())
  headerColor: vec4 = new vec4(0.3, 0.94, 1.0, 1.0)

  @input
  @hint("Primary body text color (high-luminance white for additive display)")
  @widget(new ColorWidget())
  bodyColor: vec4 = new vec4(0.96, 0.98, 1.0, 1.0)

  @input
  @hint("Polarity callout color (high-luminance amber for additive display)")
  @widget(new ColorWidget())
  accentColor: vec4 = new vec4(1.0, 0.72, 0.19, 1.0)

  @input
  @hint("Ready / Passed status color (high-luminance emerald)")
  @widget(new ColorWidget())
  readyColor: vec4 = new vec4(0.22, 0.95, 0.61, 1.0)
  @ui.group_end

  // Channel A: Public Event emitters for main controller subscription
  public readonly onNextJointRequested: Event<void> = new Event<void>()
  public readonly onPinoutToggleRequested: Event<void> = new Event<void>()

  private stepTitleText: Text | null = null
  private polarityText: Text | null = null
  private timerStatusText: Text | null = null
  private floatingPinBadgeText: Text | null = null

  onAwake(): void {
    // 1. Canvas at root — defaults to SortingType.Hierarchy (DFS order)
    this.sceneObject.createComponent("Component.Canvas")

    // 2. Static BackPlate created BEFORE Content so DFS draws it behind text
    const backPlate = this.sceneObject.createComponent(
      BackPlate.getTypeName()
    ) as BackPlate

    // 3. Content child at +0.6 cm Z-offset to break depth-buffer ties
    const content = global.scene.createSceneObject("CoachContent")
    content.setParent(this.sceneObject)
    content.getTransform().setLocalPosition(new vec3(0, 0, 0.6))

    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.width = this.panelWidthCm
    flex.height = -1
    flex.direction = FlexDirection.Column
    flex.alignItems = FlexAlign.Stretch
    flex.justifyContent = FlexJustify.Start
    flex.rowGap = this.rowGapCm
    flex.paddingTop = this.paddingCm
    flex.paddingBottom = this.paddingCm
    flex.paddingLeft = this.paddingCm
    flex.paddingRight = this.paddingCm

    flex.onLayoutComplete.add((r) => {
      backPlate.size = new vec2(r.containerWidth, r.containerHeight)
    })

    // 4. Build stacked rows inside FlexLayout
    const stepHeaderItem = this.buildStepHeader(content)
    const polarityItem = this.buildPolarityRow(content)
    const timerItem = this.buildTimerRow(content)
    const actionRowItem = this.buildActionButtonsRow(content)

    flex.addItems([stepHeaderItem, polarityItem, timerItem, actionRowItem])

    // 5. Build floating spatial pin badge anchored next to active pad
    this.buildFloatingPinBadge()
  }

  private buildStepHeader(parent: SceneObject): FlexItem {
    const so = global.scene.createSceneObject("StepTitleText")
    so.setParent(parent)

    const t = so.createComponent("Component.Text") as Text
    t.text = "Standby: Pinch 'Found Board' to Lock PCB"
    t.depthTest = true
    applyTextRole(t, "Headline2", 90)
    t.textFill.color = this.headerColor
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(-0.5, 0.5, -0.5, 0.5)
    this.stepTitleText = t

    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.alignSelf = FlexAlignSelf.Stretch
    item.overrideHeight = 3.2
    item.marginBottom = 0.4
    return item
  }

  private buildPolarityRow(parent: SceneObject): FlexItem {
    const so = global.scene.createSceneObject("PolarityNoteText")
    so.setParent(parent)

    const t = so.createComponent("Component.Text") as Text
    t.text = "Align PCB fiducials inside 37x32 deg view"
    t.depthTest = true
    applyTextRole(t, "Subheadline", 90)
    t.textFill.color = this.accentColor
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(-0.5, 0.5, -0.5, 0.5)
    this.polarityText = t

    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.alignSelf = FlexAlignSelf.Stretch
    item.overrideHeight = 2.6
    return item
  }

  private buildTimerRow(parent: SceneObject): FlexItem {
    const so = global.scene.createSceneObject("TimerStatusText")
    so.setParent(parent)

    const t = so.createComponent("Component.Text") as Text
    t.text = "Iron Idle — Waiting for Board Lock"
    t.depthTest = true
    applyTextRole(t, "Body", 90)
    t.textFill.color = this.bodyColor
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(-0.5, 0.5, -0.5, 0.5)
    this.timerStatusText = t

    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.alignSelf = FlexAlignSelf.Stretch
    item.overrideHeight = 2.4
    return item
  }

  private buildActionButtonsRow(parent: SceneObject): FlexItem {
    const rowObj = global.scene.createSceneObject("CoachActionRow")
    rowObj.setParent(parent)

    const rowFlex = rowObj.createComponent(FlexLayout.getTypeName()) as FlexLayout
    rowFlex.direction = FlexDirection.Row
    rowFlex.justifyContent = FlexJustify.Center
    rowFlex.alignItems = FlexAlign.Center
    rowFlex.columnGap = 1.6

    // Big Target 1: Next Joint Button (9 cm x 4.5 cm)
    const nextBtnObj = global.scene.createSceneObject("NextStepButton")
    nextBtnObj.setParent(rowObj)
    const nextBtn = nextBtnObj.createComponent(Button.getTypeName()) as Button
    const nextContent = nextBtnObj.createComponent(
      ElementContent.getTypeName()
    ) as ElementContent
    nextContent.text = "Next Joint"
    nextContent.textSize = roleSize("Button", 90)
    nextBtn.onInitialized.add(() => {
      nextBtn.size = new vec3(9.0, 4.5, 1.0)
    })
    this.createEvent("OnStartEvent").bind(() => {
      nextBtn.onTriggerUp.add(() => {
        this.onNextJointRequested.invoke()
      })
    })
    const nextItem = nextBtnObj.createComponent(FlexItem.getTypeName()) as FlexItem

    // Big Target 2: Inspect Pinout Button (9 cm x 4.5 cm)
    const pinoutBtnObj = global.scene.createSceneObject("InspectPinoutButton")
    pinoutBtnObj.setParent(rowObj)
    const pinoutBtn = pinoutBtnObj.createComponent(Button.getTypeName()) as Button
    const pinoutContent = pinoutBtnObj.createComponent(
      ElementContent.getTypeName()
    ) as ElementContent
    pinoutContent.text = "Pinout Polarity"
    pinoutContent.textSize = roleSize("Button", 90)
    pinoutBtn.onInitialized.add(() => {
      pinoutBtn.size = new vec3(9.0, 4.5, 1.0)
    })
    this.createEvent("OnStartEvent").bind(() => {
      pinoutBtn.onTriggerUp.add(() => {
        this.onPinoutToggleRequested.invoke()
      })
    })
    const pinoutItem = pinoutBtnObj.createComponent(
      FlexItem.getTypeName()
    ) as FlexItem

    rowFlex.addItems([nextItem, pinoutItem])

    const rowContainerItem = rowObj.createComponent(
      FlexItem.getTypeName()
    ) as FlexItem
    rowContainerItem.alignSelf = FlexAlignSelf.Stretch
    rowContainerItem.overrideHeight = 5.0
    return rowContainerItem
  }

  private buildFloatingPinBadge(): void {
    const badgeObj = global.scene.createSceneObject("ActivePadFloatingLabel")
    badgeObj.setParent(this.sceneObject)
    badgeObj.getTransform().setLocalPosition(new vec3(14.0, -9.5, 5.0))

    const t = badgeObj.createComponent("Component.Text") as Text
    t.text = "[FIDUCIAL UNLOCKED]"
    t.depthTest = true
    applyTextRole(t, "Callout", 85)
    t.textFill.color = this.headerColor
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(-8, 8, -1.5, 1.5)
    this.floatingPinBadgeText = t
  }

  // ── Channel A Setters (called by BenchPulseMain) ──────────────────────────

  public setStepCard(data: StepCardData): void {
    if (this.stepTitleText) {
      this.stepTitleText.text = `Step ${data.stepIndex}/${data.totalSteps}: Solder ${data.padCode} (${data.netName})`
      this.stepTitleText.textFill.color = this.headerColor
    }
    if (this.polarityText) {
      this.polarityText.text = data.polarityNote
      this.polarityText.textFill.color = this.accentColor
    }
    if (this.timerStatusText) {
      this.timerStatusText.text = `Target: ${data.targetTempC}°C for ${data.dwellSeconds.toFixed(1)}s — Pinch 'Heat Pad'`
      this.timerStatusText.textFill.color = this.bodyColor
    }
    if (this.floatingPinBadgeText) {
      this.floatingPinBadgeText.text = `${data.padCode} • ${data.netName}`
    }
  }

  public setHeatingStatus(
    progressSec: number,
    totalSec: number,
    flowReady: boolean
  ): void {
    if (!this.timerStatusText) return
    if (flowReady) {
      this.timerStatusText.text = "Heating: 350°C — Flow Ready"
      this.timerStatusText.textFill.color = this.readyColor
    } else {
      const rem = Math.max(0, totalSec - progressSec).toFixed(1)
      this.timerStatusText.text = `Heating: 350°C (${rem}s remaining)...`
      this.timerStatusText.textFill.color = this.accentColor
    }
  }

  public setPolarityDetailExpanded(expanded: boolean, detailText: string): void {
    if (!this.polarityText) return
    this.polarityText.text = expanded
      ? `PINOUT SPEC: ${detailText}`
      : detailText
  }

  public setBoardPassedQC(): void {
    if (this.stepTitleText) {
      this.stepTitleText.text = "Board Passed QC — All 4 Joints Verified"
      this.stepTitleText.textFill.color = this.readyColor
    }
    if (this.polarityText) {
      this.polarityText.text = " Step Card Receded — Workbench View Clear"
      this.polarityText.textFill.color = this.bodyColor
    }
    if (this.timerStatusText) {
      this.timerStatusText.text = "0 Shorts • 4/4 Pads Logic Proven"
      this.timerStatusText.textFill.color = this.readyColor
    }
    if (this.floatingPinBadgeText) {
      this.floatingPinBadgeText.text = "QC PASSED [4/4]"
    }
  }
}
