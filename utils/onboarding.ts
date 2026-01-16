export const checkOnboardingStatus = (user: any): boolean => {
  // User needs onboarding if:
  // 1. Onboarding not completed, OR
  // 2. No tenant assigned
  return !user?.onboardingCompleted || !user?.tenantId
}

export const needsOnboarding = (user: any): boolean => {
  return checkOnboardingStatus(user)
}
