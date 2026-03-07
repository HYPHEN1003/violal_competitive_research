import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Home from "@/app/page"

describe("Home", () => {
  it("タイトルが表示される", () => {
    render(<Home />)
    expect(screen.getByText("HYPHEN Project")).toBeInTheDocument()
  })
})
