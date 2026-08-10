import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("defaults to the default variant", () => {
    render(<Badge>Tag</Badge>);
    expect(screen.getByText("Tag")).toHaveAttribute("data-variant", "default");
  });

  it("applies the requested variant", () => {
    render(<Badge variant="destructive">Overdue</Badge>);
    expect(screen.getByText("Overdue")).toHaveAttribute("data-variant", "destructive");
  });

  it("merges a custom className with the variant classes", () => {
    render(<Badge className="custom-class">Styled</Badge>);
    const badge = screen.getByText("Styled");
    expect(badge).toHaveClass("custom-class");
    expect(badge.className).toContain("inline-flex");
  });

  it("renders onto the child element with asChild", () => {
    render(
      <Badge asChild>
        <a href="/leads">Link badge</a>
      </Badge>,
    );
    const link = screen.getByRole("link", { name: "Link badge" });
    expect(link).toHaveAttribute("data-slot", "badge");
  });
});
