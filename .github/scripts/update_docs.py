#!/usr/bin/env python3
"""
Auto-updates REQUIREMENTS.md, SKILLS.md, and CLAUDE.md using Claude AI
whenever a GitHub issue is opened or a feature is pushed to main.
"""

import os
import json
import sys
import re
import anthropic

EVENT_NAME = os.environ.get("GITHUB_EVENT_NAME", "")
EVENT_PATH = os.environ.get("GITHUB_EVENT_PATH", "")

if not EVENT_PATH or not os.path.exists(EVENT_PATH):
    print("No event payload found.")
    sys.exit(0)

with open(EVENT_PATH, encoding="utf-8") as f:
    event = json.load(f)


def read_file(path):
    try:
        with open(path, encoding="utf-8") as fh:
            return fh.read()
    except FileNotFoundError:
        return ""


requirements_md = read_file("REQUIREMENTS.md")
skills_md       = read_file("SKILLS.md")
claude_md       = read_file("CLAUDE.md")

# Build event context
if EVENT_NAME == "issues":
    issue  = event["issue"]
    action = event["action"]
    labels = ", ".join(lbl["name"] for lbl in issue.get("labels", [])) or "none"
    context = (
        f"A GitHub issue was {action}.\n"
        f"Issue #{issue['number']}: {issue['title']}\n"
        f"Labels: {labels}\n"
        f"Body:\n{issue.get('body', 'No description provided.')}"
    )
    focus = (
        "A new issue has been created representing planned or upcoming work. "
        "Update the docs to reflect what is planned (mark as 🔲 in REQUIREMENTS.md "
        "if it is a new requirement, add relevant upcoming skills to SKILLS.md, "
        "and note anything architecturally significant in CLAUDE.md)."
    )

elif EVENT_NAME == "push":
    commits = event.get("commits", [])
    if not commits:
        print("Push event has no commits — skipping.")
        sys.exit(0)
    commit_lines = "\n".join(f"- {c['message'].splitlines()[0]}" for c in commits)
    # Collect modified files across all commits
    changed_files = sorted({
        f for c in commits
        for f in c.get("added", []) + c.get("modified", []) + c.get("removed", [])
    })
    context = (
        f"A push was made to main branch.\n"
        f"Commits:\n{commit_lines}\n"
        f"Changed files: {', '.join(changed_files) if changed_files else 'unknown'}"
    )
    focus = (
        "New code has been merged to main. Update the docs to reflect completed work: "
        "mark requirements as ✅ if they are now implemented, add any new skills introduced, "
        "and update CLAUDE.md if the architecture, commands, or conventions changed."
    )

else:
    print(f"Unsupported event type: {EVENT_NAME} — skipping.")
    sys.exit(0)

print(f"Event: {EVENT_NAME}")
print(f"Context:\n{context}\n")

# Call Claude API
client = anthropic.Anthropic()

prompt = f"""You are a technical writer maintaining living documentation for the \
**Inventory Waste Predictor AI** project (FastAPI + React + in-memory store, \
migrating to .NET backend).

{focus}

## Event Context
{context}

---

## Current REQUIREMENTS.md
{requirements_md}

---

## Current SKILLS.md
{skills_md}

---

## Current CLAUDE.md
{claude_md}

---

## Instructions
Update all three documents based on the event context above. Rules:
- Only update sections that are genuinely affected by this event.
- In REQUIREMENTS.md: update status (✅ done, 🔲 planned), add new FR-* or REQ-* entries \
if the event introduces genuinely new requirements, following the existing format.
- In SKILLS.md: add new skills if the feature introduces new technologies or patterns; \
update the phase roadmap table if applicable.
- In CLAUDE.md: update commands, architecture notes, or file structure only if something \
materially changed.
- Do NOT add speculative, placeholder, or "TBD" content.
- Preserve all existing content that is not affected by this event.
- Keep the same markdown formatting and section structure.

Return ONLY a valid JSON object (no markdown fences, no extra text) with exactly these keys:
{{
  "requirements_md": "<full updated REQUIREMENTS.md content>",
  "skills_md": "<full updated SKILLS.md content>",
  "claude_md": "<full updated CLAUDE.md content>",
  "summary": "<one sentence describing what was updated and why>"
}}"""

print("Calling Claude API...")
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8096,
    messages=[{"role": "user", "content": prompt}],
)

raw = response.content[0].text.strip()

# Strip markdown code fences if present
raw = re.sub(r"^```(?:json)?\s*", "", raw)
raw = re.sub(r"\s*```$", "", raw)

try:
    updates = json.loads(raw)
except json.JSONDecodeError as exc:
    print(f"Failed to parse Claude response as JSON: {exc}")
    print("Raw response (first 500 chars):", raw[:500])
    sys.exit(1)

# Write updated files
for filename, key in [
    ("REQUIREMENTS.md", "requirements_md"),
    ("SKILLS.md",       "skills_md"),
    ("CLAUDE.md",       "claude_md"),
]:
    content = updates.get(key, "")
    if content:
        with open(filename, "w", encoding="utf-8") as fh:
            fh.write(content)
        print(f"Updated {filename}")
    else:
        print(f"No update returned for {filename} — leaving unchanged.")

print(f"\nSummary: {updates.get('summary', 'Docs updated.')}")
