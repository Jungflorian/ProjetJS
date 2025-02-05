let categories = {};

async function fetchCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) throw new Error("Erreur lors de la récupération des catégories");

        const data = await response.json();
        console.log("Catégories récupérées :", data);

        if (!Array.isArray(data)) {
            throw new Error("Format inattendu des catégories");
        }

        categories = Object.fromEntries(data.map(cat => [cat.id, cat.name.toLowerCase()]));
        console.log("Categories mappées :", categories);
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
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
