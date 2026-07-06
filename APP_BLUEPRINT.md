# CDL Pro-Prep Portal: App Blueprint

## 1. Project Overview
The NYS CDL Pro-Prep Portal is a dedicated web application designed to help commercial drivers study for and pass the New York State CDL-10 Class B and Bus exams. It offers a structured, interactive studying experience using a curated bank of over 400 questions spanning the essential DMV manual categories. 

This app is for anyone seeking to acquire their Class B commercial driver's license with passenger and air brake endorsements. It solves the problem of inefficient studying by tracking question history to prevent repetitive memorization, identifying weak knowledge areas, and providing full simulator tests to gauge exam readiness.

## 2. Core Purpose
The main goal of the app is to prepare the user thoroughly for the NYS CDL-10 exam path. The value provided is a targeted, data-driven study method. Rather than blindly taking generic tests, users can review their specific weak areas, track performance over time, and read clear explanations for every incorrect answer.

## 3. Main Features
- **Home / Landing Page:** A welcoming entry point that clearly explains the app's purpose and directs new users to start practicing or read the guide.
- **Dynamic Question Pool:** Tracks exactly which questions a user has seen. Prioritizes unseen questions to force users to learn the entire manual rather than memorizing a small subset of repeating questions.
- **Practice Modes:** Focused tests on specific categories (General Knowledge, Passenger, Air Brakes).
- **Full Simulator:** A 95-question test that simulates the real exam structure. Users must achieve a passing score in *each* sub-section to pass.
- **Weak Areas Review:** Analyzes historical performance to generate custom tests containing only categories where the user scores below the passing threshold.
- **Difficulty Selector:** Allows users to adjust the required passing threshold (80%, 95%, or 98%) to increase the challenge.
- **Bilingual Support (English/Spanish):** Full UI toggling and dynamic question translation mapping, matching the official DMV Spanish terminology.
- **Performance Dashboard:** Visualizes average scores, total tests taken, and category-by-category breakdowns.
- **Test History:** A chronological record of all past attempts, allowing users to review missed questions and explanations from previous tests.
- **Help Section (Quick Manual):** An embedded guide detailing how to use the app, practice modes, and adjust settings.
- **Dark Mode:** A toggleable theme for comfortable studying in low-light environments.

> **Note regarding prompt requirements:** Features such as "Posting," "Commenting," "Calendars," or "Task tracking" are not applicable to the scope of this exam preparation tool and do not exist in the architecture.

## 4. How the App Works (User Flow)
1. **Entry:** The user lands on the Home view. They are greeted with the app's purpose and given two primary options: Start Practicing or View Dashboard.
2. **Setup:** The user navigates to the Practice Modes page. They select their desired language (English/Spanish) and their target difficulty (e.g., 80% passing score).
3. **Taking a Test:** The user selects a specific test (e.g., General Knowledge). The app loads the Exam view.
4. **Exam Loop:** The user reads the question and selects an answer (A, B, C, D). Upon selection, they immediately receive feedback (correct/incorrect) and a detailed explanation. They cannot change their answer. They click "Next" to proceed.
5. **Results:** Once the test finishes, the user is taken to the Results view. They receive a PASS/FAIL grade, a breakdown of their score per category, and a list of all missed questions with the correct answers and explanations.
6. **Review:** The user returns to the Dashboard to see how this recent test affected their overall stats. They can then navigate to the Weak Areas mode to focus exclusively on their struggling categories.

## 5. Technical Blueprint
- **Architecture:** A client-side Single Page Application (SPA) built using Vanilla HTML, JavaScript, and Tailwind CSS. No build step or framework (like React or Vue) is used, keeping the project lightweight and simple to host (e.g., on GitHub Pages).
- **Files:**
  - `index.html`: The single HTML file containing all UI views (dashboard, practice, exam, results, history, help, home). Views are toggled by manipulating CSS display classes.
  - `app.js`: Contains all the application logic, state management, exam generation, and navigation.
  - `questions.js`: The English question bank (assigned to `window.questionBank`).
  - `questions_es.js`: The Spanish translation mapping (assigned to `window.questionBankEs`).
- **Data Structure (Questions):**
  Questions are objects containing `id`, `category`, `q` (question text), `options` (array of strings), `correct` (index), and `exp` (explanation).
- **State Management:**
  The `state` object in `app.js` holds the `currentView`, `exam` tracking (active, timer, sections, answers), `config` (passing score), `history`, and `pool`.
- **Persistence:** 
  The app relies entirely on the browser's `localStorage` to persist the question pool (`cdl_pool`), test history (`cdl_history`), language preference (`cdl_lang`), theme (`theme`), and difficulty (`cdl_passing_score`).
- **Translations:**
  Translations are handled via a lookup function (`getTranslatedQuestion(q)`) that matches English question IDs with Spanish question objects in `questions_es.js` just in time for rendering.
- **Responsive Layout:**
  Tailwind CSS utility classes (`md:`, `sm:`, `hidden`, `flex`) are utilized extensively to adapt the layout. A sidebar navigation is used on desktops, which converts into a top-header with a hamburger overlay menu on mobile devices.

## 6. Maintenance Rules & Living Documentation Requirement
The app documentation must evolve as the project grows.

**CRITICAL RULE:**
> “Whenever the app changes, the App Blueprint, Help section, and any user instructions must be reviewed and updated. If a feature is added, removed, renamed, or changed, the documentation must be updated in the same task so it remains accurate and useful.”

As a developer maintaining this app, you must:
1. Add new features to the **Main Features** and **Technical Blueprint** sections of this document when they are built.
2. Update the embedded HTML Help section (`view-help` in `index.html`) so users understand new features.
3. Remove outdated instructions if a feature is deprecated.
4. Ensure a new developer can read this blueprint and immediately understand how to compile, modify, or rebuild the application.
