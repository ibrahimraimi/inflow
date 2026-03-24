export type FeatureStatus = 'enabled' | 'disabled' | 'testing' | 'deprecated';

export interface FeatureDefinition {
  status: FeatureStatus;
  description: string;
  envOverride?: string;
  userCheck?: (user: any) => boolean;
}

export const FEATURES = {
  multiSiteDashboard: {
    status: 'disabled',
    description: 'Unified global dashboard aggregating analytics across all sites',
    envOverride: process.env.NEXT_PUBLIC_ENABLE_MULTI_SITE_DASHBOARD,
    userCheck: (user: any) => {
      if (!user) return false;
      // Allow internal testers
      if (user.role === 'admin') return true;
      const email = user.email?.toLowerCase() || '';
      if (email.endsWith('@inflow.test') || email.includes('ibrahim.raimi')) return true;
      return false;
    }
  } as FeatureDefinition,
  flow: {
    status: 'testing',
    description: 'User conversion path visualization and node flowchart',
    envOverride: process.env.NEXT_PUBLIC_ENABLE_FLOW,
    userCheck: (user: any) => {
      if (!user) return false;
      // Allow internal testers
      if (user.role === 'admin') return true;
      const email = user.email?.toLowerCase() || '';
      if (email.endsWith('@inflow.test') || email.includes('ibrahim.raimi')) return true;
      return false;
    }
  } as FeatureDefinition,
} as const;

export type FeatureName = keyof typeof FEATURES;

export function isFeatureEnabled(featureName: FeatureName, user?: any): boolean {
  const feature = FEATURES[featureName];
  if (!feature) return false;

  // 1. Environment override takes precedence
  if (feature.envOverride) {
    if (feature.envOverride === 'true' || feature.envOverride === '1') return true;
    if (feature.envOverride === 'false' || feature.envOverride === '0') return false;
  }

  // 2. Check strict status
  if (feature.status === 'enabled') return true;
  if (feature.status === 'disabled' || feature.status === 'deprecated') return false;

  // 3. Testing status requires a user check
  if (feature.status === 'testing') {
    if (feature.userCheck && user) {
      return feature.userCheck(user);
    }
    // Fall back to disabling it if no user context is provided for a testing feature
    // In local development, we enforce it to true for developer convenience
    if (process.env.NODE_ENV === 'development') return true;
    return false;
  }

  return false;
}
