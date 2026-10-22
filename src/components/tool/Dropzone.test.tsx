import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dropzone } from "./Dropzone";

afterEach(() => {
  cleanup();
});

describe("Dropzone", () => {
  it("rejects unsupported files and never calls onFile", () => {
    const onFile = vi.fn();
    const onError = vi.fn();
    render(<Dropzone onFile={onFile} onError={onError} />);

    const input = screen.getByLabelText(/drop an image here/i);
    const file = new File([new Uint8Array(32)], "loop.gif", { type: "image/gif" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFile).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(String(onError.mock.calls[0]?.[0])).toMatch(/GIF/i);
  });

  it("accepts a jpeg through the file picker", () => {
    const onFile = vi.fn();
    const onError = vi.fn();
    render(<Dropzone onFile={onFile} onError={onError} />);

    const input = screen.getByLabelText(/drop an image here/i);
    const file = new File([new Uint8Array(32)], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onError).not.toHaveBeenCalled();
    expect(onFile).toHaveBeenCalledWith(file);
  });
});
