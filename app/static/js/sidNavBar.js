import { saveIsLogsDisplayToCache, saveVerificationToCache } from "./localStorage.js";
import { reloadPage } from "./paging.js";

const verifiedNavBtn = document.getElementById("verified-btn");
const unverifiedNavBtn = document.getElementById("unverified-btn");
const logsNavBtn = document.getElementById("logs-btn");

verifiedNavBtn.addEventListener("click", function (event) {
  if (event.target) {
    saveVerificationToCache(1);
    saveIsLogsDisplayToCache(0);
    reloadPage(true);
  }
});

unverifiedNavBtn.addEventListener("click", function (event) {
  if (event.target) {
    saveVerificationToCache(0);
    saveIsLogsDisplayToCache(0);
    reloadPage(true);
  }
});

logsNavBtn.addEventListener("click", function (event) {
  if (event.target) {
    saveIsLogsDisplayToCache(1);
    reloadPage(true);
  }
});