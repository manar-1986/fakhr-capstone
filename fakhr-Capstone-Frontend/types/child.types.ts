export interface Child {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis?: string;
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
}

export interface ChildProfile {
  child: Child;
  challenges: string[];
  goals: string[];
}
