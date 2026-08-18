# 🦷 DentalTrack Pro 

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

**DentalTrack Pro** is a modern, responsive, and serverless Patient Visit Tracking Dashboard designed specifically for Dental Clinics. It runs entirely in the browser using Vanilla JavaScript and LocalStorage, requiring **zero backend infrastructure**.

## 🚀 Live Demo
> **[Insert Your Live Demo Link Here]**

**Demo Login Credentials:**
- **Email:** `doctor@gmail.com`
- **Password:** 

---

## ✨ Features

* **Zero Backend (Serverless):** All patient records, settings, and themes are stored securely in the browser's `localStorage`.
* **Live Analytics Dashboard:** Real-time KPIs (Total Patients, Revenue, Avg Fee) and 4 interactive Chart.js visualizations (Daily Visits, Monthly Revenue, Age Demographics, Top Treatments).
* **Patient Management (CRUD):** Add, search, filter, and delete patient records with client-side pagination.
* **Specialized Dental Treatments:** Pre-configured for dental procedures (Root Canals, Extractions, Implants, Braces, etc.).
* **Print-Ready Clinical Slips:** Generate clean, professional patient receipts with digital signatures using custom `@media print` CSS.
* **Financial Reports & CSV Export:** Generate time-based financial reports and export entire patient directories to `.csv` with a single click.
* **Dynamic Doctor Profile:** Customize the clinic name, doctor's name, qualifications, and contact details. Updates instantly reflect on all slips and reports.
* **Modern UI/UX:** Built with Tailwind CSS, featuring glassmorphism, animated toasts, and a persistent **Dark/Light Mode**.

---

## 🛠️ Tech Stack

* **Markup:** HTML5 (Semantic & Accessible)
* **Styling:** Tailwind CSS v4 (via CDN) + Custom CSS
* **Logic:** Vanilla JavaScript (ES6)
* **Data Visualization:** Chart.js
* **Icons:** Font Awesome v6
* **Database:** Browser LocalStorage API

---

## 📂 Project Structure

```text
dental-track-pro/
├── index.html          # Login portal (dummy authentication)
├── dashboard.html      # Main Single Page Application (SPA)
├── css/
│   └── style.css       # Custom animations, dark mode, and print overrides
├── js/
│   ├── auth.js         # Session management & login validation
│   ├── storage.js      # LocalStorage CRUD and demo data seeder
│   ├── dashboard.js    # KPI calculations & recent visits table
│   ├── charts.js       # Chart.js initialization and rendering
│   ├── patients.js     # Patient form handling, filtering, and pagination
│   └── reports.js      # Financial reports and CSV export generation
└── assets/
    ├── logo.png        # Clinic Logo (Replace with your own)
    └── logo.svg        # Vector fallback logo
