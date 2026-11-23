---
name: Vitrine Estúdio
description: Sites sob medida para pequenas empresas, mostrados como um carro num showroom fechado à noite.
colors:
  floor: "#0a0a0a"
  plane-1: "#151515"
  plane-2: "#202020"
  plane-lit: "#2b2b2b"
  ink: "#ededed"
  ink-2: "#b3b5b9"
  steel: "#8a8f96"
  action-hover: "#ffffff"
  line: "rgb(255 255 255 / .08)"
  line-2: "rgb(255 255 255 / .15)"
  field-ground: "#0e0e0e"
  field-ground-focus: "#111111"
  placeholder: "#80848a"
  metal-light: "#d4d7db"
  metal-dark: "#5d6168"
  status-live: "#7fe0a0"
  error: "#ff9b8f"
typography:
  display:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(40px, 5.4vw, 80px)"
    fontWeight: 750
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(30px, 3.5vw, 52px)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  price:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(26px, 2.3vw, 34px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  numeral:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "tnum"
  lead:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1
  label:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  signature:
    fontFamily: "Mrs Saint Delafield, cursive"
    fontSize: "64px"
    fontWeight: 400
    lineHeight: 1
rounded:
  field: "10px"
  photo: "12px"
  plane: "14px"
  box: "18px"
  phone: "30px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  max: "1240px"
  section: "clamp(96px, 11vw, 150px)"
  section-head: "clamp(44px, 5vw, 72px)"
  grid-gap: "24px"
  card-gap: "20px"
  price-gap: "16px"
  plate-pad: "26px 28px 28px"
  card-pad: "30px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.floor}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.floor}"
  button-ghost:
    backgroundColor: "rgb(255 255 255 / .02)"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  button-small:
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "40px"
  plate:
    backgroundColor: "{colors.plane-1}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.plane}"
    padding: "{spacing.plate-pad}"
  price-card:
    backgroundColor: "{colors.plane-1}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.plane}"
    padding: "{spacing.card-pad}"
  price-card-featured:
    backgroundColor: "{colors.plane-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.plane}"
    padding: "{spacing.card-pad}"
  order-box:
    backgroundColor: "{colors.plane-2}"
    rounded: "{rounded.box}"
    padding: "clamp(22px, 3vw, 36px)"
  input:
    backgroundColor: "{colors.field-ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "13px 16px"
    height: "52px"
  chip:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.floor}"
  audit-panel:
    backgroundColor: "{colors.plane-1}"
    rounded: "{rounded.plane}"
    padding: "28px"
  dock:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.floor}"
    rounded: "{rounded.pill}"
    height: "54px"
---

# Design System: Vitrine Estúdio

## Overview

**Creative North Star: "Showroom à Noite"**

The client's site is shown the way a car is shown in a closed showroom after hours: one object, one light, a polished black floor that reflects it. The page is dark, quiet and editorial. Hierarchy comes from fixed gray steps and from planes that overlap, never from color or glow. There is no brand hue; the only full white on any screen belongs to the action the visitor should take.

Density is low. Each section makes one claim, gives the evidence, and ends on one imperative. Depth is physical: a single key light from the top left lights the top and left edges of every plane and throws every shadow down and to the right. Motion is the light moving: exhibits catch a sweep of light as they enter, and the showroom stage tilts a few degrees toward the pointer while its floor reflection follows. With all motion off, the page stays complete and premium, because nothing depends on animation to exist.

This world replaces the retired v8 look (navy and lime, Archivo wide, 3D jacks, ribbons). `css/v8.css`, `js/site.js` and `js/cena.js` are not part of this system.

**Key Characteristics:**
- Polished black floor (#0a0a0a) with three overlapping planes above it; depth by overlap, never glow.
- One key light from the top left governs every highlight, edge and shadow.
- Full white is reserved for the primary action.
- Schibsted Grotesk throughout, tight at display sizes; Mrs Saint Delafield only for Arthur's signature.
- Real client work shown as physical objects (laptop, phone, plates) on a reflective stage.
- Motion is light, not decoration, and degrades to a plain fade under reduced motion.

## Colors

A monochrome night palette: a black floor, three charcoal planes, three ink steps and brushed-steel hairlines, with no accent hue.

### Primary
- **Soft White** (`ink`): the primary action fill (buttons, dock, selected chip) and the main text color. It is never used as a surface outside the action.
- **Full White** (`action-hover`): only the hover state of the primary action. Nothing else on the page is pure white.

### Neutral
- **Polished Floor** (`floor`): page ground, the hero, the text color on white actions.
- **First Plane** (`plane-1`): plates, price cards, the analysis panel, the order section ground.
- **Second Plane** (`plane-2`): the featured price card and the order box, the plane that sits in front.
- **Lit Edge** (`plane-lit`): the 1px outer ring around device bezels and phones, the scrollbar thumb.
- **Support Gray** (`ink-2`): body copy under headings, leads, nav links, card text.
- **Brushed Steel** (`steel`): labels, captions, step numerals, hints, the steel hairline on lit edges.
- **Hairline** (`line`) and **Strong Hairline** (`line-2`): section dividers, card borders, field and ghost-button borders.
- **Field Ground** (`field-ground`, focus `field-ground-focus`) and **Placeholder** (`placeholder`): inputs only, a step darker than the planes so a field reads as a recess.
- **Metal** (`metal-light` to `steel` to `metal-dark`, a vertical gradient): the laptop base only.

### Signals
- **Live** (`status-live`): the single dot before "Cliente no ar" in the hero proof line, with a 4px halo at 14% opacity. It means "online now" and nothing else.
- **Error** (`error`): invalid field borders and error text.

### Named Rules
**The Four Steps Rule.** Surfaces move only through four fixed steps: floor, first plane, second plane, lit edge. A new surface picks one of these; it never invents a fifth gray.

**The White Is the Action Rule.** Soft white as a fill means "do this". It belongs to the primary button, the mobile dock and a selected chip. Pure white appears only on primary hover.

**The No Hue Rule.** The system has no brand color. The live dot and the error red are signals, not accents, and never decorate.

## Typography

**Display Font:** Schibsted Grotesk (variable 400 to 900, self-hosted, with system-ui fallback)
**Body Font:** Schibsted Grotesk
**Signature Font:** Mrs Saint Delafield (self-hosted, latin subset)

**Character:** One grotesk does every job, tightened hard at display sizes so headlines read as engraved plates, and relaxed to 1.6 line height for reading. The script face is a single human mark, not a second voice.

### Hierarchy
- **Display** (750, clamp(40px, 5.4vw, 80px), 0.98, -0.035em): the hero h1. The footer call uses the same voice at clamp(34px, 5.6vw, 84px), max 15ch.
- **Headline** (700, clamp(30px, 3.5vw, 52px), 1.04, -0.03em): every section h2; 30px fixed on phones. The analysis h2 runs one step down (clamp(28px, 3vw, 44px)).
- **Price** (700, clamp(26px, 2.3vw, 34px), 1.1): the price value inside a price card.
- **Title** (600 to 700, 20 to 22px, -0.015 to -0.02em): plate names (22px), step titles (21px), price-card names (20px, 600, in support gray), FAQ questions (19px, 600; 17px on phones).
- **Numeral** (300, 64px, tabular): step counters in steel; 52px on tablet, 44px on phones.
- **Lead** (400, 18px, 1.6, max 46 to 48ch): section intros in support gray; 16px on phones.
- **Body** (400, 17px, 1.6): default text; 16px on phones. Long answers cap at 64ch.
- **Label** (400, 13 to 15px): captions, tags, hints, footer rows in steel or support gray. Field labels are 15px, 600, in ink.

### Named Rules
**The One Face Rule.** Schibsted Grotesk sets everything. Mrs Saint Delafield appears once, as the signature in the about section (64px, rotated -4deg; 52px on phones), and nowhere else.

**The Tight Display Rule.** Anything 30px and up carries negative tracking (-0.025em to -0.035em) and line height at or under 1.1. Body text never does.

## Layout

A 12-column grid inside a centered frame: content runs to a 1240px max, with side padding `max(gutter, (100% - 1240px) / 2)` so the frame and the fixed bar share one edge. The gutter scales clamp(16px, 4vw, 56px). Sections pad clamp(96px, 11vw, 150px) top and bottom (84px 16px on phones) and are separated by a hairline.

Section heads are a two-column split (7fr headline, 5fr lead, bottom-aligned) above the content, with clamp(44px, 5vw, 72px) below. The hero splits 5 columns of copy left, 7 columns of stage right, full viewport height. Work plates sit 7fr/5fr, the second dropped 64px and pulled 56px left over the first on desktop so the planes overlap. Steps and prices run three across; the order section splits 5fr/7fr with the side column sticky at 110px.

### Breakpoints
- **Desktop (1024px and up):** full 12-column hero, overlapping plates, three-across steps and prices.
- **Tablet (1023px and below):** nav hides, the small primary button moves right in the bar; the hero becomes one column with the stage first (height min(62vw, 520px)); every split becomes one column; steps turn into numeral-left rows; the order side stops being sticky.
- **Tablet hero (700px to 1023px):** the copy below the stage splits again, headline left (1.15fr) spanning three rows and offer, actions and proof right (1fr), bottom-aligned, so no half screen sits empty.
- **Phone (639px and below):** 16px gutters; the stage bleeds to the edges at 82vw high; hero buttons go full width; forms drop to one column; the analysis rings go two by two; the mobile dock appears.

## Elevation & Depth

Depth comes from planes stacked in front of one another under one light, not from glow or color. Every lifted plane carries the same cast shadow, falling down and right, plus a faint inner highlight on its top-left edge; lit planes also take a steel hairline on their top (38%) and left (20%) borders. The hero adds a 118deg wash of light from the top left, and the stage has its own diagonal light band and a reflective floor (the device set is mirrored below with `-webkit-box-reflect`, fading to 16%).

### Shadow Vocabulary
- **Cast** (`box-shadow: 18px 34px 70px -28px rgb(0 0 0 / .85), 4px 8px 18px -8px rgb(0 0 0 / .6)`): plates, the featured price card, the analysis panel, the order box, devices, phones, about images.
- **Edge** (`box-shadow: inset 1px 1px 0 rgb(255 255 255 / .07)`): paired with Cast on every plane; alone on unfeatured price cards.
- **Action** (`box-shadow: 8px 14px 30px -14px rgb(0 0 0 / .9), inset 0 -2px 0 rgb(0 0 0 / .12)`): the primary button.
- **Dock** (`box-shadow: 0 18px 40px -10px rgb(0 0 0 / .9)`): the mobile dock.
- **Floor contact**: a blurred black ellipse (16px blur, 90%) under the stage set.

### Named Rules
**The Single Key Light Rule.** The light comes from the top left. Every shadow falls down and to the right, every highlight sits on a top or left edge, every light sweep travels left to right at about 115deg. A shadow pointing any other way is a defect.

**The Overlap Not Glow Rule.** A plane earns attention by sitting in front (a lighter step, the Cast shadow, an overlap), never by a colored glow or a bright border.

## Shapes

Soft rectangles and pills. Planes (plates, price cards, analysis panel) use a 14px radius; the order box, the plane you arrive at, is softer at 18px; about images 12px; fields 10px. Everything you press is a pill: buttons, chips, the analysis input row and the dock. Devices follow their objects: laptop screen 14px top and 4px bottom with a 10px bezel (14px at the bottom), phones 28 to 30px with a 7px bezel (5px and 22px on small phones). Borders are always 1px hairlines; the only heavier lines are the checkmarks in the promise list (2px ink).

## Components

### Bar
Quiet until needed. Fixed at the top, transparent over the hero; after 24px of scroll it turns into floor at 82% with a 14px backdrop blur and a hairline bottom. Logo "Vitrine" at 800/19px with "Estúdio" at 500/15px in steel (hidden on phones). Nav links 15px in support gray, ink on hover; hidden at 1023px and below. A small primary button "Pedir prévia" closes the row.

### Buttons
- **Shape:** full pill (999px), 52px tall, 600/16px.
- **Primary:** soft white fill with floor text and the Action shadow. Hover lifts 2px and goes pure white; active presses 1px and scales to 0.99. One primary per view.
- **Ghost:** transparent with a 2% white wash and a strong hairline; hover moves the border to steel and the wash to 5%.
- **Small:** 40px tall, 18px padding, 14px text (bar).
- **Block:** full width (form submit, analysis panel).
- **Disabled:** 55% opacity with a progress cursor while sending.
- **Focus:** 2px ink outline, 3px offset, used everywhere.

### Showroom Stage (signature)
The hero exhibit. A laptop (82% wide) and a phone (23% wide, pushed 60px forward in Z) show a real client site, standing on a reflective floor under a diagonal light band. The set rests at rotateX(4deg) rotateY(-12deg) inside an 1800px perspective. On fine pointers it tilts up to 7deg toward the cursor (3deg under reduced motion, with no easing transition), and the reflection follows because it belongs to the same set; on leaving it eases back over 0.9s. Height min(68vh, 640px) on desktop.

### Exhibits (before and after)
Two phones on a shared floor line. The "before" phone is desaturated (saturate .55, brightness .72) and tilted -2deg; the "after" phone stands 14px higher. A thin steel arrow sits between them. Captions: name in ink, description in steel, centered.

### Plates (work)
Each site shown large: first-plane ground, hairline border with lit top/left edges, Cast + Edge shadow, 14px radius. Image 16:10 on top, then name (22px, ink), tag (13px, steel), description, and a link line with an arrow icon. Hover lifts 3px, brightens the border, scales the image to 1.025 and nudges the arrow up-right.

### Steps
Three columns, each opened by a strong hairline and a large thin numeral in steel (64px, 300). The numeral is the real order. On tablet and phone each step becomes a row with the numeral on the left.

### Price Cards
Three first-plane cards, 30px padding (24px on phones), Edge only. The middle card steps forward: second plane, strong hairline, Cast shadow. Inside: service name (20px, 600, support gray), price (Price style, ink), text, and an underlined "Pedir prévia" link whose hairline turns ink on hover. Below, the rules block: a 4fr title beside a two-column list of hairline-topped items.

### FAQ
Native details/summary rows between hairlines, max 860px, aligned right. Question 19px/600 with a 14px plus made of two 1.5px steel bars; opening rotates the vertical bar flat over 0.3s. Answers in support gray, max 64ch.

### About
Two overlapping screenshots (the second at 64% width over the bottom right) beside the story, and the handwritten signature.

### Order Form
The place you arrive: the section ground lifts to first plane, the form sits in a second-plane box (18px radius, Cast + Edge). Fields are 52px tall on field ground with a strong hairline; hover raises the border to 24% white; focus turns the border ink and the ground one step lighter, with no glow. Labels 15px/600 ink, optional parts in steel, hints 13px steel, errors 14px in error red with a red border. Two columns, one on phones. Beside it: four promises with drawn ink checkmarks and a direct e-mail line.

### Chips
Radio pills, 44px tall, strong hairline, support-gray text. Hover: steel border, ink text. Selected: soft white fill with floor text (the action color, because choosing is acting). Focus: the standard ink outline.

### Analysis Panel
A first-plane panel (28px padding, 20px on phones) with a head row, four score rings and a short numbered list. Rings are 76px conic gradients filling in ink against 10% white, with the score centered at 21px/700; four across, two by two on phones. The input row is a pill on field ground with the ghost "Analisar" button inside; focus-within turns its border ink. A block primary button closes the panel.

### Mobile Dock
Phones only. A fixed soft-white pill 12px from the edges and bottom, 54px tall. It slides up (0.45s) once the hero leaves the screen and slides away while the order form is visible.

### Motion Grammar
- **Easing:** one curve, cubic-bezier(.16, 1, .3, 1), for every transition.
- **Entry:** with JS on, marked pieces start at 0 opacity, 18px down, and settle over 0.9s when they come within 12% of the viewport. Without JS everything is visible.
- **Light sweep:** plates and exhibit phones get one diagonal highlight (115deg, 9% white) passing left to right over 1.6s, once, as they enter.
- **Stage tilt:** pointer-driven, fine pointers only, 0.9s ease back.
- **Reduced motion:** smooth scroll off; entries keep only a 0.5s fade with no movement; the light sweep is removed; the stage tilt drops to 3deg range with no transition. The page is fully legible with nothing moving.

## Do's and Don'ts

### Do:
- **Do** pick every surface from the four steps: floor, first plane, second plane, lit edge.
- **Do** cast every shadow down and to the right and light every edge on the top and left; reuse the Cast and Edge shadows rather than inventing new ones.
- **Do** keep soft white fills for the primary action, the dock and a selected chip; reserve pure white for primary hover.
- **Do** show depth by putting one plane in front of another (lighter step, Cast shadow, overlap).
- **Do** set headlines in Schibsted Grotesk with negative tracking and line height at or under 1.1.
- **Do** show real work as physical objects (devices, plates) and mark previews as previews.
- **Do** keep every animation optional: content visible without JS, a plain fade under reduced motion.

### Don't:
- **Don't** add a brand hue or a colored glow; the live dot and error red are signals only.
- **Don't** use full white for text, borders or decoration.
- **Don't** use Mrs Saint Delafield for anything but the signature.
- **Don't** light from more than one direction or add shadows that fall up or left.
- **Don't** bring back the retired v8 materials (navy and lime, Archivo wide, 3D jacks, ribbons).
