import { describe, expect, it } from "vitest";
import { exampleRoutes } from "../app-routes";
import { renderHomePage } from "./home";

describe("renderHomePage", () => {
  it("renders the raffle controls and stylesheet wiring", () => {
    const html = renderHomePage(exampleRoutes);

    expect(html).toContain("Future Frontend Ticket Raffle");
    expect(html).toContain("Take control");
    expect(html).toContain("Scan to join");
    expect(html).toContain("renderQrCode");
    expect(html).toContain("Register");
    expect(html).toContain("/api/raffle/ws");
    expect(html).toContain('rel="stylesheet" href="/styles.css"');
  });
});
