export interface Job {
  jobNo: string;
  jobName: string;
  custName: string;
  custNo: string;
  link: {
    job: string;
    cust: string;
    applyAnalyze?: string;
  };
  salaryHigh: number;
  salaryLow: number;
  salaryDesc?: string;
  jobAddrNoDesc: string;
  appearDate: string;
  applyCnt: number;
  remoteWorkType: number;
  tags?: Record<string, unknown>;
}

export interface JobDetail {
  header: {
    jobName: string;
    custName: string;
    custUrl: string;
    appearDate: string;
    isSaved: boolean;
    isApplied: boolean;
  };
  contact: {
    hrName: string;
    email?: string;
    reply: string;
  };
  condition: {
    workExp: string;
    edu: string;
    major: string[];
    language: Array<{ code: number; language: string }>;
    specialty: Array<{ code: string; description: string }>;
  };
  welfare: {
    tag: unknown[];
    welfare: string;
    legalTag: unknown[];
  };
  jobDetail: {
    jobDescription: string;
    jobCategory: Array<{ code: string; description: string }>;
    salary: string;
    salaryMin: number;
    salaryMax: number;
    jobType: number;
    addressRegion: string;
    addressArea: string;
    addressDetail: string;
    manageResp: string;
    needEmp: string;
    remoteWork: string | null;
  };
  industry: string;
  employees: string;
  custNo: string;
}

export interface Company {
  encodedCustNo: string;
  name: string;
  areaDesc: string;
  logo: string;
  industryDesc: string;
  capitalDesc: string;
  employeeCountDesc: string;
  profile: string;
  jobCount: number;
  isSaved: boolean;
}

export interface CompanyDetail {
  custName: string;
  custNo: string;
  industryDesc: string;
  empNo: string;
  capital: string;
  address: string;
  custLink: string;
  profile: string;
  product: string;
  welfare: string;
  hrName: string;
  followerCount: number;
  follow: {
    isSaved: boolean;
    isTracked: boolean;
    followedJobCount: number;
  };
}

export interface SearchJobsParams {
  keyword?: string;
  area?: string;
  ro?: number;
  order?: number;
  asc?: number;
  page?: number;
  s9?: string;
  edu?: string;
  remoteWork?: number;
}

export interface SearchCompaniesParams {
  keyword: string;
  page?: number;
  pageSize?: number;
}

export interface AuthSession {
  cookies: string;
  accessToken?: string;
  userInfo?: {
    sub: string;
    email?: string;
    name?: string;
  };
}
