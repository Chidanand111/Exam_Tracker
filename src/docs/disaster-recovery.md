# BharatExam Tracker — Disaster Recovery & Business Continuity Architecture (Requirement 75)

## 1. Executive Summary & Objectives
This document establishes the official Disaster Recovery (DR) and Data Resilience Architecture for the **BharatExam Tracker** platform. The architecture is engineered to guarantee zero data loss of user application trackers, uninterrupted access to verified official recruitment information, and automated failover capabilities independent of developer machines.

### Key Targets:
- **Recovery Point Objective (RPO)**: < 15 minutes (Maximum acceptable data loss interval).
- **Recovery Time Objective (RTO)**: < 60 minutes (Time to restore production services after catastrophic incident).

---

## 2. Infrastructure Resilience Model
BharatExam Tracker leverages an automated, multi-region cloud topology:
1. **Application Layer**: Hosted on **Vercel Edge Network** with automated multi-zone DNS failover and continuous deployment triggered by Git branch pushes.
2. **Relational Database**: Hosted on **Neon Serverless PostgreSQL** with automated write-ahead log (WAL) archiving and Point-in-Time Recovery (PITR).
3. **Document Vault**: Encrypted object storage with redundant geo-distributed replication and signed token access controls.

---

## 3. Database Backup & Retention Policy

| Backup Tier | Frequency | Retention Window | Storage Target | Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **Continuous WAL Archiving** | Real-time | 30 Days | AWS S3 Multi-Region | Neon Native WAL Streaming |
| **Point-in-Time Snapshots** | Hourly | 14 Days | Geo-Redundant S3 | Automated Neon Branching |
| **Encrypted Logical Dumps** | Daily at 02:00 IST | 90 Days | Offsite Cold Storage | `pg_dump` with AES-256 GCM |
| **Schema & Migration Backups**| Per Git Commit | Permanent | GitHub Repository | Prisma Schema History |

---

## 4. Disaster Scenarios & Recovery Procedures

### Scenario A: Accidental Data Corruption or Malicious Deletion
* **Symptoms**: Erroneous database update, corrupted stage outcomes, or unintentional batch deletion.
* **Procedure**:
  1. Determine the exact timestamp ($T_{error}$) of the incident using `AdminAuditLog` (`/api/admin/audit-logs`).
  2. Initiate Neon Point-in-Time Recovery (PITR) to timestamp $T_{error} - 1\text{ minute}$.
  3. Create an instantaneous restoration branch:
     ```bash
     neon branches create --from-timestamp "2026-10-05T14:30:00Z" --name recovery-branch
     ```
  4. Validate data consistency on the recovery branch.
  5. Promote the recovery branch to primary production database endpoint.

### Scenario B: Cloud Provider Region Outage
* **Symptoms**: Primary AWS us-east-2 availability zone becomes unreachable.
* **Procedure**:
  1. Neon initiates automated read-replica failover to secondary AWS/GCP region.
  2. Update `DATABASE_URL` in Vercel Environment Variables to point to standby endpoint.
  3. Trigger automated zero-downtime redeployment on Vercel.

### Scenario C: Corrupted User Document Vault
* **Symptoms**: Vault files corrupted or accidentally overwritten.
* **Procedure**:
  1. Access Object Storage Versioning log.
  2. Revert storage keys matching `vault/{userId}/*` to previous uncorrupted version IDs.
  3. Run file integrity validation script (`validateUploadedFile` checksum verification).

---

## 5. Recovery Testing & Simulation Cadence
- **Quarterly Restoration Drills**: Every 90 days, the operations team executes a restoration drill on a staging environment using a production logical dump.
- **Failover Verification**: Monthly health probe verification via `/api/health/observability`.
- **Integrity Auditing**: Automated SHA-256 checksum comparisons between `DataCitation` records and original government PDF gazettes.
