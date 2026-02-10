import {
  getSafeTimeZone,
  formatDateInTz,
  getDomainName,
  formatWithImage,
} from "@/lib/helpers";

describe("helpers", () => {
  describe("getSafeTimeZone", () => {
    it("should return UTC for null or undefined", () => {
      expect(getSafeTimeZone(null)).toBe("UTC");
      expect(getSafeTimeZone(undefined)).toBe("UTC");
    });

    it("should return the timezone if it is valid", () => {
      expect(getSafeTimeZone("America/New_York")).toBe("America/New_York");
      expect(getSafeTimeZone("Europe/London")).toBe("Europe/London");
    });

    it("should return UTC for invalid timezone", () => {
      expect(getSafeTimeZone("Invalid/Timezone")).toBe("UTC");
    });
  });

  describe("formatDateInTz", () => {
    it("should format date correctly in given timezone", () => {
      const date = new Date("2024-01-01T12:00:00Z");
      expect(formatDateInTz(date, "UTC")).toBe("2024-01-01");
      // America/New_York is UTC-5 (or -4), so 12:00 UTC is early morning same day
      expect(formatDateInTz(date, "America/New_York")).toBe("2024-01-01");
    });
  });

  describe("getDomainName", () => {
    it("should extract domain name from URL", () => {
      expect(getDomainName("https://www.google.com")).toBe("google");
      expect(getDomainName("http://github.com/path")).toBe("github");
      expect(getDomainName("example.org")).toBe("example");
    });

    it("should handle invalid URLs gracefully", () => {
      expect(getDomainName("not-a-url")).toBe("not-a-url");
    });
  });

  describe("formatWithImage", () => {
    it("should format map to array with image paths", () => {
      const map = { Chrome: 10, Firefox: 5 };
      const result = formatWithImage(map);
      expect(result).toContainEqual({
        name: "Chrome",
        visitors: 10,
        image: "/chrome.png",
      });
      expect(result).toContainEqual({
        name: "Firefox",
        visitors: 5,
        image: "/firefox.png",
      });
    });
  });
});
