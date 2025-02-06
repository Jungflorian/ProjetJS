let categories = {};

async function fetchCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) throw new Error("Problème lors de la récupération des catégories");

        const data = await response.json();
        categories = data.reduce((acc, cat) => {
            acc[cat.id] = cat.name.toLowerCase(); 
            return acc;
        }, {});

        console.log(" Catégories récupérées :", categories);
    } catch (error) {
        console.error("Erreur de récupération des catégories :", error);
    }
}


async function fetchProjects(category = 'all') {
    try {
        if (Object.keys(categories).length === 0) {
            console.warn(" Les catégories ne sont pas encore chargées. Attente...");
            await fetchCategories();
        }

        console.log(" Récupération des projets...");
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error("Erreur lors de la récupération des projets");

        const projects = await response.json();
        console.log(" Projets récupérés :", projects);

        projects.forEach(proj => {
            console.log(`Projet : ${proj.title}, categoryId: ${proj.categoryId}, Mapped: ${categories[proj.categoryId]}`);
        });

        const filteredProjects = category === 'all'
            ? projects
            : projects.filter(proj => categories[proj.categoryId] === category);

        console.log(`Projets filtrés pour "${category}" :`, filteredProjects);

        const gallery = document.querySelector(".gallerie");
        gallery.innerHTML = ""; 

        if (filteredProjects.length === 0) {
            gallery.innerHTML = `<p>Aucun projet trouvé pour "${category}".</p>`;
        } else {
            filteredProjects.forEach(proj => {
                const figure = document.createElement("figure");
                figure.innerHTML = `
                    <img src="${proj.imageUrl}" alt="${proj.title}">
                    <figcaption>${proj.title}</figcaption>
                `;
                gallery.appendChild(figure);
            });
        }
    } catch (error) {
        console.error("Erreur lors du chargement des projets :", error);
        document.querySelector(".gallerie").innerText = "Impossible de charger les projets.";
    }
}

function setupFilters() {
    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const category = button.dataset.category;
            console.log(`Bouton cliqué : ${category}`);

            await fetchProjects(category);

            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await fetchCategories();  
    await fetchProjects();  
    setupFilters();
});

const token = sessionStorage.getItem("authToken")

document.addEventListener("DOMContentLoaded", function () {
    const adminHeader = document.getElementById("adminHeader");
    const authLink = document.getElementById("authLink");
    const authToken = sessionStorage.getItem("authToken");
  
    if (authToken) {
      adminHeader.style.display = "block";
      authLink.innerHTML = `<a href="#" id="logout" style="cursor: pointer;">Logout</a>`;
      document.getElementById("logout").addEventListener("click", function () {
        sessionStorage.removeItem("authToken");
        window.location.href = "./login.html";
      });
    }
  });
  