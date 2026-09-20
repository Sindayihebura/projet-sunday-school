/* Le contenu éditorial est chargé depuis assets/content.json. */
const contentUrl = "assets/content.json";
let siteData = null;

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));

const setState = (selector, message) => {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = `<p class="content-state">${escapeHtml(message)}</p>`;
};

const teacherArt = teacher => `<div class="teacher-avatar ${escapeHtml(teacher.color || "")}">
  <img src="${escapeHtml(teacher.photo)}" alt="Portrait de ${escapeHtml(teacher.name)}"
    onerror="this.hidden=true;this.nextElementSibling.hidden=false">
  <span hidden>${escapeHtml(teacher.initials || "")}</span><i aria-hidden="true">✦</i>
</div>`;

function renderLeader(leader) {
  const portrait = document.querySelector("#leader-portrait");
  portrait.innerHTML = `<img src="${escapeHtml(leader.photo)}" alt="Portrait de ${escapeHtml(leader.name)}"
    onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden>✦</span>`;
  document.querySelector("#leader-message").textContent = `« ${leader.message} »`;
  document.querySelector("#leader-name").textContent = leader.name;
  document.querySelector("#leader-role").textContent = leader.role;
}

function renderTeachers(teachers) {
  const grid = document.querySelector("#teachers-grid");
  if (!teachers.length) return setState("#teachers-grid", "Aucun professeur n’est renseigné pour le moment.");
  grid.innerHTML = teachers.map(teacher => `<article class="person-card card">
    ${teacherArt(teacher)}<h3>${escapeHtml(teacher.name)}</h3>
    <p class="role">${escapeHtml(teacher.role)}</p>
    <p class="schedule">${escapeHtml(teacher.schedule || "Horaire à venir")}</p>
    <p>${escapeHtml(teacher.bio)}</p>
  </article>`).join("");
}

function renderGallery(gallery) {
  const grid = document.querySelector("#gallery-grid");
  if (!gallery.length) return setState("#gallery-grid", "Aucune photo n’est disponible pour le moment.");
  grid.innerHTML = gallery.map((item, index) => `<button class="gallery-item ${index === 0 ? "gallery-large" : ""}"
    data-category="${escapeHtml(item.category)}" data-index="${index}" aria-label="Voir : ${escapeHtml(item.title)}">
    <img class="gallery-art" src="${escapeHtml(item.image)}" alt="" loading="lazy"
      onerror="this.hidden=true;this.nextElementSibling.hidden=false">
    <span class="gallery-art-fallback" hidden aria-hidden="true">✦</span>
    <span class="gallery-caption"><small>${escapeHtml(item.category)}</small><strong>${escapeHtml(item.title)}</strong></span>
  </button>`).join("");
}

function setupInteractions() {
  const nav = document.querySelector(".main-nav");
  const toggle = document.querySelector(".menu-toggle");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });
  nav.addEventListener("click", event => {
    if (event.target.tagName === "A") {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
  document.querySelector("#gallery-filters").addEventListener("click", event => {
    if (!event.target.matches(".filter")) return;
    document.querySelectorAll(".filter").forEach(button => button.classList.remove("active"));
    event.target.classList.add("active");
    const filter = event.target.dataset.filter;
    document.querySelectorAll(".gallery-item").forEach(item => {
      item.hidden = filter !== "all" && item.dataset.category !== filter;
    });
  });
  const modal = document.querySelector("#gallery-modal");
  modal.hidden = true;
  const openModal = item => {
    const data = siteData.gallery[Number(item.dataset.index)];
    document.querySelector("#modal-image").src = data.image;
    document.querySelector("#modal-image").alt = data.title;
    document.querySelector("#modal-title").textContent = data.title;
    document.querySelector("#modal-category").textContent = data.category;
    document.querySelector("#modal-description").textContent = data.description;
    modal.hidden = false;
    document.body.classList.add("modal-open");
  };
  document.querySelector("#gallery-grid").addEventListener("click", event => {
    const item = event.target.closest(".gallery-item");
    if (item) openModal(item);
  });
  modal.addEventListener("click", event => {
    if (event.target.hasAttribute("data-close-modal")) {
      modal.hidden = true;
      document.body.classList.remove("modal-open");
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) {
      modal.hidden = true;
      document.body.classList.remove("modal-open");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  document.querySelector("#year").textContent = new Date().getFullYear();
  setState("#leader-content", "Chargement des informations…");
  setState("#teachers-grid", "Chargement des professeurs…");
  setState("#gallery-grid", "Chargement de la galerie…");
  try {
    const response = await fetch(contentUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    siteData = await response.json();
    renderLeader(siteData.leader);
    renderTeachers(siteData.teachers || []);
    renderGallery(siteData.gallery || []);
  } catch (error) {
    console.error("Impossible de charger le contenu", error);
    setState("#leader-content", "Les informations du dirigeant sont indisponibles.");
    setState("#teachers-grid", "Les professeurs sont indisponibles.");
    setState("#gallery-grid", "La galerie est indisponible.");
  }
  setupInteractions();
});
