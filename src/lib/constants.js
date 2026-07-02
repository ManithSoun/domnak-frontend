export const UNITS = [
  "bag", "m²", "m³", "ton", "meter", 
  "liter", "set", "roll", "kg", "pcs", "bf"
]

export const ROLES = {
  HOMEOWNER: "homeowner",
  CONTRACTOR: "contractor",
  ADMIN: "admin"
}

export const QUOTE_STATUS = {
  PENDING: "pending",
  ANALYZED: "analyzed",
  APPROVED: "approved"
}

export const VERDICT = {
  FAIR: "fair",
  SLIGHTLY_HIGH: "slightly_high",
  OVERPRICED: "overpriced"
}

export const FINISHING_LEVELS = [
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" }
]

export const ROOF_TYPES = [
  { value: "flat", label: "Flat concrete" },
  { value: "pitched", label: "Pitched tile" },
  { value: "metal", label: "Metal sheet" }
]

export const LOCATIONS = [
  { value: "phnom_penh", label: "Phnom Penh" },
  { value: "province", label: "Province (-10%)" }
]