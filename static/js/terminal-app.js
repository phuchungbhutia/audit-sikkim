const termApp = (() => {
  let activeAudit = null;
  const inputEl = document.getElementById("cli-input");
  const outputEl = document.getElementById("output-stream");
  const screenEl = document.getElementById("term-screen");

  const write = (html) => {
    const el = document.createElement("div");
    el.className = "term-line";
    el.innerHTML = html;
    outputEl.appendChild(el);
    screenEl.scrollTop = screenEl.scrollHeight;
  };

  const calculateScore = (scores) => {
    let sum = 0;
    for (let key in scores) {
      sum += parseFloat(scores[key] || 0);
    }
    const total = parseFloat(sum.toFixed(1));
    const cat = total >= 60.0 ? "GREEN" : total >= 35.0 ? "ORANGE" : "RED";
    return { total, cat };
  };

  const syncActiveCalculations = () => {
    if (!activeAudit) return;
    const { total, cat } = calculateScore(activeAudit.scores);
    activeAudit.compositeScore = total;
    activeAudit.riskCategory = cat;
    activeAudit.lastUpdated = new Date().toISOString();
  };

  const execute = async (rawInput) => {
    const input = rawInput.trim();
    if (!input) return;

    write(`<span class="prompt-user">auditor@dlfa</span><span class="prompt-sep">:</span><span class="prompt-path">~</span><span class="prompt-char">$</span> ${input}`);

    const [cmd, ...args] = input.split(" ");
    const sub = args[0] ? args[0].toLowerCase() : "";

    switch (cmd.toLowerCase()) {
      case "help":
        write(`----------------------------------------------------------------------
SYSTEM COMMAND REFERENCE:
  <span class="text-amber">db list</span>               : List all saved ULB records in IndexedDB
  <span class="text-amber">db load [id]</span>          : Load a record into active session (e.g. db load njmc)
  <span class="text-amber">db save</span>               : Commit active assessment back into IndexedDB
  <span class="text-amber">db new [id] [name]</span>    : Create an empty ULB assessment entity
  <span class="text-amber">db export</span>             : Export complete IndexedDB database to .json file
  <span class="text-amber">profile</span>               : Display active auditee fields and delays
  <span class="text-amber">set [key] [val]</span>         : Modify field (e.g. set software TallyPrime)
  <span class="text-amber">mark [id] [fc|pc|nc]</span>   : Score a parameter area (e.g. mark 2.7 fc)
  <span class="text-amber">score</span>                : Calculate composite score & risk category
  <span class="text-amber">report</span>               : Render full CAG Audit Report for viewing/printing
  <span class="text-amber">export-md</span>            : Export formal report as a Markdown document
  <span class="text-amber">clear</span>                : Wipe terminal screen history
----------------------------------------------------------------------`);
        break;

      case "clear":
        outputEl.innerHTML = "";
        break;

      case "db":
        if (sub === "list") {
          const records = await db.ulbRecords.toArray();
          write(`----------------------------------------------------------------------
INDEXEDDB ULB AUDIT REGISTRY:
ID      | SCORE | MATRIX | FY      | ENTITY NAME
----------------------------------------------------------------------`);
          records.forEach((r) => {
            const padId = (r.id + "       ").slice(0, 7);
            const padScore = (r.compositeScore.toFixed(1) + "     ").slice(0, 5);
            const padCat = (r.riskCategory + "   ").slice(0, 6);
            const padFy = (r.fy + "    ").slice(0, 7);
            const color = r.riskCategory === "GREEN" ? "text-green" : r.riskCategory === "ORANGE" ? "text-amber" : "text-red";
            write(`${padId} | ${padScore} | <span class="${color}">${padCat}</span> | ${padFy} | ${r.ulbName}`);
          });
          write(`----------------------------------------------------------------------`);
        } else if (sub === "load") {
          const id = args[1];
          const rec = await db.ulbRecords.get(id);
          if (rec) {
            activeAudit = rec;
            syncActiveCalculations();
            write(`<span class="text-green">[OK] Loaded active auditee: ${rec.ulbName} (${rec.fy})</span>`);
          } else {
            write(`<span class="text-red">[ERR] ID '${id}' not found in database. Use 'db list'.</span>`);
          }
        } else if (sub === "save") {
          if (!activeAudit) {
            write(`<span class="text-red">[ERR] No active assessment session to save.</span>`);
            return;
          }
          syncActiveCalculations();
          await db.ulbRecords.put(activeAudit);
          write(`<span class="text-green">[OK] Assessment successfully committed to IndexedDB (ID: ${activeAudit.id}, Score: ${activeAudit.compositeScore}).</span>`);
        } else if (sub === "new") {
          const newId = args[1];
          const name = args.slice(2).join(" ");
          if (!newId || !name) {
            write(`<span class="text-red">[ERR] Format: db new [id] [ULB Name]</span>`);
            return;
          }
          activeAudit = {
            id: newId,
            ulbName: name,
            ulbType: "Municipal Council",
            fy: "2024-25",
            dueAfs: "2025-06-30",
            actualAfs: "2025-10-15",
            dueAudit: "2025-09-30",
            actualAudit: "2026-01-20",
            auditor: "DLFA / CA Firm",
            staffVacancy: "1 of 3",
            software: "Tally Prime",
            auditTrail: "Yes",
            cwipUncapitalized: "Rs. 0",
            unremittedDues: "Rs. 0",
            doubtfulReceivables: "Rs. 0",
            brsRatio: "All accounts",
            compositeScore: 0.0,
            riskCategory: "RED",
            scores: {}
          };
          syncActiveCalculations();
          await db.ulbRecords.put(activeAudit);
          write(`<span class="text-green">[OK] Created and loaded new entity: ${name}</span>`);
        } else if (sub === "export") {
          const all = await db.ulbRecords.toArray();
          const jsonStr = JSON.stringify(all, null, 2);
          const blob = new Blob([jsonStr], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Sikkim_ULB_Database_${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          write(`<span class="text-green">[OK] Database dumped to local JSON file.</span>`);
        } else {
          write(`<span class="text-red">[ERR] Unknown db subcommand. Try 'db list', 'db load', 'db save', 'db new', 'db export'.</span>`);
        }
        break;

      case "profile":
        if (!activeAudit) {
          write(`<span class="text-amber">No entity active. Defaulting to 'njmc'...</span>`);
          activeAudit = await db.ulbRecords.get("njmc");
        }
        write(`----------------------------------------------------------------------
ACTIVE AUDIT RECORD:
  • ID / Entity    : ${activeAudit.id} | ${activeAudit.ulbName} (${activeAudit.ulbType})
  • Fiscal Year    : ${activeAudit.fy}
  • Primary Auditor: ${activeAudit.auditor}
  • Accounts AFS   : Due ${activeAudit.dueAfs} | Actual ${activeAudit.actualAfs}
  • Certification  : Due ${activeAudit.dueAudit} | Actual ${activeAudit.actualAudit}
  • Accounting IT  : ${activeAudit.software} (Audit Trail Enabled: ${activeAudit.auditTrail})
  • Uncap. CWIP    : ${activeAudit.cwipUncapitalized}
  • Statutory Dues : ${activeAudit.unremittedDues}
  • BRS Coverage   : ${activeAudit.brsRatio}
----------------------------------------------------------------------`);
        break;

      case "set":
        if (!activeAudit) {
          write(`<span class="text-red">[ERR] Load an entity first ('db load [id]').</span>`);
          return;
        }
        const key = args[0];
        const val = args.slice(1).join(" ");
        if (key && val) {
          activeAudit[key] = val;
          write(`<span class="text-green">[OK] Set attribute '${key}' = '${val}'</span>`);
        } else {
          write(`<span class="text-red">[ERR] Syntax: set [attributeKey] [value]</span>`);
        }
        break;

      case "mark":
        if (!activeAudit) {
          write(`<span class="text-red">[ERR] Load an entity first ('db load [id]').</span>`);
          return;
        }
        const areaId = args[0];
        const grade = (args[1] || "").toLowerCase();
        const weights = {
          "1.1": 2.0, "1.2": 2.0, "1.3": 3.0,
          "2.1": 3.0, "2.2": 3.0, "2.3": 1.0, "2.4": 2.0, "2.5": 3.0, "2.6": 1.0,
          "2.7": 1.0, "2.8": 1.0, "2.9": 1.0, "2.10": 1.0, "2.11": 1.0, "2.12": 1.0,
          "2.13": 1.0, "2.14": 1.0, "2.15": 1.0, "2.16": 1.0, "2.17": 1.0, "2.18": 1.0,
          "3.1": 4.0, "3.2": 3.0, "3.3": 4.0, "3.4": 4.0,
          "4.1": 2.0, "4.2": 3.0, "4.3": 2.0, "4.4": 2.0, "4.5": 3.0,
          "5.1": 3.0, "5.2": 3.0, "5.3": 3.0, "5.4": 3.0, "5.5": 3.0,
          "6.1": 4.0, "6.2": 4.0, "6.3": 3.0,
          "7.1": 5.0, "7.2": 4.0, "7.3": 3.0, "7.4": 3.0
        };

        if (weights[areaId] !== undefined) {
          const maxVal = weights[areaId];
          if (grade === "fc") activeAudit.scores[areaId] = maxVal;
          else if (grade === "pc") activeAudit.scores[areaId] = maxVal / 2;
          else if (grade === "nc") activeAudit.scores[areaId] = 0.0;
          else {
            write(`<span class="text-red">[ERR] Grade must be 'fc', 'pc', or 'nc'.</span>`);
            return;
          }
          syncActiveCalculations();
          write(`<span class="text-green">[OK] Area ${areaId} marked ${grade.toUpperCase()} (${activeAudit.scores[areaId]} pts). New Total: ${activeAudit.compositeScore}</span>`);
        } else {
          write(`<span class="text-red">[ERR] Invalid Area ID '${areaId}'. (Examples: 1.1, 2.7, 3.1, 4.5, 6.2).</span>`);
        }
        break;

      case "score":
        if (!activeAudit) activeAudit = await db.ulbRecords.get("njmc");
        syncActiveCalculations();
        const scoreColor = activeAudit.riskCategory === "GREEN" ? "text-green" : activeAudit.riskCategory === "ORANGE" ? "text-amber" : "text-red";
        write(`----------------------------------------------------------------------
COMPOSITE CAG ASSESSMENT SCORE:
  Entity         : ${activeAudit.ulbName}
  Score Obtained : <span class="${scoreColor}">${activeAudit.compositeScore} / 100.0</span>
  Risk Matrix    : <span class="${scoreColor}">${activeAudit.riskCategory} GROUP</span>
  Regulatory Note: ${
    activeAudit.riskCategory === "GREEN"
      ? "Compliant. Low risk; routine monitoring required."
      : activeAudit.riskCategory === "ORANGE"
      ? "Moderate Risk. Capacity-building & DLFA oversight required."
      : "Significant Risk. Urgent administrative intervention warranted."
  }
----------------------------------------------------------------------`);
        break;

      case "report":
        if (!activeAudit) activeAudit = await db.ulbRecords.get("njmc");
        syncActiveCalculations();
        renderPrintReport();
        write(`<span class="text-green">[SUCCESS] Formal CAG Audit Assessment Report compiled and rendered to print buffer.</span>`);
        write(`<span class="text-dim">Click 'PRINT REPORT' in toolbar above or print this webpage.</span>`);
        break;

      case "export-md":
        exportMarkdown();
        break;

      default:
        write(`bash: command not found: ${cmd}. Type <span class="text-amber">help</span> to view commands.`);
    }
  };

  const renderPrintReport = () => {
    if (!activeAudit) return;
    const { compositeScore, riskCategory } = activeAudit;
    const printArea = document.getElementById("print-sheet");

    printArea.innerHTML = `
      <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:12px; margin-bottom:18px;">
        <h2 style="margin:0; font-size:15pt; text-transform:uppercase;">Office of the Accountant General (Audit), Sikkim</h2>
        <h3 style="margin:4px 0; font-size:13pt; text-transform:uppercase;">Report on the Assessment of Audited Financial Statements</h3>
        <p style="margin:0; font-size:10pt; font-style:italic;">${activeAudit.ulbName} (FY ${activeAudit.fy}) & Quality of Certification of Accounts</p>
        <p style="margin:0; font-size:9pt;">Technical Guidance and Supervision (TGS) of the Comptroller and Auditor General of India</p>
      </div>

      <h4 style="margin:12px 0 6px 0; text-transform:uppercase; font-size:11pt;">Part I: Organizational Overview & Timelines</h4>
      <p style="text-align:justify; margin:0 0 10px 0;">
        The review of the Annual Financial Statements of <strong>${activeAudit.ulbName}</strong> (${activeAudit.ulbType}) was executed for <strong>FY ${activeAudit.fy}</strong>.
        Annual accounts were submitted on <strong>${activeAudit.actualAfs}</strong> against the statutory due date <strong>${activeAudit.dueAfs}</strong>.
        Audit certification was concluded by the Primary Auditor (<strong>${activeAudit.auditor}</strong>) on <strong>${activeAudit.actualAudit}</strong> against statutory target <strong>${activeAudit.dueAudit}</strong>.
      </p>

      <h4 style="margin:12px 0 6px 0; text-transform:uppercase; font-size:11pt;">Part II: Substantive Audit Observations</h4>
      <ul style="margin:0 0 12px 20px;">
        <li><strong>Accrual Breaches:</strong> Major revenues including Property Taxes and Trade License fees continue to be recognized purely on receipt basis rather than demand accrual.</li>
        <li><strong>Capitalization Omissions:</strong> Completed works valuing <strong>${activeAudit.cwipUncapitalized}</strong> were retained under Capital Work-in-Progress (CWIP) without operational transfer to Fixed Assets.</li>
        <li><strong>Statutory Liabilities:</strong> Unremitted statutory deductions under GST-TDS, Cess, and Royalty amounting to <strong>${activeAudit.unremittedDues}</strong> remained overdue.</li>
        <li><strong>Bank Reconciliation:</strong> Periodic monthly BRS was conducted for only <strong>${activeAudit.brsRatio}</strong> without independent bank balance confirmation.</li>
        <li><strong>IT Software:</strong> Accounts are compiled in <strong>${activeAudit.software}</strong> with Audit Trail / Edit Log Active = <strong>${activeAudit.auditTrail}</strong>.</li>
      </ul>

      <h4 style="margin:12px 0 6px 0; text-transform:uppercase; font-size:11pt;">Part III: Assessment Outcome & Risk Assignment</h4>
      <p style="margin:0 0 10px 0;">
        Under the 7-parameter / 42-area CAG evaluation framework, the entity scored <strong>${compositeScore} / 100.0</strong> and is assigned to the <strong>${riskCategory} RISK GROUP</strong>.
      </p>

      <table style="width:100%; border-collapse:collapse; margin:14px 0; font-size:9.5pt;" border="1">
        <tr style="background:#f2f2f2;">
          <th style="padding:6px;">Risk Category</th>
          <th style="padding:6px;">Score Range</th>
          <th style="padding:6px;">Assigned Entity Status</th>
          <th style="padding:6px;">Oversight Requirement</th>
        </tr>
        <tr ${riskCategory === 'GREEN' ? 'style="font-weight:bold;"' : ''}>
          <td style="padding:6px;">Green</td><td style="padding:6px;">≥ 60%</td>
          <td style="padding:6px;">${riskCategory === 'GREEN' ? compositeScore + ' (Assigned)' : '---'}</td>
          <td style="padding:6px;">Routine annual monitoring</td>
        </tr>
        <tr ${riskCategory === 'ORANGE' ? 'style="font-weight:bold; background:#fff8e1;"' : ''}>
          <td style="padding:6px;">Orange</td><td style="padding:6px;">35% - 59.9%</td>
          <td style="padding:6px;">${riskCategory === 'ORANGE' ? compositeScore + ' (Assigned)' : '---'}</td>
          <td style="padding:6px;">Targeted capacity building & supervision</td>
        </tr>
        <tr ${riskCategory === 'RED' ? 'style="font-weight:bold;"' : ''}>
          <td style="padding:6px;">Red</td><td style="padding:6px;">&lt; 35%</td>
          <td style="padding:6px;">${riskCategory === 'RED' ? compositeScore + ' (Assigned)' : '---'}</td>
          <td style="padding:6px;">Urgent administrative intervention</td>
        </tr>
      </table>

      <div style="margin-top:60px; display:flex; justify-content:space-between; font-size:10pt;">
        <div style="text-align:center;">
          ________________________________________<br>
          <strong>Municipal Executive Officer</strong><br>
          ${activeAudit.ulbName}
        </div>
        <div style="text-align:center;">
          ________________________________________<br>
          <strong>Inspecting Officer / Sr. Audit Officer</strong><br>
          Directorate of Local Fund Audit (DLFA)
        </div>
      </div>
    `;
  };

  const exportMarkdown = () => {
    if (!activeAudit) return;
    const md = `# REPORT ON THE ASSESSMENT OF AUDITED FINANCIAL STATEMENTS
**Target Auditee**: ${activeAudit.ulbName} (${activeAudit.ulbType})  
**Financial Year**: ${activeAudit.fy}  
**Primary Auditor**: ${activeAudit.auditor}  
**Assessment Date**: ${new Date().toISOString().slice(0, 10)}  

## Assessment Summary
- **Composite CAG Score**: ${activeAudit.compositeScore} / 100.0
- **Risk Category Assigned**: ${activeAudit.riskCategory} GROUP
- **Accounting Software**: ${activeAudit.software} (Audit Trail Enabled: ${activeAudit.auditTrail})
- **Completed CWIP Pending Capitalization**: ${activeAudit.cwipUncapitalized}
- **Unremitted Statutory Liabilities**: ${activeAudit.unremittedDues}
- **BRS Reconciled Accounts**: ${activeAudit.brsRatio}

## Specific Compliance Scores
${Object.keys(activeAudit.scores).map(k => `- Item ${k}: ${activeAudit.scores[k]} pts`).join("\n")}

---
*Generated via Directorate of Local Fund Audit (DLFA) Terminal Engine.*`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeAudit.ulbName.replace(/\s+/g, "_")}_CAG_Report.md`;
    a.click();
    write(`<span class="text-green">[OK] Exported ${a.download} successfully.</span>`);
  };

  const exportDB = async () => {
    const all = await db.ulbRecords.toArray();
    const jsonStr = JSON.stringify(all, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sikkim_ULB_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    write(`<span class="text-green">[OK] Full IndexedDB backup saved.</span>`);
  };

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = inputEl.value;
      inputEl.value = "";
      execute(val);
    }
  });

  return {
    triggerPrint: () => {
      renderPrintReport();
      window.print();
    },
    exportMarkdown,
    exportDB
  };
})();
