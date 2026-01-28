https://swiftselfschedule.com

# SWIFT: Schedule, Wages, Income, Financial Tracker

**A Self-Scheduling Concept for CSC Security Operations**

Developed by **Miles A. Moore**  
*Outside We Stand Eternally, LLC*

---

## 🚀 Overview

**SWIFT** is a mobile-first, high-performance web application designed to streamline the deployment and financial tracking of security personnel. Replicating the modern "WISH" app interface, SWIFT provides a seamless bridge between operational management and frontline staff.

It solves the "Last Mile" problem in event staffing by allowing workers to self-schedule into open slots while providing real-time financial transparency—calculating exact net take-home pay based on localized tax rates.

## ✨ Key Features

### 🛡️ For Security Professionals (Staff)
- **Self-Scheduling Marketplace:** Browse and claim open security details at major venues (Lucas Oil Stadium, Gainbridge Fieldhouse, etc.).
- **Live Earnings Tracker:** See exactly how much you've earned gross and net (after taxes) for upcoming shifts.
- **Smart Archive:** A full history of past earnings grouped by month and week for tax preparation and financial planning.
- **Manual Sync:** Quick-entry tool to add shifts that aren't yet in the digital system.

### 👔 For Operational Management (Admin)
- **Gig Dispatch:** Create and broadcast new security details to the entire workforce instantly.
- **Worker Approvals:** Manage a queue of claim requests to ensure the right staff are assigned to the right posts.
- **Deployment Overview:** Real-time visibility into current and future staffing levels.

### 📊 Tax Engine
- **Localized Presets:** Pre-configured tax rates for Indianapolis, Chicago, Nashville, Louisville, Cincinnati, and Columbus.
- **Deep Precision:** Accounts for Federal, FICA, State, and County (e.g., Marion Co 2.02%) withholdings.
- **Custom Mode:** Allows users to input their specific withholding percentages for total accuracy.

## 🛠️ Technical Architecture

SWIFT is built as a highly responsive **Progressive Web App (PWA)** using:

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS (Custom "Wish-inspired" dark theme)
- **Build Tool:** Vite
- **Storage:** LocalStorage-based "Development Backend" (Relational User/Shift structures)
- **Deployment Ready:** Architecture prepared for migration to production SQL/NoSQL databases with centralized authentication.

## 📁 Repository Structure

- `/src/components`: Modular UI components (FinancialSummary, Marketplace, EmployerDashboard, etc.)
- `/src/services`: Mock development backend and API simulation.
- `/src/utils`: High-precision financial and time calculation engines.
- `types.ts`: Strongly typed data structures for Users, Shifts, and Sessions.

## 📜 Intellectual Property & Credits

This application is a conceptual prototype developed to demonstrate modernized workforce management in the security sector.

- **Developer:** Miles A. Moore
- **Organization:** Outside We Stand Eternally, LLC
- **Concept:** Self-scheduling for CSC (Contemporary Services Corporation) Security Operations.

## 🔗 Links

- **Repository:** [https://github.com/destroyallsecrets](https://github.com/destroyallsecrets?)

---
*Disclaimer: This is a conceptual tool and is not an official product of Contemporary Services Corporation. All trademarks belong to their respective owners.*
