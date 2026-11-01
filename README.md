<p align="center">
  <img src="public/logo.svg" alt="OpenLipi Logo" width="120" height="120" />
</p>

<h1 align="center">OpenLipi 🎬</h1>

<p align="center">
  <strong>Studio-Grade Screenplay Writing & Director Reference Suite</strong><br>
  <em>Free, open-source, and 100% client-side with Hollywood 1:1 formatting, serverless WebRTC co-authoring, version control diffs, director PDF import, and universal exports.</em>
</p>

---

## 👤 Author & Owner Credits

- **Project Creator & Owner**: **Bharath Sathuri**
- **Email**: [bharathsathuri@gmail.com](mailto:bharathsathuri@gmail.com)
- **Ownership & Attribution**: Project architecture, concept, and ownership credits belong exclusively to **Bharath Sathuri** now and in all future iterations.

---

## 🤝 Contributing & Community

Contributions from the open-source community, screenwriters, and filmmakers are warmly welcomed!

If you would like to contribute:
1. **Fork** the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m "Add your feature description"`.
4. Push to your branch: `git push origin feature/your-feature-name`.
5. Open a **Pull Request** detailing your enhancement.

All contributions are subject to project review while maintaining primary owner attribution to Bharath Sathuri.

---

## 💬 Reviews, Feedback & Feature Requests

Have thoughts on OpenLipi, workflow feedback, or ideas for new screenwriting features?

- **Interactive In-App Feedback**: Use the built-in **Overview / Home Page** review form or click **Feedback** in the top navigation to post your review directly to the community wall.
- **Email the Creator**: Send your suggestions or inquiries directly to **[bharathsathuri@gmail.com](mailto:bharathsathuri@gmail.com)**.
- **GitHub Issues**: Open a new issue with the label `feedback` or `feature-request`.

---

## 📄 Importing Director Reference Scripts & Public PDFs

Directors often share reference screenplays in PDF format for tone, camera direction, and scene pacing. **OpenLipi** includes a built-in coordinate-aware PDF screenplay parser:

1. Click **Import** (or press `Cmd/Ctrl + O`).
2. Drag and drop any **Director Reference Screenplay PDF** or public screenplay file into the importer.
3. The engine parses the PDF layout based on industry standard margin coordinates:
   - **Scene Headings (Sluglines)** (`INT. / EXT.`)
   - **Character Names** (centered uppercase headers, distinguishing dialogue from all-caps action)
   - **Parentheticals** (inflections in parentheses)
   - **Dialogue** (centered spoken dialogue columns)
   - **Action Descriptions & Camera Transitions**
4. Read, annotate with script notes, or edit the imported reference screenplay directly in the editor.

---

## ✨ Core Features

### 1. Screenplay Industry Standard 1:1 Formatting
- Authentic **Courier Prime 12pt** with precision 51-line page height calibration matching Hollywood output page-for-page.
- Proper industry margins: **1.5" left binding margin** (for three-hole script brad fasteners), **1.0" right, top, and bottom margins**.
- Standard **35-character dialogue columns** (`252pt`) and automatic `(MORE)` and `(CONT'D)` dialogue page-break splits.
- All standard screenplay elements:
  - **Scene Heading (Slugline)** (`Cmd/Ctrl + 1`)
  - **Action** (`Cmd/Ctrl + 2`)
  - **Character** (`Cmd/Ctrl + 3`)
  - **Parenthetical** (`Cmd/Ctrl + 4`)
  - **Dialogue** (`Cmd/Ctrl + 5`)
  - **Transition** (`Cmd/Ctrl + 6`)
  - **Dual Dialogue** (`Cmd/Ctrl + 7` — simultaneous side-by-side character speech)
  - **Shot** (`Cmd/Ctrl + 8`)
- Smart `Tab` & `Enter` element cycle (e.g. Enter on Scene Heading advances to Action; Tab on Action jumps to Character; Enter on Character jumps to Dialogue; Tab on Dialogue inserts Parenthetical).
- Intelligent autocomplete for `INT.`, `EXT.`, locations, standard times of day, and character names.

### 2. Version Control System & Visual Diff Inspector
- **Automatic & Manual Snapshots**: Captures version snapshots upon significant writing changes, and allows manual milestone tagging (`Cmd/Ctrl + S` or via UI).
- **Pre-Restore Safety Backups**: Automatically backs up the current state before rolling back to any historical draft.
- **Visual Diff Inspector**: Compares any version against the working draft with green additions (`+`), red strikethrough deletions (`-`), and amber modifications (`~`).
- **One-Click Restoration**: Instant rollback to any saved milestone.

### 3. Real-Time Collaborative Editing (Zero Server Cost)
- Runs peer-to-peer over **WebRTC DataChannels** (PeerJS) with local **BroadcastChannel** support.
- Shareable 6-letter room code and 1-click invite link (`?room=XYZ`).
- Live collaborator cursor indicators, nametags, in-room script chat, and inline notes.

### 4. Dedicated Multi-Format Export Module
- **Hollywood PDF**: Exact 12pt Courier screenplay format, 1.5" brad margins, page numbering at top-right, and title page.
- **Microsoft Word (`.docx`)**: Industry-compatible paragraph styles and indentations for MS Word, LibreOffice, and Google Docs.
- **Fountain (`.fountain`)**: Universal open-source plain-text standard.
- **Final Draft XML (`.fdx`)**: Compatible with Final Draft 8–13.
- **Formatted Plain Text (`.txt`)** and **Full JSON Project Backups**.
- **Direct Browser Print to PDF** (`@media print`).

### 5. Writer & Director Production Outlining Tools
- **Home & Overview Page**: Comprehensive feature tour, project overview, and interactive community reviews wall.
- **Beat Board (Index Cards View)**: Visual corkboard to structure acts, assign color tags, and write beat notes.
- **Scene Outliner**: Sidebar navigator with quick jump and scene reordering.
- **Character Arc Tracker**: Dialogue line count, word count, percentage of script, and scene appearances.
- **Script Statistics**: Estimated running time (1 page ≈ 1 minute rule), dialogue vs. action ratio, INT/EXT location distribution.
- **Revision Tracking**: Industry standard draft colors (White, Blue, Pink, Yellow, Green, Goldenrod).
- **Typewriter Scrolling & Focus Mode**: Center-locks the active line vertically and dims non-focused elements.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Cmd/Ctrl + 1` | Scene Heading (Slugline) |
| `Cmd/Ctrl + 2` | Action / Narrative |
| `Cmd/Ctrl + 3` | Character Name |
| `Cmd/Ctrl + 4` | Parenthetical |
| `Cmd/Ctrl + 5` | Dialogue |
| `Cmd/Ctrl + 6` | Transition |
| `Cmd/Ctrl + 7` | Dual Dialogue |
| `Cmd/Ctrl + 8` | Shot |
| `Tab` | Smart element progression (Action → Character, Dialogue → Parenthetical) |
| `Enter` | Smart next line element |
| `Cmd/Ctrl + S` | Commit Snapshot / Force Save |
| `Cmd/Ctrl + H` | Open Version History & Diff Inspector |
| `Cmd/Ctrl + E` | Open Export Modal |
| `Cmd/Ctrl + O` | Open Import Modal (PDF, Fountain, FDX) |

---

## 📜 License

MIT License. Designed and maintained by **Bharath Sathuri**.
