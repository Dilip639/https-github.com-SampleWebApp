function editAbout() {
  const desc = document.getElementById("about-desc");
  const newBio = prompt("Enter new bio:", desc.textContent);
  if (newBio) desc.textContent = newBio;
}

function addProject() {
  const projectName = prompt("Project name:");
  const projectDesc = prompt("Project description:");
  if (projectName && projectDesc) {
    const list = document.getElementById("projects-list");
    const item = document.createElement('div');
    item.className = 'project-item';
    item.innerHTML = `<h3>${projectName}</h3><p>${projectDesc}</p>`;
    list.appendChild(item);
  }
}

function submitContact(e) {
  e.preventDefault();
  document.getElementById('contact-result').textContent = "Thank you for your message!";
  document.getElementById('contact-form').reset();
}
