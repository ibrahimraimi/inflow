export type WebsiteType = {
  id: number;
  websiteId: string;
  websiteName: string;
  domain: string;
  timeZone: string;
  enableLocalhostTracking: boolean | null;
  userId: string;
};

export type MetricItem = {
  name: string;
  path?: string;
  visitors: number;
  uniqueVisitors?: number;
  icon?: string | null;
  percentage: number;
  code?: string;
};

export type ChartData = {
  date: string;
  views: number;
  visitors: number;
};

export type MapData = {
  code: string;
  name?: string;
  visitors: number;
};

export type TrafficData = {
  day: number;
  hour: number;
  visitors: number;
};

export type AnalyticsData = {
  metrics: {
    visitors: number;
    views: number;
    visits: number;
    bounceRate: number;
    duration: number;
  };
  chart: ChartData[];
  tables: {
    pages: MetricItem[];
    sources: MetricItem[];
    browsers: MetricItem[];
    os: MetricItem[];
    devices: MetricItem[];
    countries: MetricItem[];
    regions: MetricItem[];
    cities: MetricItem[];
  };
  map: MapData[];
  traffic: TrafficData[];
};

export interface WebsiteWithAnalytics {
  website: WebsiteType;
  analytics: AnalyticsType;
}

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

export type LinkType = {
  id: string;
  linkId: string;
  name: string;
  shortCode: string;
  destinationUrl: string;
  createdAt: string;
};
