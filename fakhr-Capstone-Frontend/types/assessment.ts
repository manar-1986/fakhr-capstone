export interface AssessmentPresentation {
 version: 1; introduction: string; explanation: string; verificationNotice: string; sources: string[]; medicalDisclaimer: string;
 organizations: {id:string;name:{ar:string;en:string};candidatePhone:string|null;departmentStatus:string;serviceStatus:string;referralStatus:string;acceptanceStatus:string;contactEvidence:{status:string;source:string|null;scope:string}}[];
}
