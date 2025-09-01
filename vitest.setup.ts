import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "./app/mocks/server";
import '@testing-library/jest-dom';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: "error",
  }),
);
afterEach(() => {
  server.resetHandlers()
  cleanup();
});
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
