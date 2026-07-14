export interface Expert {
  id: number;
  _id?: string;
  name: string;
  avatar: string;
  specialty: string;
  experience: string;
  rating: string;
  reviews: number;
  languages: string[];
  cost: number;
  costDisplay: string;
  price?: number | null;
  status: "available" | "limited" | "unavailable";
  statusLabel: string;
  desc: string;
  approvalStatus: "pending" | "approved" | "suspended";
  createdAt: string;
}

export interface ExpertSlot {
  _id: string;
  startAt: string;
  endAt: string;
  price: number;
  status: "available" | "booked" | "unavailable";
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
