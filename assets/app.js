/* Le contenu éditorial reste modifiable dans assets/content.json. */
const contentUrl = new URL("assets/content.json", document.baseURI);
const fallbackData = {
  leader: {
    name: "Jean-Marc Kouassi",
    role: "Dirigeant de l'école du dimanche",
    message: "Chaque enfant est une graine pleine de promesses. Notre rôle est de l'accompagner avec bienveillance pour qu'il puisse fleurir.",
    photo: "assets/leader.svg"
  },
  teachers: [
    { name: "Grâce N'Guessan", role: "Groupe des petits", schedule: "Dimanche · 9 h 00 – 10 h 30", bio: "Toujours un sourire et une histoire à partager.", photo: "assets/teacher-grace.svg" },
    { name: "Samuel Yao", role: "Groupe des moyens", schedule: "Dimanche · 9 h 00 – 10 h 30", bio: "Il transforme chaque leçon en aventure.", photo: "assets/teacher-samuel.svg" },
    { name: "Esther Kouamé", role: "Groupe des grands", schedule: "Dimanche · 9 h 00 – 10 h 30", bio: "Elle encourage les talents de chacun.", photo: "assets/teacher-esther.svg" }
  ],
  gallery: [
    { title: "Atelier créatif", category: "activites", description: "Créer ensemble, c'est déjà apprendre ensemble.", image: "assets/atelier.svg" },
    { title: "Un dimanche en joie", category: "celebrations", description: "Des chants et des sourires qui résonnent.", image: "assets/chants.svg" },
    { title: "Jeux en plein air", category: "activites", description: "Bouger, rire et se faire de nouveaux amis.", image: "assets/jeux.svg" },
    { title: "Le temps du partage", category: "celebrations", description: "Un moment calme pour écouter et grandir.", image: "assets/partage.svg" }
  ]
};
let siteData = fallbackData;

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));
const setState = (selector, message) => {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = `<p class="content-state">${escapeHtml(message)}</p>`;
};
const validText = value => typeof value === "string" && value.trim().length > 0;
function isValidContent(data) {
  return data && data.leader && validText(data.leader.name) && validText(data.leader.role) &&
    validText(data.leader.message) && Array.isArray(data.teachers) && Array.isArray(data.gallery) &&
    data.teachers.every(item => item && validText(item.name) && validText(item.role) && validText(item.bio) && validText(item.photo)) &&
    data.gallery.every(item => item && validText(item.title) && validText(item.category) && validText(item.description) && validText(item.image));
}

function renderLeader(leader) {
  const portrait = document.querySelector("#leader-portrait");
  if (!portrait) return;
  portrait.innerHTML = `<img src="${escapeHtml(leader.photo)}" alt="Portrait de ${escapeHtml(leader.name)}"
    onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden>✦</span>`;
  const message = document.querySelector("#leader-message");
  const name = document.querySelector("#leader-name");
  const role = document.querySelector("#leader-role");
  if (message) message.textContent = `« ${leader.message} »`;
  if (name) name.textContent = leader.name;
  if (role) role.textContent = leader.role;
}
function renderTeachers(teachers) {
  const grid = document.querySelector("#teachers-grid");
  if (!grid) return;
  if (!teachers.length) return setState("#teachers-grid", "Aucun professeur n’est renseigné pour le moment.");
  grid.innerHTML = teachers.map(teacher => `<article class="person-card card">
    <div class="teacher-avatar"><img src="${escapeHtml(teacher.photo)}" alt="Portrait de ${escapeHtml(teacher.name)}"
      onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden>${escapeHtml(teacher.initials || "")}</span><i aria-hidden="true">✦</i></div>
    <h3>${escapeHtml(teacher.name)}</h3><p class="role">${escapeHtml(teacher.role)}</p>
    <p class="schedule">${escapeHtml(teacher.schedule || "Horaire à venir")}</p><p>${escapeHtml(teacher.bio)}</p>
  </article>`).join("");
}
function renderGallery(gallery) {
  const grid = document.querySelector("#gallery-grid");
  if (!grid) return;
  if (!gallery.length) return setState("#gallery-grid", "Aucune photo n’est disponible pour le moment.");
  grid.innerHTML = gallery.map((item, index) => `<button class="gallery-item ${index === 0 ? "gallery-large" : ""}"
    data-category="${escapeHtml(item.category)}" data-index="${index}" aria-label="Voir : ${escapeHtml(item.title)}">
    <img class="gallery-art" src="${escapeHtml(item.image)}" alt="" loading="lazy"
      onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="gallery-art-fallback" hidden aria-hidden="true">✦</span>
    <span class="gallery-caption"><small>${escapeHtml(item.category)}</small><strong>${escapeHtml(item.title)}</strong></span>
  </button>`).join("");
}

function setupInteractions() {
  const nav = document.querySelector(".main-nav"), toggle = document.querySelector(".menu-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open)); nav.classList.toggle("is-open", !open);
    });
    nav.addEventListener("click", event => {
      if (event.target.closest("a")) { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }
  const filters = document.querySelector("#gallery-filters");
  if (filters) filters.addEventListener("click", event => {
    const button = event.target.closest(".filter");
    if (!button) return;
    document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
    document.querySelectorAll(".gallery-item").forEach(item => { item.hidden = button.dataset.filter !== "all" && item.dataset.category !== button.dataset.filter; });
  });
  const modal = document.querySelector("#gallery-modal"), grid = document.querySelector("#gallery-grid");
  if (!modal || !grid) return;
  const closeModal = () => { modal.hidden = true; document.body.classList.remove("modal-open"); };
  grid.addEventListener("click", event => {
    const item = event.target.closest(".gallery-item"), data = item && siteData.gallery[Number(item.dataset.index)];
    if (!data) return;
    const image = document.querySelector("#modal-image");
    image.src = data.image; image.alt = data.title;
    document.querySelector("#modal-title").textContent = data.title;
    document.querySelector("#modal-category").textContent = data.category;
    document.querySelector("#modal-description").textContent = data.description;
    modal.hidden = false; document.body.classList.add("modal-open");
  });
  modal.addEventListener("click", event => { if (event.target.hasAttribute("data-close-modal")) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeModal(); });
}

document.addEventListener("DOMContentLoaded", async () => {
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
  const leaderMessage = document.querySelector("#leader-message");
  if (leaderMessage) leaderMessage.textContent = "Chargement des informations…";
  setState("#teachers-grid", "Chargement des professeurs…");
  setState("#gallery-grid", "Chargement de la galerie…");
  try {
    const response = await fetch(contentUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!isValidContent(data)) throw new Error("Structure JSON invalide");
    siteData = data;
  } catch (error) {
    console.warn("Contenu distant indisponible, utilisation des données intégrées.", error);
  }
  renderLeader(siteData.leader); renderTeachers(siteData.teachers); renderGallery(siteData.gallery);
  setupInteractions();
});
