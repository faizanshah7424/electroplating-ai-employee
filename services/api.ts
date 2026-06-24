const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://127.0.0.1:8000";
};

const BASE_URL = getBaseUrl();

// Existing Calculator Interfaces
export interface ProcessRequest {
  part: string;
  metal: string;
  area: number;
  thickness: number;
  current_density: number;
  problem?: string;
  pH?: number;
  temp?: number;
  efficiency?: number;
}

export interface ProcessResponse {
  success: boolean;
  time_minutes: number;
  total_current_amps: number;
  deposited_mass_grams: number;
  advice: string[];
  inputs: Record<string, any>;
  error?: string;
}

// Existing Vision Interfaces
export interface VisionResponse {
  success: boolean;
  defect: string;
  confidence: number;
  description: string;
  mitigation: string[];
  error?: string;
}

// Existing Chat Interfaces
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  context?: Record<string, any>;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  error?: string;
}

// NEW: Bath and Full Line Analysis Interfaces
export interface BathAnalysisRequest {
  bath_type: string;
  part_type: string;
  parameters: Record<string, number>;
  problem_symptom?: string;
}

export interface BathAnalysisResult {
  bath: string;
  status: "Optimal" | "Warning" | "Critical";
  issues: string[];
  root_causes: string[];
  recommendations: string[];
  confidence: number;
}

export interface LineAnalysisRequest {
  part_type: string;
  caustic_cleaning?: Record<string, number>;
  acid_activation?: Record<string, number>;
  semi_bright_nickel?: Record<string, number>;
  bright_nickel?: Record<string, number>;
  chrome_plating?: Record<string, number>;
  problem_symptom?: string;
}

export interface LineAnalysisResponse {
  success: boolean;
  line_status: "Optimal" | "Warning" | "Critical";
  baths: BathAnalysisResult[];
  overall_predicted_defects: string[];
  overall_recommendations: string[];
  confidence: number;
}

// EXISTING API CALLS
export async function analyzeProcess(data: ProcessRequest): Promise<ProcessResponse> {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`API analysis failed with status: ${res.status}`);
  }
  return res.json();
}

export async function detectDefect(file: File): Promise<VisionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/detect`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`API visual scan failed with status: ${res.status}`);
  }
  return res.json();
}

export async function chatWithAgent(data: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`API chat transaction failed with status: ${res.status}`);
  }
  return res.json();
}

// NEW API CALLS FOR COMPLETE LINE ANALYSIS
export async function analyzeBath(data: BathAnalysisRequest): Promise<BathAnalysisResult> {
  const res = await fetch(`${BASE_URL}/analyze-line/bath`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Bath analysis failed with status: ${res.status}`);
  }
  return res.json();
}

export async function analyzeLine(data: LineAnalysisRequest): Promise<LineAnalysisResponse> {
  const res = await fetch(`${BASE_URL}/analyze-line/line`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Line analysis failed with status: ${res.status}`);
  }
  return res.json();
}
