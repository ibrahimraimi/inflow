/* HELPERS */
const getSafeTimeZone = (tz?: string | null) => {
  if (!tz) return "UTC";
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
};

const formatDateInTz = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const getDomainName = (value: string) => {
  try {
    const host = new URL(value.startsWith("http") ? value : `https://${value}`)
      .hostname;
    return host.replace("www.", "").split(".")[0];
  } catch {
    return value.split(".")[0];
  }
};

const formatWithImage = (map: Record<string, number>) =>
  Object.entries(map).map(([name, visitors]) => ({
    name,
    visitors,
    image: `/${name.toLowerCase()}.png`,
  }));

const formatCountries = (
  map: Record<string, number>,
  codeMap: Record<string, string>
) =>
  Object.entries(map).map(([name, visitors]) => ({
    name,
    visitors,
    image: codeMap[name]
      ? `https://flagsapi.com/${codeMap[name]}/flat/64.png`
      : "/country.png",
  }));

const formatCities = (
  map: Record<string, number>,
  codeMap: Record<string, string>
) =>
  Object.entries(map).map(([name, visitors]) => ({
    name,
    visitors,
    image: codeMap[name]
      ? `https://flagsapi.com/${codeMap[name]}/flat/64.png`
      : "/city.png",
  }));

const formatRegions = (
  map: Record<string, number>,
  codeMap: Record<string, string>
) =>
  Object.entries(map).map(([name, visitors]) => ({
    name,
    visitors,
    image: codeMap[name]
      ? `https://flagsapi.com/${codeMap[name]}/flat/64.png`
      : "/region.png",
  }));

const formatReferrals = (map: Record<string, number>) =>
  Object.entries(map).map(([name, visitors]) => ({
    name,
    visitors,
    domainName: getDomainName(name),
  }));

export {
  getSafeTimeZone,
  formatDateInTz,
  getDomainName,
  formatCountries,
  formatCities,
  formatRegions,
  formatReferrals,
  formatWithImage,
};
