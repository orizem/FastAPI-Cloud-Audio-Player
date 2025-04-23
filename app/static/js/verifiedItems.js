import { saveVerificationToCache } from "./localStorage.js";
import { reloadPage } from "./paging.js";

const unverifyBtn = document.getElementById("verifyAudio");
const verifiedNavBtn = document.getElementById("verified-btn");
const unverifiedNavBtn = document.getElementById("unverified-btn");

verifiedNavBtn.addEventListener("click", function (event) {
  if (event.target) {
    saveVerificationToCache(1);
    reloadPage(true);
  }
});

unverifiedNavBtn.addEventListener("click", function (event) {
  if (event.target) {
    saveVerificationToCache(0);
    reloadPage(true);
  }
});

unverifyBtn.addEventListener("click", async () => {
  const audio = document.getElementById("audio_id");
  const source = audio?.querySelector("source");
  if (!source) return;

  const audioId = source.src.split("/api/audio/")[1];
  const verification = await fetch(`/api/verified/${audioId}`);
  const data = await verification.json();

  if (!audioId || audioId === "#" || data === 1) return;

  try {
    const res = await fetch(`/api/verify/${audioId}`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
    reloadPage();
  } catch (err) {
    console.error("Error:", err);
  }
});
