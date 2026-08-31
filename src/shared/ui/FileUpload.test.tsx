import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { FileUpload } from "./FileUpload";

const pngFile = () =>
  new File(["binary"], "photo.png", { type: "image/png" });

function renderInStrictMode(onUpload: (file: File) => Promise<string>, onChange = vi.fn()) {
  render(
    <StrictMode>
      <FileUpload onUpload={onUpload} onChange={onChange} accept="image/*" />
    </StrictMode>,
  );
  return { onChange };
}

describe("FileUpload", () => {
  it("starts the upload on the first file pick under StrictMode", async () => {
    const onUpload = vi.fn().mockResolvedValue("https://cdn.test/photo.png");
    const { onChange } = renderInStrictMode(onUpload);

    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, pngFile());

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith("https://cdn.test/photo.png"),
    );
  });

  it("does not fire the upload with an empty selection", async () => {
    const onUpload = vi.fn().mockResolvedValue("https://cdn.test/photo.png");
    renderInStrictMode(onUpload);

    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, pngFile());

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
    expect(onUpload.mock.calls[0]?.[0]).toBeInstanceOf(File);
  });

  it("surfaces a failed upload instead of leaving the picker silent", async () => {
    const onUpload = vi.fn().mockRejectedValue(new Error("network down"));
    const { onChange } = renderInStrictMode(onUpload);

    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, pngFile());

    expect(await screen.findByText("Upload failed")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
