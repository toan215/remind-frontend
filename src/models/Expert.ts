export interface Expert {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  experience: string;
  rating: string;
  reviews: number;
  languages: string[];
  cost: number;
  costDisplay: string;
  status: "available" | "limited" | "unavailable";
  statusLabel: string;
  desc: string;
  approvalStatus: "pending" | "approved" | "suspended";
  createdAt: string;
}

export interface ExpertFormData {
  name: string;
  avatar: string;
  specialty: string;
  experience: string;
  languages: string[];
  cost: number;
  status: "available" | "limited" | "unavailable";
  desc: string;
}
