# Editor Recovery Plan (Stored)

Implement a unified EditorShell with tabs to host different editor experiences and recover the /editor page functionality.

1) EditorShell with Tabs
- Create EditorShell component
- Tabs:
  a) Oficial (OfficialHabboEditor)
  b) ViaJovem (ViaJovemEditorRedesigned)
  c) Widgets/Unificado (HabboWidgetsEditor)
  d) (Optional) Real/Puhekupla
- Shared state will be introduced later; for now embed existing editors to restore functionality fast

2) Update /editor to use EditorShell
- Replace OfficialHabboEditor with EditorShell in src/pages/Editor.tsx
- Keep Mobile/Desktop layouts

3) Hotel awareness and URLs
- OfficialHabboEditor and ViaJovemEditorRedesigned already handle hotel; ensure pass-through

4) Habbo styling
- Use .habbo-text on tab labels and titles

5) Performance & UX
- Keep current FlashAssetsV3Complete features; future: debounce, virtualization

6) Deep linking & history
- Keep per-editor support as is; unify later

7) Manual tests
- Test /editor on desktop/mobile, item selection, skin color, reset
