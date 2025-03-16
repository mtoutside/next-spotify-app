import { describe, it, expect } from "vitest";
import { fetchUserProfile } from "@/app/utils/api";

describe("fetchUserProfile", () => {
  it("ユーザーデータを取得できる", async () => {
    const user = await fetchUserProfile("test-token");
    expect(user.display_name).toBe("Test User");
  });
});

