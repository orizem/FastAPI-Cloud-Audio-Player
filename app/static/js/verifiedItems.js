import { reloadPage } from "./paging.js";

const verifyAudioBtn = document.getElementById("verifyAudio");

verifyAudioBtn.addEventListener("click", async () => {
  const audio = document.getElementById("audio_id");
  const source = audio?.querySelector("source");
  if (!source) return;

  const audioId = source.src.split("/api/audio/")[1];
  if (!audioId || audioId === "#") return;

  try {
    const res = await fetch(`/api/verify/${audioId}`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
    reloadPage();
  } catch (err) {
    console.error("Error:", err);
  }
});

export async function verificationBtnUpdate(audioId) {
  const verification = await fetch(`/api/verified/${audioId}`);
  const verificationData = await verification.json();
  const verifyAudioBtn = document.getElementById("verifyAudio");
  verifyAudioBtn.innerHTML = verificationData == 1 ? "Unverify" : "Verify";
}
