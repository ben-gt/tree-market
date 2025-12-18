export type PricingType = "fixed" | "auction";

export type ListingStatus = "active" | "sold" | "expired" | "removed";

export type HealthStatus = "excellent" | "good" | "fair" | "poor";

export type BusinessType =
  | "landscape_architect"
  | "developer"
  | "demolition"
  | "enthusiast"
  | "other";

export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface PickupWindowInput {
  type: "specific" | "range" | "flexible";
  date?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: DayOfWeek[];
  notes?: string;
}

export interface ListingFormData {
  title: string;
  description?: string;
  species: string;
  height?: number;
  trunkDiameter?: number;
  canopyWidth?: number;
  healthStatus?: HealthStatus;
  age?: number;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  pricingType: PricingType;
  price?: number;
  pickupWindows: PickupWindowInput[];
  images: string[];
}
