# GEMINI.md — NYS CDL Pro-Prep Portal Operating Contract

This project is a NYS CDL-10 Class B / bus exam prep web app.

The main goal is to help the user study seriously for:
- General Knowledge
- Passenger endorsement
- Air Brakes
- Pre-Trip Inspection
- Basic Vehicle Control
- Road Test / Safe Driving

This app must be simple, accurate, stable, and useful for studying.

Do not treat it as a generic landing page project.

---

## 0. Highest Priority

The app must help the user study enough to feel prepared for the NYS CDL-10 exam path.

Top priorities:

1. Accurate study coverage
2. Large high-quality question bank
3. No repeated questions inside the same test
4. Simple explanations
5. Clear pass/fail feedback
6. Stable app behavior
7. No broken existing features

Do not make cosmetic changes that weaken study quality.

---

## 1. Official Study Scope

Use the NY DMV CDL-10 manual structure as the source map.

Required coverage:

- Section 1: Introduction / CDL rules
- Section 2: Driving Safely
- Section 3: Transporting Cargo Safely
- Section 4: Transporting Passengers
- Section 5: Air Brakes
- Section 11: Pre-Trip Inspection
- Section 12: Basic Vehicle Control
- Section 13: Road Test

Do not claim the app contains real DMV exam questions.

Use this wording when needed:

> These are original study questions based on CDL-10 manual topics. They are not official DMV exam questions.

Hazmat, School Bus, Tanker, Doubles/Triples, and Combination Vehicles are optional future modules unless the user asks for them.

---

## 2. Current App Architecture

The app is currently a single-file HTML app using:

- HTML
- Tailwind CSS via CDN
- Vanilla JavaScript
- localStorage
- Dark mode
- Guided mode
- Unguided mode
- Final simulator
- Past attempt history
- Question pool tracking
- Fisher-Yates shuffle logic

Preserve this structure unless there is a clear reason to split files.

Do not add a framework unless explicitly asked.

Do not add dependencies unless the benefit is clear and small.

---

## 3. Question Bank Rules

The question bank is the most important part of this project.

Minimum target:
- 400 high-quality questions

Preferred coverage:
- General Knowledge: 150
- Passenger Transport: 75
- Air Brakes: 90
- Pre-Trip Inspection: 50
- Basic Vehicle Control: 20
- Road Test: 25
- Emergency Procedures: 25

Every question must be meaningful and unique.

Do not inflate the question count with repeated templates.

Bad pattern:
- “Scenario Rule #1”
- “Scenario Rule #2”
- Same question repeated with only a number changed

This must be removed or avoided.

---

## 4. Question Object Format

Use this format unless the existing app requires a compatible format:

```js
{
  id: "GK-001",
  category: "gen",
  displayCategory: "General Knowledge",
  section: "Section 2 - Driving Safely",
  q: "Question text here?",
  options: [
    "Answer choice A",
    "Answer choice B",
    "Answer choice C",
    "Answer choice D"
  ],
  correct: 0,
  exp: "Short explanation of why the answer is correct."
}
```

---

## 5. Pre-Publish Validation

Before finalizing any changes or publishing code, you must ensure everything is working as intended.
- **Run local tests**: Verify UI changes manually or run any available automated tests.
- **Check for regressions**: Ensure existing functionality (like practice modes, history, and scoring) still works.
- **Do not publish broken code**: Never deliver a solution that introduces a new bug.