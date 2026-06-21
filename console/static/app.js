// Compte à rebours de l'Abattage
(function () {
  const el = document.getElementById("countdown");
  if (!el) return;
  const deadline = new Date(el.dataset.deadline).getTime();
  function tick() {
    const diff = deadline - Date.now();
    if (diff <= 0) { el.textContent = "ABATTAGE EN COURS"; return; }
    const h = String(Math.floor(diff / 3.6e6)).padStart(2, "0");
    const m = String(Math.floor((diff % 3.6e6) / 6e4)).padStart(2, "0");
    const s = String(Math.floor((diff % 6e4) / 1e3)).padStart(2, "0");
    el.textContent = `ABATTAGE DANS ${h}:${m}:${s}`;
  }
  tick();
  setInterval(tick, 1000);
})();

// Soumission d'un flag
document.querySelectorAll(".flag-form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const res = await fetch("/submit", { method: "POST", body: fd });
    const data = await res.json();
    let flash = form.querySelector(".flash");
    if (!flash) {
      flash = document.createElement("div");
      flash.className = "flash";
      form.after(flash);
    }
    if (data.ok) {
      flash.className = "flash ok";
      flash.textContent = "✓ Fragment validé. " + (data.unlock || "");
      setTimeout(() => location.reload(), 1200);
    } else {
      flash.className = "flash err";
      flash.textContent = data.msg || "Code rejeté.";
      form.classList.add("shake");
      setTimeout(() => form.classList.remove("shake"), 400);
    }
  });
});

// Demande d'indice
document.querySelectorAll(".hint-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const res = await fetch("/hint/" + btn.dataset.acte, { method: "POST" });
    const data = await res.json();
    const zone = btn.parentElement.querySelector(".hint-text");
    if (data.ok) {
      const p = document.createElement("p");
      p.textContent = "💡 " + data.hint;
      zone.appendChild(p);
      btn.textContent = `💡 Indice (${btn.textContent.match(/\d+/)[0] * 1 + 1}/${
        btn.textContent.match(/\/(\d+)/)[1]})`;
      if (data.remaining === 0) btn.disabled = true;
    } else {
      zone.innerHTML += `<p class="muted">${data.msg || ""}</p>`;
    }
  });
});
