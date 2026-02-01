export type SubmitKycRequest = {
  idType: string;
  idNumber: string;
  issueDate: string; // yyyy-MM-dd
  expiryDate: string; // yyyy-MM-dd
  issuePlace: string;
  idImageFront: string;
  idImageBack: string;
  selfieImage: string;
};
