// Extend model with job-seeker fields and photo (data URL)
const model = {
  name: "", tagline: "", about: "",
  location: "", email: "", phone: "",
  website: "", github: "", linkedin: "", resume: "",
  yoe: "", role: "",
  photo: "", // data URL
  skills: [],
  experience: [], // {company,title,dates,loc,highlights[]}
  education: [],  // {inst,degree,years,score}
  projects: []    // {title, desc, link, tech[]}
};

const $ = (s) => document.querySelector(s);

// Bind base text inputs to model + preview
function bindInputs() {
  const map = [
    ["#nameInput", "name", "#pName"],
    ["#taglineInput", "tagline", "#pTagline"],
    ["#aboutInput", "about", "#pAbout"],
    ["#locationInput", "location", "#pLocation"],
    ["#emailInput", "email", "#pEmail"],
    ["#websiteInput", "website", "#pWebsite"],
    ["#githubInput", "github", "#pGithub"],
    ["#linkedinInput", "linkedin", "#pLinkedIn"],
    ["#resumeInput", "resume", "#pResume"],
    ["#phoneInput", "phone", "#pPhone"],
    ["#yoeInput", "yoe", "#pYOE"],
    ["#roleInput", "role", "#pRole"]
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

  // Photo upload: preview + store data URL
  $("#photoInput").addEventListener("change", handlePhotoSelect);
  $("#removePhotoBtn").addEventListener("click", removePhoto);
}

function handlePhotoSelect(e) {
  const file = e.target.files?.;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    model.photo = dataUrl;
    updatePhotoPreview();
    autosave();
  };
  reader.readAsDataURL(file); // Base64 data URL
}

function updatePhotoPreview() {
  const img = $("#pPhoto");
  const builderPrev = $("#photoPreview");
  if (model.photo) {
    img.src = model.photo;
    img.style.display = "block";
    builderPrev.src = model.photo;
    builderPrev.style.display = "block";
  } else {
    img.removeAttribute("src");
    img.style.display = "none";
    builderPrev.removeAttribute("src");
    builderPrev.style.display = "none";
  }
}

function removePhoto() {
  model.photo = "";
  $("#photoInput").value = "";
  updatePhotoPreview();
  autosave();
}

function updatePreviewField(key, previewEl) {
  switch (key) {
    case "name": previewEl.textContent = model.name || "Your Name"; break;
    case "tagline": previewEl.textContent = model.tagline || "Your Tagline"; break;
    case "about": previewEl.textContent = model.about || "Write a short intro in the builder to see it here."; break;
    case "location": previewEl.textContent = model.location || "Location"; break;
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
    case "linkedin":
      previewEl.textContent = model.linkedin ? "LinkedIn" : "LinkedIn";
      previewEl.href = model.linkedin || "#";
      break;
    case "resume":
      previewEl.textContent = model.resume ? "Resume" : "Resume";
      previewEl.href = model.resume || "#";
      break;
    case "phone":
      previewEl.textContent = model.phone ? model.phone : "Phone";
      previewEl.href = model.phone ? `tel:${model.phone.replace(/\s+/g,"")}` : "#";
      break;
    case "yoe":
      previewEl.textContent = model.yoe ? `${model.yoe} years experience` : "";
      break;
    case "role":
      previewEl.textContent = model.role ? `${model.role}` : "";
      break;
  }
}

/* Skills (same as before) */
function renderSkills() {
  const list = $("#skillsList");
  const pSkills = $("#pSkills");
  list.innerHTML = "";
  pSkills.innerHTML = "";
  model.skills.forEach((skill, idx) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = skill;
    const btn = document.createElement("button");
    btn.type = "button"; btn.textContent = "Remove";
    btn.onclick = () => { model.skills.splice(idx,1); renderSkills(); autosave(); };
    li.append(span, btn);
    list.appendChild(li);

    const li2 = document.createElement("li");
    li2.appendChild(document.createTextNode(skill));
    pSkills.appendChild(li2);
  });
}
function addSkill() {
  const val = $("#skillInput").value.trim();
  if (!val) return;
  if (!model.skills.includes(val)) model.skills.push(val);
  $("#skillInput").value = "";
  renderSkills(); autosave();
}

/* Experience */
function renderExperience() {
  const b = $("#expBuilderList");
  const p = $("#pExp");
  b.innerHTML = ""; p.innerHTML = "";

  model.experience.forEach((ex, idx) => {
    // Builder item
    const w = document.createElement("div");
    w.className = "item";
    w.innerHTML = `
      <div>
        <h4>${ex.title || "Title"} @ ${ex.company || "Company"}</h4>
        <p class="meta">${[ex.dates, ex.loc].filter(Boolean).join(" • ")}</p>
        <p>${(ex.highlights||[]).join(" • ")}</p>
      </div>
      <div class="controls">
        <button type="button" class="secondary" data-edit="${idx}">Edit</button>
        <button type="button" class="danger" data-del="${idx}">Delete</button>
      </div>`;
    b.appendChild(w);

    // Preview card
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${ex.title || "Title"} @ ${ex.company || "Company"}</h4>
      <p class="muted">${[ex.dates, ex.loc].filter(Boolean).join(" • ")}</p>
      ${ex.highlights?.length ? `<ul style="margin:6px 0 0 16px">${ex.highlights.map(h=>`<li>${escapeHtml(h)}</li>`).join("")}</ul>` : ""}`;
    p.appendChild(card);
  });

  // Wire edit/delete
  b.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => editExperience(+btn.dataset.edit));
  });
  b.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => { model.experience.splice(+btn.dataset.del,1); renderExperience(); autosave(); });
  });
}
function addExperience() {
  const company = $("#expCompanyInput").value.trim();
  const title = $("#expTitleInput").value.trim();
  const dates = $("#expDatesInput").value.trim();
  const loc = $("#expLocInput").value.trim();
  const highlights = $("#expHighlightsInput").value.split(",").map(s=>s.trim()).filter(Boolean);
  if (!company || !title) { alert("Company and Title are required"); return; }
  model.experience.push({ company, title, dates, loc, highlights });
  ["#expCompanyInput","#expTitleInput","#expDatesInput","#expLocInput","#expHighlightsInput"].forEach(s=>$(s).value="");
  renderExperience(); autosave();
}
function editExperience(i) {
  const ex = model.experience[i];
  const company = prompt("Company:", ex.company) ?? ex.company;
  const title = prompt("Title:", ex.title) ?? ex.title;
  const dates = prompt("Dates:", ex.dates) ?? ex.dates;
  const loc = prompt("Location:", ex.loc) ?? ex.loc;
  const highlightsStr = prompt("Highlights CSV:", (ex.highlights||[]).join(", ")) ?? (ex.highlights||[]).join(", ");
  model.experience[i] = {
    company: company.trim(), title: title.trim(), dates: dates.trim(), loc: loc.trim(),
    highlights: highlightsStr.split(",").map(s=>s.trim()).filter(Boolean)
  };
  renderExperience(); autosave();
}

/* Education */
function renderEducation() {
  const b = $("#eduBuilderList");
  const p = $("#pEdu");
  b.innerHTML = ""; p.innerHTML = "";
  model.education.forEach((ed, idx) => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div>
        <h4>${ed.degree || "Degree"} — ${ed.inst || "Institution"}</h4>
        <p class="meta">${[ed.years, ed.score].filter(Boolean).join(" • ")}</p>
      </div>
      <div class="controls">
        <button type="button" class="secondary" data-edit="${idx}">Edit</button>
        <button type="button" class="danger" data-del="${idx}">Delete</button>
      </div>`;
    b.appendChild(item);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${ed.degree || "Degree"} — ${ed.inst || "Institution"}</h4>
      <p class="muted">${[ed.years, ed.score].filter(Boolean).join(" • ")}</p>`;
    p.appendChild(card);
  });

  b.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => editEducation(+btn.dataset.edit));
  });
  b.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => { model.education.splice(+btn.dataset.del,1); renderEducation(); autosave(); });
  });
}
function addEducation() {
  const inst = $("#eduInstInput").value.trim();
  const degree = $("#eduDegreeInput").value.trim();
  const years = $("#eduYearsInput").value.trim();
  const score = $("#eduScoreInput").value.trim();
  if (!inst || !degree) { alert("Institution and Degree are required"); return; }
  model.education.push({ inst, degree, years, score });
  ["#eduInstInput","#eduDegreeInput","#eduYearsInput","#eduScoreInput"].forEach(s=>$(s).value="");
  renderEducation(); autosave();
}
function editEducation(i) {
  const ed = model.education[i];
  const inst = prompt("Institution:", ed.inst) ?? ed.inst;
  const degree = prompt("Degree:", ed.degree) ?? ed.degree;
  const years = prompt("Years:", ed.years) ?? ed.years;
  const score = prompt("Score:", ed.score) ?? ed.score;
  model.education[i] = { inst: inst.trim(), degree: degree.trim(), years: years.trim(), score: score.trim() };
  renderEducation(); autosave();
}

/* Projects (same approach as before) */
function renderProjects() {
  const list = $("#projectsBuilderList");
  const p = $("#pProjects");
  list.innerHTML = ""; p.innerHTML = "";
  model.projects.forEach((proj, idx) => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div>
        <h4>${proj.title}</h4>
        <p class="meta">${proj.link || ""}</p>
        <p>${proj.desc}</p>
      </div>
      <div class="controls">
        <button class="secondary" type="button" data-edit="${idx}">Edit</button>
        <button class="danger" type="button" data-del="${idx}">Delete</button>
      </div>`;
    list.appendChild(item);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${proj.link ? `<a href="${escapeAttr(proj.link)}" target="_blank" rel="noopener">${escapeHtml(proj.title||"Untitled")}</a>` : escapeHtml(proj.title||"Untitled")}</h4>
      ${proj.desc ? `<p>${escapeHtml(proj.desc)}</p>` : ""}
      <div class="tags">${(proj.tech||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>`;
    p.appendChild(card);
  });
  list.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => editProject(+btn.dataset.edit)));
  list.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", () => { model.projects.splice(+btn.dataset.del,1); renderProjects(); autosave(); }));
}
function addProject() {
  const title = $("#projTitleInput").value.trim();
  const desc = $("#projDescInput").value.trim();
  const link = $("#projLinkInput").value.trim();
  const tech = $("#projTechInput").value.split(",").map(s=>s.trim()).filter(Boolean);
  if (!title) { alert("Project title is required"); return; }
  model.projects.push({ title, desc, link, tech });
  ["#projTitleInput","#projDescInput","#projLinkInput","#projTechInput"].forEach(s=>$(s).value="");
  renderProjects(); autosave();
}
function editProject(i) {
  const p = model.projects[i];
  const title = prompt("Project title:", p.title) ?? p.title;
  const desc = prompt("Project description:", p.desc) ?? p.desc;
  const link = prompt("Project link:", p.link) ?? p.link;
  const techStr = prompt("Tech CSV:", (p.tech||[]).join(", ")) ?? (p.tech||[]).join(", ");
  model.projects[i] = { title: title.trim(), desc: desc.trim(), link: link.trim(), tech: techStr.split(",").map(s=>s.trim()).filter(Boolean) };
  renderProjects(); autosave();
}

/* Storage */
const KEY = "portfolio-maker:v2";
function save(){ localStorage.setItem(KEY, JSON.stringify(model)); alert("Saved locally!"); } // Web Storage API
function load(){
  const raw = localStorage.getItem(KEY);
  if(!raw){ alert("Nothing saved yet."); return; }
  Object.assign(model, JSON.parse(raw));
  hydrateInputsFromModel();
  updateAllPreview();
  renderSkills(); renderExperience(); renderEducation(); renderProjects();
  alert("Loaded!");
}
function clearAll(){
  if(!confirm("Clear saved data and reset form?")) return;
  localStorage.removeItem(KEY);
  Object.assign(model, { name:"",tagline:"",about:"",location:"",email:"",phone:"",website:"",github:"",linkedin:"",resume:"",yoe:"",role:"",photo:"",skills:[],experience:[],education:[],projects:[] });
  document.querySelectorAll("input, textarea").forEach(i=>i.value="");
  updateAllPreview();
  renderSkills(); renderExperience(); renderEducation(); renderProjects();
}
let saveTimer; function autosave(){ clearTimeout(saveTimer); saveTimer = setTimeout(()=>localStorage.setItem(KEY, JSON.stringify(model)), 400); }

/* Hydration and initial preview */
function hydrateInputsFromModel(){
  $("#nameInput").value = model.name || "";
  $("#taglineInput").value = model.tagline || "";
  $("#aboutInput").value = model.about || "";
  $("#locationInput").value = model.location || "";
  $("#emailInput").value = model.email || "";
  $("#websiteInput").value = model.website || "";
  $("#githubInput").value = model.github || "";
  $("#linkedinInput").value = model.linkedin || "";
  $("#resumeInput").value = model.resume || "";
  $("#phoneInput").value = model.phone || "";
  $("#yoeInput").value = model.yoe || "";
  $("#roleInput").value = model.role || "";
}

function updateAllPreview(){
  ["name","tagline","about","location","email","website","github","linkedin","resume","phone","yoe","role"].forEach(k=>{
    const map = {name:"#pName",tagline:"#pTagline",about:"#pAbout",location:"#pLocation",email:"#pEmail",website:"#pWebsite",github:"#pGithub",linkedin:"#pLinkedIn",resume:"#pResume",phone:"#pPhone",yoe:"#pYOE",role:"#pRole"};
    updatePreviewField(k, $(map[k]));
  });
  updatePhotoPreview();
}

function escapeHtml(s){return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function escapeAttr(s){return escapeHtml(s)}

/* Download HTML now includes photo and new sections */
function downloadHTML(){
  const photoTag = model.photo ? `<img src="${escapeAttr(model.photo)}" alt="Profile Photo" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:1px solid #2a3443;background:#121821" />` : "";
  const html = `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(model.name||"My Portfolio")}</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;margin:0;padding:24px;line-height:1.6;background:#0b0f14;color:#e7eef8}
a{color:#5aa9ff} .header{padding:16px;border:1px solid #2a3443;border-radius:10px;background:#121821}
.cards{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.card{border:1px solid #2a3443;border-radius:10px;padding:12px;background:#121821}
.chips{list-style:none;padding:0;margin:0;display:flex;gap:8px;flex-wrap:wrap}
.chips li{border:1px solid #2a3443;border-radius:999px;padding:6px 10px}
.muted{color:#9fb4d6}
</style></head><body>
  <div class="header" style="display:flex;gap:16px;align-items:center">
    ${photoTag}
    <div>
      <h1>${escapeHtml(model.name||"")}</h1>
      <p>${escapeHtml(model.tagline||"")}</p>
      <p>${escapeHtml(model.location||"")} • <a href="mailto:${escapeAttr(model.email||"")}">${escapeHtml(model.email||"")}</a></p>
      <p>
        ${model.phone ? `<a href="tel:${escapeAttr((model.phone||"").replace(/\\s+/g,""))}">${escapeHtml(model.phone)}</a> | ` : ""}
        ${model.website ? `<a href="${escapeAttr(model.website)}" target="_blank" rel="noopener">Website</a> | ` : ""}
        ${model.github ? `<a href="${escapeAttr(model.github)}" target="_blank" rel="noopener">GitHub</a> | ` : ""}
        ${model.linkedin ? `<a href="${escapeAttr(model.linkedin)}" target="_blank" rel="noopener">LinkedIn</a> | ` : ""}
        ${model.resume ? `<a href="${escapeAttr(model.resume)}" target="_blank" rel="noopener">Resume</a>` : ""}
      </p>
      ${model.yoe ? `<p class="muted">${escapeHtml(model.yoe)} years experience</p>` : ""}
      ${model.role ? `<p class="muted">${escapeHtml(model.role)}</p>` : ""}
    </div>
  </div>

  <h2>About</h2><p>${escapeHtml(model.about||"")}</p>

  ${model.skills.length?`<h2>Skills</h2><ul class="chips">${model.skills.map(s=>`<li>${escapeHtml(s)}</li>`).join("")}</ul>`:""}

  ${model.experience.length?`<h2>Work Experience</h2><div class="cards">${
    model.experience.map(ex=>`
    <div class="card">
      <h3>${escapeHtml(ex.title||"Title")} @ ${escapeHtml(ex.company||"Company")}</h3>
      <p class="muted">${[ex.dates, ex.loc].filter(Boolean).map(escapeHtml).join(" • ")}</p>
      ${ex.highlights?.length ? `<ul>${ex.highlights.map(h=>`<li>${escapeHtml(h)}</li>`).join("")}</ul>` : ""}
    </div>`).join("")
  }</div>`:""}

  ${model.education.length?`<h2>Education</h2><div class="cards">${
    model.education.map(ed=>`
    <div class="card">
      <h3>${escapeHtml(ed.degree||"Degree")} — ${escapeHtml(ed.inst||"Institution")}</h3>
      <p class="muted">${[ed.years, ed.score].filter(Boolean).map(escapeHtml).join(" • ")}</p>
    </div>`).join("")
  }</div>`:""}

  ${model.projects.length?`<h2>Projects</h2><div class="cards">${
    model.projects.map(p=>`
    <div class="card">
      <h3>${p.link?`<a href="${escapeAttr(p.link)}" target="_blank" rel="noopener">${escapeHtml(p.title||"")}</a>`:escapeHtml(p.title||"")}</h3>
      ${p.desc?`<p>${escapeHtml(p.desc)}</p>`:""}
      ${p.tech?.length?`<p>${p.tech.map(t=>`<span style="border:1px solid #2a3443;border-radius:999px;padding:3px 8px;margin-right:6px">${escapeHtml(t)}</span>`).join("")}</p>`:""}
    </div>`).join("")
  }</div>`:""}
</body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "portfolio.html";
  a.click();
  URL.revokeObjectURL(a.href);
}

function hydrateCollections(){
  renderSkills(); renderExperience(); renderEducation(); renderProjects();
}

window.addEventListener("DOMContentLoaded", () => {
  bindInputs();
  $("#addSkillBtn").addEventListener("click", addSkill);
  $("#addExpBtn").addEventListener("click", addExperience);
  $("#addEduBtn").addEventListener("click", addEducation);
  $("#addProjectBtn").addEventListener("click", addProject);
  $("#saveBtn").addEventListener("click", save);
  $("#loadBtn").addEventListener("click", load);
  $("#clearBtn").addEventListener("click", clearAll);
  $("#downloadBtn").addEventListener("click", downloadHTML);

  const raw = localStorage.getItem(KEY);
  if (raw) Object.assign(model, JSON.parse(raw));
  hydrateInputsFromModel();
  updateAllPreview();
  hydrateCollections();
});
