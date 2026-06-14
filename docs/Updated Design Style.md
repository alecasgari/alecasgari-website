# FILE 2: DESIGN LANGUAGE & STYLE GUIDE

## 1. THE CORE DESIGN IDENTITY
The website must feel **professional, modern, and highly technical but clean**. It must avoid looking like a busy graphic designer's site or a completely blank text document. It balances software engineering aesthetics with enterprise reliability.

### THE COLOR PALETTE (MONOCHROME WITH A SHARP ACCENT)
*   **Primary Background (Dark Mode Default):** Deep Slate Gray / Near Black (`#0F172A` or `#1E293B`).
*   **Primary Background (Light Mode Option):** Crisp Off-White (`#F8FAFC`).
*   **Text Color:** Pure White (`#FFFFFF`) for dark mode / Dark Charcoal (`#0F172A`) for light mode.
*   **Accent Color (The Energy):** Electric Blue (`#2563EB`) or Tech Cyan (`#06B6D4`). Use this color *only* for links, CTA buttons, active status highlights, and network connecting lines.
*   **Muted Elements:** Cool Gray (`#64748B`) for borders and sub-headers.

### TYPOGRAPHY
*   **Font Family:** Use a clean, highly readable Sans-Serif font like **Inter**, **SF Pro Display**, or **Roboto**.
*   **Headings:** Bold, sharp, with tight letter-spacing.
*   **Body Text:** Regular weight, slightly larger line-height (1.6) to guarantee effortless readability.

---

## 2. PAGE-BY-PAGE UI & STYLING INSTRUCTIONS

### A. THE HOME PAGE LAYOUT
*   **Hero Visual:** Instead of a generic stock photo, display a clean, high-contrast professional headshot of Alec on one side. On the background or side panel, integrate a very subtle, modern, semi-transparent node map or workflow diagram animation (representing n8n/Make pipelines)[cite: 1, 2].
*   **The "Choose Your Path" Section UI:** 
    *   Style this as two large, side-by-side interactive cards[cite: 1, 2]. 
    *   When a user hovers over the **Systems Analyst card**, the border glows with the accent color, and the button shifts gently[cite: 1].
    *   Keep the PDF download icons clean and visible[cite: 1, 2].
*   **Metrics Grid:** Display the numbers (`100+`, `100%`, etc.) in massive, bold font sizes using the Accent color, with the explanation text below them in muted gray[cite: 1, 2].

### B. THE ABOUT ME PAGE LAYOUT
*   **Layout Grid:** Split layout. Left column holds the timeline and narrative story[cite: 1, 2]. Right column holds the strict corporate badges (ACS Assessment, PTE score, and Certifications)[cite: 1, 2].
*   **Visual Badges:** Render certifications (ISO 9001, CCNA, Google UX) as uniform, clean, monochrome grid icons[cite: 1, 2]. When hovered, they reveal their full color or detailed issuer metadata[cite: 1, 2].

### C. THE CASE STUDIES PAGE LAYOUT
*   **Structure:** Do not use long, unformatted text blocks. Use the standard **Problem / Solution / Impact** grid block system.
*   **Visual Code-Bits:** For Case Study 1 (ERPNext) and Case Study 3 (AI Automation Engine), place a tiny visual element next to the text—such as a clean, micro-styled representation of an API webhook or an internal system flowchart[cite: 1, 2].
*   **The Impact Box:** The "Impact" section of every case study must be styled inside a light gray or dark-tinted highlight callout box using checkmarks instead of regular bullet points to emphasize successful completion[cite: 1, 2].

### D. THE CONTACT PAGE LAYOUT
*   **Form Style:** Clean, border-only input fields. Fields animate with a sharp accent color border focus when clicked.
*   **Integration Touch:** Set up a clean layout that makes the direct email and phone number prominent[cite: 1, 2]. If possible, embed a clean, minimalist scheduling widget (like Calendly) inside a modal box for recruiters to immediately book a call.

---

## 3. ANIMATION & UX GOALS
*   **Page Transitions:** Loading times must be lightning-fast (aim for under 1 second). Use modern code structures to ensure smooth, zero-latency rendering[cite: 1].
*   **Micro-interactions:** Buttons should have slight elevation changes or fill-color transitions when hovered. 
*   **Responsiveness:** Total mobile optimization is mandatory. The two-column cards on the Home and Case Studies pages must collapse into a clean, single-column scroll layout on mobile devices.