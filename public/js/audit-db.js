const db = new Dexie("AuditSikkimDB");
db.version(1).stores({
  ulbRecords: "id, ulbName, ulbType, fy, riskCategory, compositeScore, lastUpdated"
});

const INITIAL_SEEDS = [
  {
    id: "njmc",
    ulbName: "Nayabazar-Jorethang Municipal Council",
    ulbType: "Municipal Council",
    fy: "2024-25",
    dueAfs: "2025-06-30",
    actualAfs: "2025-12-18",
    dueAudit: "2025-09-30",
    actualAudit: "2026-02-28",
    auditor: "Chartered Accountant Firm (State Empanelled)",
    staffVacancy: "2 of 4 (50%)",
    software: "Tally ERP 9",
    auditTrail: "No",
    cwipUncapitalized: "Rs. 18,50,000",
    unremittedDues: "Rs. 2,40,000",
    doubtfulReceivables: "Rs. 6,50,000",
    brsRatio: "2 of 5 Bank Accounts",
    compositeScore: 45.5,
    riskCategory: "ORANGE",
    lastUpdated: new Date().toISOString(),
    scores: {
      "1.1": 1.0, "1.2": 1.0, "1.3": 1.0,
      "2.1": 1.5, "2.2": 1.5, "2.3": 0.5, "2.4": 1.0, "2.5": 1.5, "2.6": 0.5,
      "2.7": 0.0, "2.8": 0.5, "2.9": 0.5, "2.10": 0.5, "2.11": 0.5, "2.12": 0.0,
      "2.13": 0.0, "2.14": 0.0, "2.15": 0.5, "2.16": 0.0, "2.17": 0.0, "2.18": 0.0,
      "3.1": 2.0, "3.2": 1.5, "3.3": 2.0, "3.4": 2.0,
      "4.1": 2.0, "4.2": 1.5, "4.3": 1.0, "4.4": 0.0, "4.5": 1.0,
      "5.1": 1.5, "5.2": 1.5, "5.3": 1.5, "5.4": 1.5, "5.5": 1.5,
      "6.1": 2.0, "6.2": 2.0, "6.3": 1.0,
      "7.1": 2.5, "7.2": 2.0, "7.3": 1.0, "7.4": 1.5
    }
  },
  {
    id: "gnp",
    ulbName: "Gyalshing Nagar Panchayat",
    ulbType: "Nagar Panchayat",
    fy: "2023-24",
    dueAfs: "2024-06-30",
    actualAfs: "2024-11-15",
    dueAudit: "2024-09-30",
    actualAudit: "2025-03-10",
    auditor: "M/s P. Sharma & Associates, Gangtok",
    staffVacancy: "2 of 3 (66%)",
    software: "Tally ERP 9",
    auditTrail: "No",
    cwipUncapitalized: "Rs. 18,50,000",
    unremittedDues: "Rs. 1,65,000",
    doubtfulReceivables: "Rs. 7,40,000",
    brsRatio: "2 of 4 Bank Accounts",
    compositeScore: 41.0,
    riskCategory: "ORANGE",
    lastUpdated: new Date().toISOString(),
    scores: {
      "1.1": 1.0, "1.2": 1.0, "1.3": 1.0,
      "2.1": 1.5, "2.2": 1.5, "2.3": 0.5, "2.4": 1.0, "2.5": 1.5, "2.6": 0.5,
      "2.7": 0.0, "2.8": 0.5, "2.9": 0.5, "2.10": 0.5, "2.11": 0.5, "2.12": 0.0,
      "2.13": 0.0, "2.14": 0.0, "2.15": 0.5, "2.16": 0.0, "2.17": 0.0, "2.18": 0.0,
      "3.1": 2.0, "3.2": 1.5, "3.3": 1.5, "3.4": 2.0,
      "4.1": 2.0, "4.2": 1.0, "4.3": 1.0, "4.4": 0.0, "4.5": 1.0,
      "5.1": 1.0, "5.2": 1.5, "5.3": 1.5, "5.4": 1.0, "5.5": 1.5,
      "6.1": 1.5, "6.2": 1.5, "6.3": 1.0,
      "7.1": 2.5, "7.2": 2.0, "7.3": 1.0, "7.4": 1.0
    }
  },
  {
    id: "mnp",
    ulbName: "Mangan Nagar Panchayat",
    ulbType: "Nagar Panchayat",
    fy: "2023-24",
    dueAfs: "2024-06-30",
    actualAfs: "2024-12-28",
    dueAudit: "2024-09-30",
    actualAudit: "2025-03-25",
    auditor: "M/s Agarwal & Co., Chartered Accountants",
    staffVacancy: "2 of 3 (66%)",
    software: "MS Excel / Manual Registers",
    auditTrail: "No",
    cwipUncapitalized: "Rs. 14,20,000",
    unremittedDues: "Rs. 2,10,000",
    doubtfulReceivables: "Rs. 5,10,000",
    brsRatio: "1 of 3 Bank Accounts",
    compositeScore: 36.0,
    riskCategory: "ORANGE",
    lastUpdated: new Date().toISOString(),
    scores: {
      "1.1": 1.0, "1.2": 0.5, "1.3": 1.0,
      "2.1": 1.0, "2.2": 1.0, "2.3": 0.5, "2.4": 1.0, "2.5": 1.0, "2.6": 0.5,
      "2.7": 0.0, "2.8": 0.5, "2.9": 0.5, "2.10": 0.5, "2.11": 0.5, "2.12": 0.0,
      "2.13": 0.0, "2.14": 0.0, "2.15": 0.5, "2.16": 0.0, "2.17": 0.0, "2.18": 0.0,
      "3.1": 1.5, "3.2": 1.5, "3.3": 1.5, "3.4": 1.5,
      "4.1": 2.0, "4.2": 1.0, "4.3": 0.5, "4.4": 0.0, "4.5": 1.0,
      "5.1": 1.0, "5.2": 1.0, "5.3": 1.0, "5.4": 1.0, "5.5": 1.5,
      "6.1": 1.0, "6.2": 1.5, "6.3": 1.0,
      "7.1": 2.5, "7.2": 2.0, "7.3": 1.0, "7.4": 1.0
    }
  }
];

async function initializeDatabase() {
  const count = await db.ulbRecords.count();
  if (count === 0) {
    await db.ulbRecords.bulkAdd(INITIAL_SEEDS);
  }
}
initializeDatabase();
