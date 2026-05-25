# NYS CDL Class B Prep Portal

A lightweight, focused, and highly effective web application designed to help users prepare for the New York State DMV CDL-10 Class B / Passenger Bus exam.

## Purpose

This application is built with a singular goal: to help users study seriously and effectively. Instead of relying on gimmicks, it focuses on providing a stable, high-quality question bank derived from the official NY DMV CDL-10 manual. It tracks your progress, identifies your weaknesses, and prevents you from answering the exact same questions repeatedly within the same session.

*Note: These are original study questions based on the manual topics. They are not official DMV exam questions.*

## Features

* **Complete Study Coverage:** Covers General Knowledge, Passenger Endorsement, Air Brakes, Pre-Trip Inspection, Basic Vehicle Control, and Road Test / Safe Driving.
* **Smart Practice Modes:**
  * **Section-Specific Tests:** Focus intensely on one area (e.g., Air Brakes only).
  * **Full Study Simulator:** A comprehensive 95-question test simulating the stamina and breadth required for the real exam path.
* **Weak Areas Review:** The app tracks the categories where you score below 80% and allows you to launch a targeted "Study Mode" to review those exact questions and explanations without the stress of a scored test.
* **Attempt History:** Every test you take is logged. You can click on past attempts to see a breakdown of your score and review the specific questions you missed.
* **Question Pool Tracking:** Uses a Fisher-Yates shuffle and session memory to ensure you see fresh questions instead of endless repeats.
* **Zero Dependencies:** Built entirely with Vanilla JavaScript and HTML. It uses Tailwind CSS via CDN for styling, meaning no build steps or `npm installs` are required to run it locally.
* **Mobile Friendly & Dark Mode:** Fully responsive interface that adapts to mobile devices, with a built-in toggle for comfortable nighttime studying.

## Getting Started

Because this project is a self-contained, single-page application, getting started takes seconds:

1. Clone or download the repository.
2. Open `index.html` in your favorite web browser.
3. Start studying!

No local server, database setup, or build processes are required. All history and tracking data is stored securely and privately in your browser's local storage.
