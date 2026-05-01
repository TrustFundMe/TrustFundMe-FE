export type KYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type SubmitKycRequest = {
  idType: string;
  idNumber: string;
  issueDate: string; // yyyy-MM-dd
  expiryDate: string; // yyyy-MM-dd
  issuePlace: string;
  idImageFront: string;
  idImageBack?: string;
  selfieImage: string;
  // ── OCR-extracted fields (from CCCD/passport scan) ──
  fullName: string;       // họ tên trên CCCD/hộ chiếu
  address: string;        // địa chỉ thường trú
  workplace?: string;     // nơi làm việc
  taxId?: string;          // mã số thuế cá nhân
  status?: KYCStatus;
  // ── Face biometric data (from MediaPipe liveness check) ──
  faceDescriptor?: string | null;    // JSON string of 128-dim vector
  livenessMetadata?: string | null;  // JSON string of liveness proof
  faceMeshSample?: string | null;    // JSON string of sample landmarks
};

export interface KycResponse extends SubmitKycRequest {
  id: number;
  userId: number;
  fullName: string;
  address?: string;
  workplace?: string;
  taxId?: string;
  email: string;
  phoneNumber: string;
  status: KYCStatus;
  rejectionReason?: string;
  // Face biometric
  faceDescriptor?: string;
  livenessMetadata?: string;
  faceMeshSample?: string;
  livenessVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}