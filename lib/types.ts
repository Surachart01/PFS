import type { ObjectId } from "mongodb";

export type UserRole = "student" | "admin";
export type UserStatus = "active" | "inactive";
export type PortfolioStatus = "draft" | "published" | "unpublished";
export type SectionAlignment = "left" | "center" | "right";
export type SectionPadding = "compact" | "comfortable" | "spacious";
export type SectionRadius = "none" | "soft" | "rounded";
export type SectionShadow = "none" | "soft" | "elevated";
export type SectionWidth = "full" | "contained";
export type SectionImagePosition = "left" | "top" | "right";
export type SectionItemStyle = "chips" | "list" | "cards" | "bars" | "pills" | "timeline";
export type SectionBorderStyle = "subtle" | "accent-left" | "gradient-top" | "glowing" | "none";
export type SectionCardVariant = "solid" | "glass" | "gradient" | "outline";

export type TemplateId = "professional" | "modern" | "creative" | "minimal" | "academic" | "compact";

export type GridPlacement = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
};

export type PortfolioSectionSettings = {
  showTitle?: boolean;
  alignment?: SectionAlignment;
  padding?: SectionPadding;
  radius?: SectionRadius;
  shadow?: SectionShadow;
  width?: SectionWidth;
  imagePosition?: SectionImagePosition;
  itemStyle?: SectionItemStyle;
  borderStyle?: SectionBorderStyle;
  cardVariant?: SectionCardVariant;
  column?: "left" | "right";
};

export type PortfolioSectionFrame = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  locked?: boolean;
};

export type UserDoc = {
  _id: ObjectId;
  studentId?: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department?: string;
  year?: number;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PortfolioSection = {
  id: string;
  type: "profile" | "about" | "education" | "skills" | "projects" | "experience" | "certificates" | "contact" | "custom";
  title: string;
  visible: boolean;
  order: number;
  columns?: 1 | 2;
  accentColor?: string;
  backgroundColor?: string;
  settings?: PortfolioSectionSettings;
  frame?: PortfolioSectionFrame;
  gridPlacement?: GridPlacement;
  content: {
    body?: string;
    items?: string[];
    imageUrl?: string;
  };
};

export type PortfolioStyleSettings = {
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
  layout: "clean" | "project-first" | "profile-first";
  backgroundTheme?: "default" | "dark-slate" | "glassmorphism" | "mesh-gradient" | "sunset" | "nordic";
  headerStyle?: "clean" | "banner" | "glass-card" | "gradient-hero";
};

export type PortfolioDoc = {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  slug: string;
  status: PortfolioStatus;
  theme: "modern" | "classic" | "minimal";
  templateId?: TemplateId;
  styleSettings: PortfolioStyleSettings;
  sections: PortfolioSection[];
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionPayload = {
  userId: string;
  role: UserRole;
  exp: number;
};

export type SafeUser = {
  id: string;
  studentId?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department?: string;
  year?: number;
  status: UserStatus;
};

export type SerializedPortfolio = Omit<PortfolioDoc, "_id" | "userId" | "createdAt" | "updatedAt" | "publishedAt"> & {
  id: string;
  userId: string;
  templateId?: TemplateId;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
