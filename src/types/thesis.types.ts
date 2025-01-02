export interface Thesis {
  id: string;
  title: string;
  abstract: string;
  submissionDate: string;
  year: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  fileUrl: string;
  studentId: string;
  supervisorId?: string;
  feedback?: ThesisFeedback[];
}

export interface ThesisFeedback {
  id: string;
  thesisId: string;
  supervisorId: string;
  comment: string;
  createdAt: string;
}

export interface ThesisSubmissionRequest {
  title: string;
  year: string;
  abstract: string;
  file: File;
}

export interface ThesisSubmissionResponse {
  thesis: Thesis;
  uploadUrl: string;
}

export interface ThesisError {
  message: string;
  field?: string;
  code?: string;
}
