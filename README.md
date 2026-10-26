# 🏛️ AuditSikkim Pro — ULB Assessment & Certification Terminal

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Portal-success?style=for-the-badge&logo=github&logoColor=white)](https://phuchungbhutia.github.io/audit-sikkim/generator/)
[![Framework](https://img.shields.io/badge/Audit%20Framework-CAG%20TGS%20%2F%20NMAM-blue?style=for-the-badge&logo=gov.uk&logoColor=white)](https://cag.gov.in)
[![Static Site Engine](https://img.shields.io/badge/Hugo-v0.128.0-FF4088?style=for-the-badge&logo=hugo&logoColor=white)](https://gohugo.io/)
[![Database](https://img.shields.io/badge/IndexedDB-Dexie.js%20Persistence-336791?style=for-the-badge&logo=sqlite&logoColor=white)](https://dexie.org/)
[![License](https://img.shields.io/badge/License-Government%20Official-green?style=for-the-badge)](LICENSE)

An interactive, terminal-based local audit assessment and report compilation portal designed for the **Directorate of Local Fund Audit (DLFA), Finance Department, Government of Sikkim**, under the **Technical Guidance & Supervision (TGS)** framework of the **Comptroller & Auditor General (CAG) of India**.

---

## ⚡ Live Terminal Portal

Access the interactive web console:  
👉 **[https://phuchungbhutia.github.io/audit-sikkim/generator/](https://phuchungbhutia.github.io/audit-sikkim/generator/)**

---

## 📌 Key Capabilities

- **42-Area Scoring Engine**: Evaluates ULB accounts across all 7 CAG parameters carrying a 100-point composite score.
- **Client-Side Persistence (IndexedDB)**: Full local browser storage via Dexie.js—no external server or credentials required.
- **Real-Time Risk Categorization**:
  - 🟢 **Green Group ($\ge 60\%$)**: Low Risk (Routine monitoring)
  - 🟠 **Orange Group ($35\% - 59.9\%$)**: Moderate Risk (Targeted capacity-building & oversight)
  - 🔴 **Red Group ($< 35\%$)**: Significant Risk (Urgent administrative intervention)
- **Instant Official Reports**: Compiles formal 20-page CAG report drafts ready for printing or Markdown export.
- **Data Portability**: Dump and restore entire audit registries using JSON backup files.

---

## 🎯 7 CAG Assessment Dimensions

| Sl. | Parameter Dimension | Weight | Operational Scope |
|:---:|:--------------------|:------:|:------------------|
| 1 | **Mandate and Adoption of NMAM** | **7%** | Adoption of National Municipal Accounts Manual & DLFA manuals |
| 2 | **Core Accounting System & Principles** | **25%** | Accrual conversion, asset capitalization (>₹5,000), depreciation, statutory dues |
| 3 | **Financial Documentation & Procedures** | **15%** | Daily/monthly cash book closure, voucher discipline, cut-off accruals |
| 4 | **Fund, Grant, and Asset Management** | **12%** | Dedicated grant bank accounts, unspent balance refund, asset registers |
| 5 | **Internal Controls and Reporting** | **15%** | Quarterly Budget Variance Reports (BVR), monthly BRS, Cityfinance uploads |
| 6 | **Governance** | **11%** | Staffing competence, accounting software audit trail / edit logs |
| 7 | **Quality of Audit** | **15%** | Auditor competence, DLFA capacity, working papers, analytical depth |

---

## 💻 Terminal Command Reference

Once inside the interactive terminal console, use these commands:

```text
db list              - List all saved ULBs and their scores
db load [id]         - Load an entity into the active session (e.g., db load njmc)
db save              - Commit current scores and profile to IndexedDB
db new [id] [name]   - Initialize a new assessment entity
db export            - Download complete database as a .json backup file
profile              - Display active auditee details and delay metrics
set [key] [val]      - Update a profile attribute (e.g., set software TallyPrime)
mark [id] [fc|pc|nc] - Score an item (e.g., mark 2.7 fc)
score                - Calculate composite score and assign risk matrix
report               - Compile formal CAG report ready for printing
export-md            - Download official report in Markdown (.md) format
clear                - Wipe terminal screen history
help                 - Display help menu
🚀 Local Development Setup
Prerequisites
Hugo (v0.120+ extended recommended)

Git

Clone & Run
Bash
# Clone the repository
git clone [https://github.com/phuchungbhutia/audit-sikkim.git](https://github.com/phuchungbhutia/audit-sikkim.git)
cd audit-sikkim

# Run local development server
hugo server -D -b "/"
Open http://localhost:1313/generator/ in your browser.

📂 Project Structure
Plaintext
audit-sikkim/
├── .github/workflows/gh-pages.yml   # Automatic GitHub Pages CI/CD deployment
├── config.toml                      # Hugo site configuration
├── content/
│   ├── _index.md                    # Landing overview
│   └── generator.md                 # Entry point for terminal application
├── layouts/_default/
│   ├── baseof.html                  # Base HTML layout
│   ├── single.html                  # Content wrapper
│   └── terminal-generator.html      # Custom terminal UI & report layout
├── static/
│   ├── css/terminal.css             # Terminal styling & print media layout
│   └── js/
│       ├── audit-db.js              # Dexie.js schema & initial seeds
│       └── terminal-app.js          # CLI parser, scoring engine, report builder
└── README.md
🏛️ Regulatory Authority
Directorate of Local Fund Audit (DLFA), Finance Department, Government of Sikkim

Office of the Accountant General (Audit), Sikkim, Lekhapariksha Bhawan, Deorali, Gangtok

Comptroller & Auditor General of India (CAG) — Local Government Audit (LGA) Wing
