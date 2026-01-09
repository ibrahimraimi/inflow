export type WebsiteType = {
  id: number;
  websiteId: string;
  websiteName: string;
  domain: string;
  timeZone: string;
  enableLocalhostTracking: boolean;
  userId: string;
};

export type AnalyticsType = {
  totalVisitors: number;
  totalSessions: number;
  totalActiveTime: number;
  avgActiveTime: number;
  hourlyVisitors: Array<{
    date: string;
    hour: number;
    hourLabel: string;
    count: number;
  }>;
  dailyVisitors: Array<{
    date: string;
    count: number;
  }>;
  countries: Array<{
    name: string;
    visitors: number;
    image: string;
  }>;
  cities: Array<{
    name: string;
    visitors: number;
    image: string;
  }>;
  regions: Array<{
    name: string;
    visitors: number;
    image: string;
  }>;
  referrals: Array<{
    name: string;
    visitors: number;
    domainName: string;
  }>;
  browsers: Array<{
    name: string;
    visitors: number;
    image: string;
  }>;
  os: Array<{
    name: string;
    visitors: number;
    image: string;
  }>;
  devices: Array<{
    name: string;
    visitors: number;
    image: string;
  }>;
  last24hVisitors: number;
};
