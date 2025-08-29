function generatePortfolio() {
  // Get values
  const name = document.getElementById("name").value;
  const role = document.getElementById("role").value;
  const about = document.getElementById("about").value;
  const skills = document.getElementById("skills").value.split(",");
  const projects = document.getElementById("projects").value.split(",");

  // Update preview
  let portfolio = `
    <h2>Portfolio Preview</h2>
    <h1>${name || "Your Name"}</h1>
    <h3>${role || "Your Role"}</h3>
    <p>${about || "About section..."}</p>
    <h4>Skills</h4>
    <ul>${skills.map(skill => skill.trim() ? `<li>${skill.trim()}</li>` : "").join("")}</ul>
    <h4>Projects</h4>
    <ul>${projects.map(project => project.trim() ? `<li>${project.trim()}</li>` : "").join("")}</ul>
  `;

  document.getElementById("portfolio").innerHTML = portfolio;
}
