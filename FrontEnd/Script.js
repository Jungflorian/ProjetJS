async function fetchCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des catégories");
        }
        const categories = await response.json();
        const filterContainer = document.getElementById("filtre");

        const allBtn = document.createElement("button");
        allBtn.textContent = "Tous";
        allBtn.dataset.id = "all";
        allBtn.classList.add("filter-btn", "active");
        filterContainer.appendChild(allBtn);

        categories.forEach(category => {
            const btn = document.createElement("button");
            btn.textContent = category.name;
            btn.dataset.id = category.id;
            btn.classList.add("filter-btn");
            filterContainer.appendChild(btn);
        });

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                fetchProjects(e.target.dataset.id);
            });
        });

    } catch (error) {
        console.error("Erreur :", error);
    }
}

async function fetchProjects(categoryId = "all") {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des projets");
        }
        const projects = await response.json();
        const gallery = document.querySelector(".gallerie");
        gallery.innerHTML = "";

        const filteredProjects = categoryId === "all" ? projects : projects.filter(p => p.categoryId == categoryId);

        filteredProjects.forEach(project => {
            const figure = document.createElement("figure");
            figure.innerHTML = `
                <img src="${project.imageUrl}" alt="${project.title}">
                <figcaption>${project.title}</figcaption>
            `;
            gallery.appendChild(figure);
        });

    } catch (error) {
        console.error("Erreur :", error);
        document.querySelector(".gallerie").innerText = "Impossible de charger les projets.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchCategories();
    fetchProjects();
});
