export type ShiftType = 'Pagi' | 'Petang' | 'Malam';

export type DormBlockName = 
  | 'Blok A - Mat Salleh (Lelaki)'
  | 'Blok B - Rentap (Lelaki)'
  | 'Blok C - Mahsuri (Perempuan)'
  | 'Blok D - Tun Teja (Perempuan)';

export type ReportCategory = 
  | 'Dewan Makan & Sajian Makanan'
  | 'Kebersihan Dorm & Persekitaran'
  | 'Fasiliti & Kerosakan Bangunan'
  | 'Roll Call & Kehadiran Murid'
  | 'Disiplin, Solat & Aktiviti'
  | 'Sickbay & Kesihatan Murid';

export type ReportStatus = 'Dalam Semakan' | 'Disahkan PK HEM' | 'Perlu Tindakan Immediate';

export interface PpaProfile {
  id: string;
  name: string;
  myKad: string;
  phone: string;
  role: 'Pembantu Penyelia Asrama' | 'Ketua Penyelia Asrama';
  assignedBlocks: DormBlockName[];
  status: 'Bertugas' | 'Tidak Bertugas' | 'Cuti';
  avatar: string;
}

export interface AttendanceRecord {
  id: string;
  ppaId: string;
  ppaName: string;
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  checkInTime: string; // HH:mm:ss
  checkOutTime?: string;
  photoUrl: string; // selfie/duty location photo
  locationName: string;
  gpsCoords: { lat: number; lng: number };
  notes: string;
  verifiedByPkHem: boolean;
  verificationTimestamp?: string;
}

export interface PhotoReport {
  id: string;
  ppaId: string;
  ppaName: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // HH:mm
  category: ReportCategory;
  title: string;
  description: string;
  photoUrl: string;
  dormBlock?: DormBlockName;
  ratingScore?: number; // 1-5 scale for cleanliness/food quality
  priority: 'Biasa' | 'Penting' | 'Segera';
  status: ReportStatus;
  pkHemComments?: string;
  pkHemApprovedDate?: string;
  locationDetails?: string;
}

export interface StudentRollCall {
  id: string;
  date: string;
  shift: ShiftType;
  block: DormBlockName;
  totalEnrolled: number;
  presentCount: number;
  sickbayCount: number;
  outingCount: number;
  absentUnexplained: number;
  reportedByPpa: string;
  timestamp: string;
  notes: string;
}

export interface ExecutiveSummaryAI {
  date: string;
  summaryText: string;
  highlights: string[];
  actionItems: string[];
  generatedAt: string;
}

export type AssetCategory = 
  | 'Perabot & Katil'
  | 'Elektrik & Kipas'
  | 'Sanitari & Paip'
  | 'Dapur & Dewan Makan'
  | 'Keselamatan & Bomba'
  | 'Sukan & Riadah';

export type AssetCondition = 'Baik' | 'Perlu Penyelenggaraan' | 'Rosak' | 'Dilupuskan';

export interface AsramaAsset {
  id: string;
  assetCode: string; // e.g. SMKB-ASR-A001
  name: string;
  category: AssetCategory;
  dormBlock?: DormBlockName;
  locationDetails: string;
  condition: AssetCondition;
  quantity: number;
  purchaseDate?: string;
  lastInspectedDate: string;
  notes?: string;
}

export interface AssetDamageReport {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  category: AssetCategory;
  dormBlock?: DormBlockName;
  reportedByPpa: string;
  reportDate: string; // YYYY-MM-DD
  reportTime: string; // HH:mm
  description: string;
  priority: 'Biasa' | 'Penting' | 'Segera';
  status: 'Baru Diterima' | 'Dalam Penyelenggaraan' | 'Selesai Dibaikpulih' | 'Cadangan Pelupusan';
  linkedPhotoReportId?: string; // Link to PPA photo report if available
  photoUrl?: string;
  estimatedCost?: number;
  pkHemNote?: string;
}

