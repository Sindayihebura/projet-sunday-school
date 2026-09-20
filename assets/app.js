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
  setupSupabase();
});

const ADMIN_EMAIL = "carmelsindayihebura@gmail.com";
let supabaseClient;
let currentUser;
let selectedRating = 0;

function loadSupabase() {
  if (window.supabase) return Promise.resolve(window.supabase);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = () => resolve(window.supabase);
    script.onerror = () => reject(new Error("Supabase CDN indisponible"));
    document.head.appendChild(script);
  });
}
const sessionId = () => {
  let id = sessionStorage.getItem("school-session-id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("school-session-id", id);
  }
  return id;
};
const showMessage = (selector, message, error = false) => {
  const node = document.querySelector(selector);
  if (node) { node.textContent = message; node.classList.toggle("is-error", error); }
};
function renderReviews(reviews) {
  const list = document.querySelector("#reviews-list");
  if (!list) return;
  list.innerHTML = reviews.length ? reviews.map(review => `<article class="review-item"><div class="review-heading"><strong>${escapeHtml(review.display_name)}</strong><span class="stars" aria-label="${review.rating} sur 5">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span></div><p>${escapeHtml(review.comment)}</p><time datetime="${escapeHtml(review.created_at)}">${new Date(review.created_at).toLocaleDateString("fr-FR")}</time></article>`).join("") : '<p class="content-state">Soyez le premier à partager votre expérience.</p>';
}
async function loadReviews() {
  const { data, error } = await supabaseClient.from("reviews").select("id,display_name,rating,comment,created_at").eq("published", true).order("created_at", { ascending: false });
  if (error) return showMessage("#reviews-list", "Les avis sont momentanément indisponibles.", true);
  renderReviews(data || []);
}
function updateAuth(user) {
  currentUser = user;
  const signedIn = Boolean(user);
  document.querySelector("#auth-form")?.toggleAttribute("hidden", signedIn);
  document.querySelector("#logout-button")?.toggleAttribute("hidden", !signedIn);
  document.querySelector("#review-form-wrap")?.toggleAttribute("hidden", !signedIn);
  const status = signedIn ? `Connecté avec ${user.email}` : "Connectez-vous pour partager votre avis.";
  showMessage("#auth-status", status);
  const admin = signedIn && user.email?.toLowerCase() === ADMIN_EMAIL;
  document.querySelector("#admin-panel")?.toggleAttribute("hidden", !admin);
  if (admin) loadAdmin();
}
async function loadAdmin() {
  const [{ data: visits }, { data: reviews }] = await Promise.all([
    supabaseClient.from("page_visits").select("id,session_id,visited_at,user_agent,referrer").order("visited_at", { ascending: false }).limit(100),
    supabaseClient.from("reviews").select("id,display_name,rating,comment,published,created_at").order("created_at", { ascending: false }).limit(100)
  ]);
  const visitRows = visits || [];
  const count = document.querySelector("#visit-count");
  if (count) count.textContent = `${visitRows.length} visite(s) récentes`;
  const visitsList = document.querySelector("#visits-list");
  if (visitsList) visitsList.innerHTML = visitRows.slice(0, 20).map(v => `<p><time>${new Date(v.visited_at).toLocaleString("fr-FR")}</time><br><small>${escapeHtml(v.referrer || "Accès direct")}</small></p>`).join("") || "<p>Aucune visite.</p>";
  const adminReviews = document.querySelector("#admin-reviews");
  if (adminReviews) adminReviews.innerHTML = (reviews || []).map(r => `<article class="admin-review"><p><strong>${escapeHtml(r.display_name)}</strong> · ${"★".repeat(r.rating)}</p><p>${escapeHtml(r.comment)}</p><button class="button button-light" data-review-id="${escapeHtml(r.id)}" data-published="${r.published}">${r.published ? "Masquer" : "Publier"}</button></article>`).join("") || "<p>Aucun avis.</p>";
}
async function setupSupabase() {
  try {
    const sdk = await loadSupabase();
    const config = window.SUPABASE_CONFIG;
    if (!config?.url || !config?.anonKey) throw new Error("Configuration Supabase absente");
    supabaseClient = sdk.createClient(config.url, config.anonKey);
    await supabaseClient.from("page_visits").insert({ session_id: sessionId(), user_agent: navigator.userAgent.slice(0, 500), referrer: document.referrer.slice(0, 1000) });
    const { data: { session } } = await supabaseClient.auth.getSession();
    updateAuth(session?.user);
    supabaseClient.auth.onAuthStateChange((_event, nextSession) => updateAuth(nextSession?.user));
    await loadReviews();
    document.querySelector("#auth-form")?.addEventListener("submit", async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const action = event.submitter?.dataset.authAction || "signin";
      const result = action === "signup"
        ? await supabaseClient.auth.signUp({ email: form.get("email"), password: form.get("password"), options: { data: { display_name: form.get("displayName") } } })
        : await supabaseClient.auth.signInWithPassword({ email: form.get("email"), password: form.get("password") });
      if (result.error) return showMessage("#auth-status", result.error.message, true);
      showMessage("#auth-status", action === "signup" ? "Inscription réussie. Vérifiez votre email. Connexion disponible dans 3 secondes…" : "Connexion réussie.");
      if (action === "signup") await new Promise(resolve => setTimeout(resolve, 3000));
    });
    document.querySelector("#signup-button")?.addEventListener("click", () => { document.querySelector("#auth-form button[type=submit]")?.setAttribute("data-auth-action", "signup"); document.querySelector("#display-name-label")?.removeAttribute("hidden"); showMessage("#auth-status", "Renseignez votre email et choisissez un mot de passe."); });
    document.querySelector("#logout-button")?.addEventListener("click", () => supabaseClient.auth.signOut());
    document.querySelector("#review-form")?.addEventListener("submit", async event => {
      event.preventDefault();
      if (!currentUser || !selectedRating) return showMessage("#auth-status", "Choisissez une note avant de publier.", true);
      const form = new FormData(event.currentTarget);
      const { error } = await supabaseClient.from("reviews").insert({ user_id: currentUser.id, display_name: form.get("displayName"), rating: selectedRating, comment: form.get("comment") });
      if (error) return showMessage("#auth-status", "Impossible de publier cet avis.", true);
      event.currentTarget.reset(); selectedRating = 0; document.querySelectorAll("#rating-stars button").forEach(b => b.classList.remove("selected")); await loadReviews();
    });
    document.querySelector("#rating-stars")?.addEventListener("click", event => { const button = event.target.closest("button"); if (!button) return; selectedRating = Number(button.dataset.rating); document.querySelectorAll("#rating-stars button").forEach(b => b.classList.toggle("selected", Number(b.dataset.rating) <= selectedRating)); });
    document.querySelector("#show-password")?.addEventListener("change", event => {
      const input = document.querySelector("#auth-password");
      if (input) input.type = event.currentTarget.checked ? "text" : "password";
    });
    document.querySelector("#admin-panel")?.addEventListener("click", async event => { const button = event.target.closest("[data-review-id]"); if (!button) return; await supabaseClient.from("reviews").update({ published: button.dataset.published !== "true" }).eq("id", button.dataset.reviewId); await loadAdmin(); await loadReviews(); });
  } catch (error) {
    console.warn("Fonctionnalités communautaires indisponibles.", error.message);
  }
}
