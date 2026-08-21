const PERSONAL_APP_BUNDLE_IDENTIFIERS = [
  'com.significanthobbies.app',
  'com.significanthobbies.calorie',
  'com.significanthobbies.setline',
  'com.significanthobbies.kith',
  'com.significanthobbies.indulge',
  'com.significanthobbies.anchor',
] as const;

export function nativeAppleAudiences(
  primaryBundleIdentifier: string | undefined,
  configuredAudiences: string | undefined
): string[] {
  return [
    primaryBundleIdentifier,
    ...PERSONAL_APP_BUNDLE_IDENTIFIERS,
    ...(configuredAudiences?.split(',') ?? []),
  ]
    .map((audience) => audience?.trim() ?? '')
    .filter(
      (audience, index, audiences) => audience.length > 0 && audiences.indexOf(audience) === index
    );
}
