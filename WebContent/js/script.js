// Data model
const model = {
  name: "",
  tagline: "",
  about: "",
  location: "",
  email: "",
  website: "",
  github: "",
  skills: [],
  projects: [] // {title, desc, link, tech[]}
};

// DOM helpers
const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, children = []) => {
  const n = document.createElement(tag);
  Object.assign(n, props);
  children.forEach(c => n.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return n;
};

// Bind inputs to model + preview
function bindInputs() {
  const map = [
    ["#nameInput", "name", "#pName"],
    ["#taglineInput", "tagline", "#pTagline"],
    ["#aboutInput", "about", "#pAbout"],
    ["#locationInput", "location", "#pLocation"],
    ["#emailInput", "email", "#pEmail"],
    ["#websiteInput", "website", "#pWebsite"],
    ["#githubInput", "github", "#pGithub"]
  ];

  map.forEach(([inputSel, key, previewSel]) => {
    const input = $(inputSel);
    const preview = $(previewSel);
    input.addEventListener("input", () => {
      model[key] = input.value.trim();
      updatePreviewField(key, preview);
      autosave();
    });
  });
}

function updatePreviewField(key, previewEl) {
  switch (key) {
    case "name":
      previewEl.textContent = model.name || "Your Name";
      break;
    case "tagline":
      previewEl.textContent = model.tagline || "Your Tagline";
      break;
    case "about":
      previewEl.textContent = model.about || "Write a short intro in the builder to see it here.";
      break;
    case "location":
      previewEl.textContent = model.location || "Location";
      break;
    case "email":
      previewEl.textContent = model.email || "Email";
      previewEl.href = model.email ? `mailto:${model.email}` : "#";
      break;
    case "website":
      previewEl.textContent = model.website ? "Website" : "Website";
      previewEl.href = model.website || "#";
      break;
    case "github":
      previewEl.textContent = model.github ? "GitHub" : "GitHub";
      previewEl.href = model.github || "#";
      break;
  }
}

// Skills
function renderSkills() {
  const list = $("#skillsList");
  const pSkills = $("#pSkills");
  list.innerHTML = "";
  pSkills.innerHTML = "";

  model.skills.forEach((skill, idx) => {
    const chip = el("li", {}, [
      el("span", { textContent: skill }),
      el("button", { type: "button", textContent: "Remove", onclick: () => { removeSkill(idx); } })
    ]);
    list.appendChild(chip);

    const chip2 = el("li", {}, [el("span", { textContent: skill })]);
    pSkills.appendChild(chip2);
  });
}

function addSkill() {
  const val = $("#skillInput").value.trim();
  if (!val) return;
  if (!model.skills.includes(val)) model.skills.push(val);
  $("#skillInput").value = "";
  renderSkills();
  autosave();
}
function removeSkill(i) {
  model.skills.splice(i, 1);
  renderSkills();
  autosave();
}

// Projects
function renderProjects() {
  const list = $("#projectsBuilderList");
  const p = $("#pProjects");
  list.innerHTML = "";
  p.innerHTML = "";

  model.projects.forEach((proj, idx) => {
    // Builder list item
    const item = el("div", { className: "item" }, [
      el("div", {}, [
        el("h4", { textContent: proj.title }),
        el("p", { className: "meta", textContent: proj.link || "" }),
        el("p", { textContent: proj.desc })
      ]),
      el("div", { className: "controls" }, [
        el("button", { className: "secondary", type: "button", textContent: "Edit", onclick: () => editProject(idx) }),
        el("button", { className: "danger", type: "button", textContent: "Delete", onclick: () => deleteProject(idx) })
      ])
    ]);
    list.appendChild(item);

    // Preview card
    const card = el("div", { className: "card" }, [
      el("h4", {}, [
        el("a", { href: proj.link || "#", target: "_blank", rel: "noopener", textContent: proj.title || "Untitled" })
      ]),
      el("p", { textContent: proj.desc || "" }),
      el("div", { className: "tags" }, (proj.tech || []).map(t => el("span", { className: "tag", textContent: t })))
    ]);
    p.appendChild(card);
  });
}

function addProject() {
  const title = $("#projTitleInput").value.trim();
  const desc = $("#projDescInput").value.trim();
  const link = $("#projLinkInput").value.trim();
  const tech = $("#projTechInput").value.split(",").map(s => s.trim()).filter(Boolean);

  if (!title) { alert("Project title is required"); return; }

  model.projects.push({ title, desc, link, tech });
  ["#projTitleInput", "#projDescInput", "#projLinkInput", "#projTechInput"].forEach(s => $(s).value = "");
  renderProjects();
  autosave();
}

function editProject(i) {
  const proj = model.projects[i];
  const title = prompt("Project title:", proj.title) ?? proj.title;
  const desc = prompt("Project description:", proj.desc) ?? proj.desc;
  const link = prompt("Project link:", proj.link) ?? proj.link;
  const techStr = prompt("Tech CSV:", (proj.tech || []).join(", ")) ?? (proj.tech || []).join(", ");
  model.projects[i] = { title: title.trim(), desc: desc.trim(), link: link.trim(), tech: techStr.split(",").map(s => s.trim()).filter(Boolean) };
  renderProjects();
  autosave();
}

function deleteProject(i) {
  if (!confirm("Delete this project?")) return;
  model.projects.splice(i, 1);
  renderProjects();
  autosave();
}

// Persistence (localStorage)
const KEY = "portfolio-maker:v1";

function save() {
  localStorage.setItem(KEY, JSON.stringify(model));
  alert("Saved locally!");
}
function load() {
  const raw = localStorage.getItem(KEY);
  if (!raw) { alert("Nothing saved yet."); return; }
  const data = JSON.parse(raw);
  Object.assign(model, data);
  hydrateInputsFromModel();
  renderSkills();
  renderProjects();
  ["name","tagline","about","location","email","website","github"].forEach(k => {
    const map = {name:"#pName",tagline:"#pTagline",about:"#pAbout",location:"#pLocation",email:"#pEmail",website:"#pWebsite",github:"#pGithub"};
    updatePreviewField(k, $(map[k]));
  });
  alert("Loaded!");
}
function clearAll() {
  if (!confirm("Clear saved data and reset form?")) return;
  localStorage.removeItem(KEY);
  Object.assign(model, {name:"",tagline:"",about:"",location:"",email:"",website:"",github:"",skills:[],projects:[]});
  document.querySelectorAll("input, textarea").forEach(i=>i.value="");
  renderSkills();
  renderProjects();
  ["name","tagline","about","location","email","website","github"].forEach(k => {
    const map = {name:"#pName",tagline:"#pTagline",about:"#pAbout",location:"#pLocation",email:"#pEmail",website:"#pWebsite",github:"#pGithub"};
    updatePreviewField(k, $(map[k]));
  });
}

// autosave on changes (debounced)
let saveTimer;
function autosave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => localStorage.setItem(KEY, JSON.stringify(model)), 400);
}

// Hydrate inputs from model to form fields
function hydrateInputsFromModel() {
  $("#nameInput").value = model.name || "";
  $("#taglineInput").value = model.tagline || "";
  $("#aboutInput").value = model.about || "";
  $("#locationInput").value = model.location || "";
  $("#emailInput").value = model.email || "";
  $("#websiteInput").value = model.website || "";
  $("#githubInput").value = model.github || "";
}

// Download static HTML of preview
function downloadHTML() {
  const html = `
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(model.name || "My Portfolio")}</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;margin:0;padding:24px;line-height:1.6;background:#0b0f14;color:#e7eef8}
a{color:#5aa9ff}
.header{padding:16px;border:1px solid #2a3443;border-radius:10px;background:#121821}
.chips{list-style:none;padding:0;margin:0;display:flex;gap:8px;flex-wrap:wrap}
.chips li{border:1px solid #2a3443;border-radius:999px;padding:6px 10px}
.card{border:1px solid #2a3443;border-radius:10px;padding:12px;background:#121821;margin-bottom:12px}
h1,h2,h3{margin:12px 0}
</style>
</head><body>
  <div class="header">
    <h1>${escapeHtml(model.name || "")}</h1>
    <p>${escapeHtml(model.tagline || "")}</p>
    <p>${escapeHtml(model.location || "")} • <a href="mailto:${escapeAttr(model.email || "")}">${escapeHtml(model.email || "")}</a></p>
    <p>
      ${model.website ? `<a href="${escapeAttr(model.website)}" target="_blank" rel="noopener">Website</a>` : ""}
      ${model.github ? ` | <a href="${escapeAttr(model.github)}" target="_blank" rel="noopener">GitHub</a>` : ""}
    </p>
  </div>

  <h2>About</h2>
  <p>${escapeHtml(model.about || "")}</p>

  ${model.skills.length ? `<h2>Skills</h2><ul class="chips">${model.skills.map(s=>`<li>${escapeHtml(s)}</li>`).join("")}</ul>` : ""}

  ${model.projects.length ? `<h2>Projects</h2>${model.projects.map(p=>`
    <div class="card">
      <h3>${p.link ? `<a href="${escapeAttr(p.link)}" target="_blank" rel="noopener">${escapeHtml(p.title || "")}</a>` : escapeHtml(p.title || "")}</h3>
      ${p.desc ? `<p>${escapeHtml(p.desc)}</p>` : ""}
      ${p.tech?.length ? `<p>${p.tech.map(t=>`<span style="border:1px solid #2a3443;border-radius:999px;padding:3px 8px;margin-right:6px">${escapeHtml(t)}</span>`).join("")}</p>` : ""}
    </div>`).join("")}` : ""}
</body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "portfolio.html";
  a.click();
  URL.revokeObjectURL(a.href);
}

function escapeHtml(s){return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function escapeAttr(s){return escapeHtml(s)}

// Init
window.addEventListener("DOMContentLoaded", () => {
  bindInputs();
  $("#addSkillBtn").addEventListener("click", addSkill);
  $("#addProjectBtn").addEventListener("click", addProject);
  $("#saveBtn").addEventListener("click", save);
  $("#loadBtn").addEventListener("click", load);
  $("#clearBtn").addEventListener("click", clearAll);
  $("#downloadBtn").addEventListener("click", downloadHTML);

  // Try autoload last session
  const raw = localStorage.getItem(KEY);
  if (raw) {
    Object.assign(model, JSON.parse(raw));
    hydrateInputsFromModel();
    renderSkills();
    renderProjects();
    ["name","tagline","about","location","email","website","github"].forEach(k => {
      const map = {name:"#pName",tagline:"#pTagline",about:"#pAbout",location:"#pLocation",email:"#pEmail",website:"#pWebsite",github:"#pGithub"};
      updatePreviewField(k, document.querySelector(map[k]));
    });
  } else {
    // prime default preview
    ["name","tagline","about","location","email","website","github"].forEach(k => {
      const map = {name:"#pName",tagline:"#pTagline",about:"#pAbout",location:"#pLocation",email:"#pEmail",website:"#pWebsite",github:"#pGithub"};
      updatePreviewField(k, document.querySelector(map[k]));
    });
  }
});
