import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "./app/mocks/server";

beforeAll(() =>
  server.listen({
    onUnhandledRequest: "error",
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import("next/navigation")>()),
    redirect: redirectMock,
  };
});

beforeEach(() => {
  redirectMock.mockClear();
});
