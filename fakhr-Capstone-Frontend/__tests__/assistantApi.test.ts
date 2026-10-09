import instance from "../api/axios";
import { sendHelpMessage } from "../api/helpCenter.api";
jest.mock("../api/axios", () => ({ __esModule: true, default: { post: jest.fn() } }));
test("uses the existing ask contract and reads the real answer", async () => {
  (instance.post as jest.Mock).mockResolvedValue({ success: true, data: { answer: "Verified response", timestamp: "2026-10-09T00:00:00Z" } });
  await expect(sendHelpMessage({ message: "Question" })).resolves.toEqual({ message: "Verified response", timestamp: "2026-10-09T00:00:00Z" });
  expect(instance.post).toHaveBeenCalledWith("/ai/ask", { question: "Question" }, { timeout: 60000 });
});
test("rejects empty responses instead of supplying a made-up answer", async () => {
  (instance.post as jest.Mock).mockResolvedValue({ success: true, data: { answer: "" } });
  await expect(sendHelpMessage({ message: "Question" })).rejects.toThrow("AI returned no answer");
});
