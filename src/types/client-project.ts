/** Demo client project shown in the dashboard (SRS §11.4, FR-I-02/03/04). */
import type { ImageRef, Tier } from './content';

export type StageStatus = 'COMPLETE' | 'IN_PROGRESS' | 'BLOCKED' | 'PENDING' | 'OVERDUE';

export interface ProjectStage {
  id: string;
  name: string;
  status: StageStatus;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  owner: string;
  notes?: string;
  delayReason?: string;
  photos: ImageRef[];
  pendingClientAction?: string;
}

export interface QuotationVersion {
  id: string;
  version: number;
  date: string;
  tier: Tier;
  total: number;
  gst: number;
  lines: { label: string; category: string; amount: number; changed?: 'ADDED' | 'REMOVED' | 'CHANGED' }[];
  note: string;
  status: 'SUPERSEDED' | 'CURRENT' | 'DRAFT';
}

export interface ApprovalItem {
  id: string;
  title: string;
  kind: 'DESIGN' | 'MATERIAL' | 'QUOTATION' | 'LAYOUT';
  description: string;
  versions: { id: string; label: string; image: ImageRef; date: string; changes: string[] }[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  requestedOn: string;
  dueBy: string;
  decidedOn?: string;
  decidedBy?: string;
  history: { at: string; by: string; action: string; detail?: string }[];
}

export interface PaymentMilestone {
  id: string;
  label: string;
  pct: number;
  amount: number;
  dueOn: string;
  paidOn?: string;
  status: 'PAID' | 'DUE' | 'UPCOMING' | 'OVERDUE';
  trigger: string;
}

export interface ProjectMessage {
  id: string;
  from: 'CLIENT' | 'DESIGNER' | 'PM';
  name: string;
  at: string;
  text: string;
  attachment?: ImageRef;
}

export interface ProjectDocument {
  id: string;
  name: string;
  kind: 'AGREEMENT' | 'DRAWING' | 'BOQ' | 'INVOICE' | 'WARRANTY';
  date: string;
  sizeKb: number;
  version: string;
}

export interface ClientProject {
  id: string;
  name: string;
  clientName: string;
  locality: string;
  propertyType: string;
  bhk: string;
  carpetAreaSqft: number;
  tier: Tier;
  designerSlug: string;
  pmName: string;
  startedOn: string;
  projectedHandover: string;
  originalHandover: string;
  heroImage: ImageRef;
  stages: ProjectStage[];
  quotations: QuotationVersion[];
  approvals: ApprovalItem[];
  payments: PaymentMilestone[];
  sitePhotos: ImageRef[];
  messages: ProjectMessage[];
  documents: ProjectDocument[];
}
