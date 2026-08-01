## Context

The persisted contract already contains the correct four-part model and lifecycle. Only its presentation collapses the model into four simultaneous textareas and later into four equal cards. See `proposal.md` for motivation and the trajectory-contract delta for observable behavior.

## Goals / Non-Goals

**Goals:**
- Make direction and causality visible before any text is entered.
- Keep the complete model in view while editing one part at a time.
- Reuse the same component for first-run, active-contract, and adjustment states.
- Preserve the incumbent dark editorial system and all persistence semantics.

**Non-Goals:**
- No schema, validation, action, import, or lifecycle changes.
- No free-position node editor, zooming, dragging, or graph dependency.
- No numeric scoring, projected outcome, or inferred advice.

## Decisions

### Use a semantic CSS/SVG hybrid map

The four nodes remain native buttons with real text and focus states. A non-interactive SVG layer draws the directional path and feedback return on larger screens; narrow screens use a linear sequence with visible connectors. This provides graph-like spatial meaning without canvas accessibility or a new dependency.

### Edit one selected node in a docked panel

Selecting a node opens its prompt in one persistent editing panel below the map. The panel advances through the four parts, while the map shows completion state. This reduces cognitive load but leaves all four concepts visible. The cadence control remains a small global setting because it applies to the whole trajectory.

### Treat reviews as evidence along the path

The active view uses the same map and adds review count/context rather than returning to summary cards. Existing history remains chronological below it. Adjustment reuses the focused map editor so a bend in history corresponds to a revised map version.

### Preserve the existing visual world

The map inherits charcoal surfaces, gold direction, sage feedback, serif headings, and restrained motion. It avoids draggable-node affordances because the topology is fixed and the user's work is reflection, not diagram construction.

## Risks / Trade-offs

- [The map may become decorative on mobile] → Preserve explicit sequence labels, connectors, and one-at-a-time editing rather than shrinking the desktop diagram.
- [Long text can overwhelm nodes] → Show a concise clamped preview in each node and the full value in the editor.
- [SVG geometry can imply unsupported freedom] → Keep connectors non-interactive and label the fixed present/action/learning regions.
- [Replacing simultaneous fields slows expert entry] → Provide previous/next navigation and make every node directly selectable.

## Migration Plan

Ship as a presentation-only replacement. Existing records render in the map without transformation. Rollback restores the earlier component while leaving every local and database record untouched.
