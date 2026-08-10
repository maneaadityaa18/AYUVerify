<!-- GSD:project-start source:PROJECT.md -->

## Project

**AyurVerify**

AyurVerify is an AI-powered medicinal plant and Ayurvedic raw-material identification and supply-chain verification platform. It allows different supply-chain participants (Collectors, Wholesalers, Distributors, Manufacturers, Experts, Admins) to register with unique Participant IDs, identify medicinal plants using YOLOv8n AI, create digital material batches with unique Batch IDs, transfer batches through the supply chain with accept/reject workflows, and track complete identification and verification history.

**Core Value:** Every registered supply-chain participant gets a unique Participant ID, every identified material batch gets a unique Batch ID that remains constant throughout the material's journey, and the complete supply-chain traceability (identification + verification + transfer events) is visible to all authorized participants.

### Constraints

- **Tech stack**: React.js + Vite + Tailwind CSS — specified in Frontend.md
- **Backend dependency**: Frontend must use FastAPI backend API — never direct DB or YOLO access
- **ID generation**: Participant IDs and Batch IDs must come from backend — never generated on frontend
- **Risk rules**: Frontend must NOT decide risk rules — backend Risk Engine decides
- **API contract**: Frontend must use actual backend contract — never invent API responses
- **Security**: Never show raw FastAPI errors or stack traces to users
- **Timeline**: SIH prototype — build in 8 phases as specified in Frontend.md Section 73

<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
