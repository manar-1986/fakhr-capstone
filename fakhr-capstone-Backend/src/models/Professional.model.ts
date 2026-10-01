import mongoose, { Document, Schema } from "mongoose";

export interface IProfessional extends Document {
  clinicNameAr?: string;
  clinicNameEn?: string;
  addressAr?: string;
  addressEn?: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  specialty: string; // speech, behavioral, occupational, physical, educational
  specialtyLabel: string; // Display name like "Speech Therapist"
  specialtyLabelAr?: string;
  specialtyLabelEn?: string;
  experience: string; // e.g., "10 years"
  experienceAr?: string;
  experienceEn?: string;
  rating: number;
  reviews: number;
  availability: string; // e.g., "Available today", "Next available: Tomorrow"
  verified: boolean;
  color: string; // Hex color code
  bio: string;
  bioAr?: string;
  bioEn?: string;
  education: string[]; // Array of education degrees
  certifications: string[]; // Array of certifications
  languages: string[]; // Array of languages spoken
  services: string[]; // Array of services offered
  location: string; // e.g., "Riyadh, Saudi Arabia"
  locationAr?: string;
  locationEn?: string;
  consultationFee: string; // e.g., "250 SAR"
  nextAvailable: string; // e.g., "Today, 3:00 PM"
  centerId?: mongoose.Types.ObjectId; // Optional reference to Center
  email?: string;
  phone?: string;
  image?: string; // URL to profile image
  createdAt: Date;
  updatedAt: Date;
}

const professionalSchema = new Schema<IProfessional>(
  {
    clinicNameAr: { type: String, trim: true },
    clinicNameEn: { type: String, trim: true },
    addressAr: { type: String, trim: true },
    addressEn: { type: String, trim: true },
    mapUrl: { type: String, trim: true },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    name: { type: String, required: true },
    nameAr: { type: String },
    nameEn: { type: String },
    specialty: {
      type: String,
      required: true,
      enum: ["speech", "behavioral", "occupational", "physical", "educational"],
    },
    specialtyLabel: { type: String, required: true },
    specialtyLabelAr: { type: String },
    specialtyLabelEn: { type: String },
    experience: { type: String, required: true },
    experienceAr: { type: String },
    experienceEn: { type: String },
    rating: { type: Number, required: true, min: 0, max: 5, default: 0 },
    reviews: { type: Number, default: 0 },
    availability: { type: String, required: true },
    availabilityAr: { type: String },
    availabilityEn: { type: String },
    verified: { type: Boolean, default: false },
    color: { type: String, required: true },
    bio: { type: String, required: true },
    bioAr: { type: String },
    bioEn: { type: String },
    education: [{ type: String }],
    educationAr: [{ type: String }],
    educationEn: [{ type: String }],
    certifications: [{ type: String }],
    certificationsAr: [{ type: String }],
    certificationsEn: [{ type: String }],
    languages: [{ type: String }],
    languagesAr: [{ type: String }],
    languagesEn: [{ type: String }],
    services: [{ type: String }],
    servicesAr: [{ type: String }],
    servicesEn: [{ type: String }],
    location: { type: String, required: true },
    locationAr: { type: String },
    locationEn: { type: String },
    consultationFee: { type: String, required: true },
    nextAvailable: { type: String, required: true },
    nextAvailableAr: { type: String },
    nextAvailableEn: { type: String },
    centerId: { type: Schema.Types.ObjectId, ref: "Center" },
    email: { type: String },
    phone: { type: String },
    image: { type: String },
    centerNameAr: { type: String },
    centerNameEn: { type: String },
  },
  { timestamps: true }
);

professionalSchema.pre("save", function (next) {
  const arabic = /[\u0600-\u06FF]/;
  if (!this.nameAr && this.name && arabic.test(this.name)) this.nameAr = this.name;
  if (!this.nameEn && this.name && !arabic.test(this.name)) this.nameEn = this.name;
  if (!this.specialtyLabelEn && this.specialtyLabel && !arabic.test(this.specialtyLabel)) {
    this.specialtyLabelEn = this.specialtyLabel;
  }
  if (!this.specialtyLabelAr && this.specialtyLabel && arabic.test(this.specialtyLabel)) {
    this.specialtyLabelAr = this.specialtyLabel;
  }
  if (!this.bioEn && this.bio && !arabic.test(this.bio)) this.bioEn = this.bio;
  if (!this.bioAr && this.bio && arabic.test(this.bio)) this.bioAr = this.bio;
  if (!this.locationEn && this.location && !arabic.test(this.location)) this.locationEn = this.location;
  if (!this.locationAr && this.location && arabic.test(this.location)) this.locationAr = this.location;
  next();
});

// Index for faster queries
professionalSchema.index({ specialty: 1 });
professionalSchema.index({ centerId: 1 });
professionalSchema.index({ verified: 1 });
professionalSchema.index({ name: 1, specialty: 1 }, { unique: true });

const Professional = mongoose.model<IProfessional>("Professional", professionalSchema);

export default Professional;
