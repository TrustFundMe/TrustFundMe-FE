export type KYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type SubmitKycRequest = {
  idType: string;
  idNumber: string;
  issueDate: string; // yyyy-MM-dd
  expiryDate: string; // yyyy-MM-dd
  issuePlace: string;
  idImageFront: string;
  idImageBack: string;
  selfieImage: string;
  status?: KYCStatus;
};

export interface KycResponse extends SubmitKycRequest {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: KYCStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
