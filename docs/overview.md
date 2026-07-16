# Process Visibility and SLA-Based Workflow Control System for Supply Chain Management

This repository contains the design, framework, and implementation details for the **Process Visibility and SLA-Based Workflow Control System for Supply Chain Management**, a targeted digital transformation solution developed for the Supply Chain Management (SCM) department.

---

## 📌 Project Overview

Modern supply chains are highly complex and interconnected, exposing organizations to inefficiencies, delays, and operational risks when visibility is limited. For many organizations in emerging markets, fully integrated Enterprise Resource Planning (ERP) installations are too costly or complex, while manual tracking is too slow and error-prone. 

This project addresses the **"Missing Middle" of digital transformation**—the gap where environments have outgrown manual processes but are not yet positioned for full-scale ERP integration. By introducing a lightweight, rule-based **Decision Support System (DSS)**, this system automates the tracking, aging analysis, and escalation of key SCM transactions, shifting the department from a *reactive* posture to *proactive* workflow management.



---

## ⚙️ Monitored SCM Transactions

The platform is built to track and classify five high-volume transactional workflows critical to production and operational continuity:

| Transaction Type | Description | Operational Risk of Delay |
| :--- | :--- | :--- |
| **Purchase Requisitions (PR)** | Requests for purchasing components/materials. | Procurement pauses, leading to material shortages. |
| **Request Check Preparation (RCP)** | Payment processing forms for vendors. | Stalled supplier relationships and shipping holds. |
| **Movement Approval Sheets (MAS)** | Stockroom-to-stockroom material transfers. | Delays halt production lines (SLA limit: 5 days). |
| **PO Amendment/Cancellation** | Modifications to active Purchase Orders. | Excess inventory, financial liabilities, or inaccurate billing. |
| **Work Order Amendment** | Changes to active floor manufacturing orders. | Incorrect assembly lines or wasted manufacturing runs. |

---

## 🛠️ System Architecture & Core Modules

The application is structured into modular layers designed to capture, process, and display transactional health:

*   **Workflow Tracking Module:** Monitors transaction lifecycles and maps approval stages.
*   **Aging & Risk Classification Module:** Categorizes transactions dynamically based on predefined Service Level Agreements (SLAs):
    *   🟢 **Normal:** Well within standard processing time.
    *   🟡 **Warning:** Nearing threshold; requires attention.
    *   🔴 **Critical:** Overdue; requires immediate intervention.
*   **Automated Notification Module:** Dispatches automated email alerts to transaction requestors and assigned Persons-in-Charge (PICs) upon reaching Warning or Critical levels.
*   **Escalation Monitoring Module:** A flagged view dedicated to tracking high-priority, critical transactions that violate defined SLA timelines.
*   **Transaction Dashboard:** A centralized visual hub displaying total pending transactions, SLA status distributions, and aging summaries.
*   **Reporting Module:** Generates compliance and bottleneck historical summaries for process reviews.

---

## ⚠️ Scope & Technical Boundaries

To keep the development timeline feasible and respect enterprise security protocols, the following constraints apply:

*   **Human-in-the-Loop Philosophy:** The system serves strictly as a monitoring, classification, and alert engine. It **does not** automate final approval decisions.
*   **Data Environment:** Runs in a local development environment for demonstration and validation. It utilizes a highly realistic simulated dataset modeled on actual transaction patterns with sensitive data masked to maintain confidentiality.
*   **Standalone Operation:** Does not directly write to or sync live with the core enterprise ERP without a secure, established API gateway. It monitors digital SCM workflows internally.
*   **Static Configurable SLAs:** Thresholds are based on existing department policies and are manually configurable; the system does not use machine learning or predictive analytics to adjust metrics.

---

## 🎯 Objectives of the Study

1. **Design & Develop:** Build a centralized workflow tracker within the project timeline achieving at least a **90% classification accuracy** (at least 90 out of 100 transactions correctly categorized as Normal, Warning, or Critical based on rules).
2. **Ensure Alert Delivery:** Build a visual dashboard and guarantee **100% email alert delivery** for items reaching Warning and Critical states.
3. **Evaluate Software Quality:** Conduct a comprehensive evaluation of the platform using **ISO/IEC 25010 standards** (covering Functional Suitability, Performance Efficiency, Usability, Reliability, Security, Compatibility, Maintainability, and Portability) by triangulating quantitative system logs with qualitative user surveys.
4. **Measure Usability:** Target high user acceptance and ease of navigation among SCM personnel using the standardized **System Usability Scale (SUS)**.

---

## 🎓 Academic & Research Significance

This study contributes to the literature on affordable, targeted Decision Support Systems (DSS) in manufacturing environments transitioning away from manual tracking. While most research focuses on high-cost, enterprise-wide software, this project serves as a documented framework for how **small-to-medium digital interventions** can successfully mitigate operational risks and support Digital Transformation in labor-intensive supply chain workflows.