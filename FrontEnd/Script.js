const categories = {
    1: "objet",
    2: "appartement",
    3: "hotel"
};

async function fetchProjects(category = 'all') {
    try {
        console.log("Tentative de récupération des projets...");
        const response = await fetch("http://localhost:5678/api/works");
        
        if (!response.ok) {
            console.error("Erreur de récupération des projets :", response.status);
            throw new Error("Erreur lors de la récupération des projets");
        }

        const projects = await response.json();
        console.log("Projets récupérés :", projects);

        const filteredProjects = category === 'all'
            ? projects
            : projects.filter(project => categories[project.categoryId] === category);

        const gallery = document.querySelector(".gallerie");
        gallery.innerHTML = ""; 

        if (filteredProjects.length === 0) {
            gallery.innerHTML = "Aucun projet trouvé pour cette catégorie.";
        } else {
            filteredProjects.forEach(project => {
                const figure = document.createElement("figure");
                figure.innerHTML = `
                    <img src="${project.imageUrl}" alt="${project.title}">
                    <figcaption>${project.title}</figcaption>
                `;
                gallery.appendChild(figure);
            });
        }
    } catch (error) {
        console.error("Erreur :", error);
        document.querySelector(".gallerie").innerText = "Impossible de charger les projets.";
    }
}

function setupFilters() {
    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const category = button.dataset.category;
            fetchProjects(category);

            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchProjects(); 
    setupFilters();  
});
