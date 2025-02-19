// Fonction pour appeler les categories via l'API
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
            console.warn("Les catégories ne sont pas encore chargées. Attente...");
            await fetchCategories();
        }

        console.log("Récupération des projets...");
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error("Erreur lors de la récupération des projets");

        const projects = await response.json();
        console.log("Projets récupérés :", projects);

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

        const modalGallery = document.querySelector(".modalGallery");
        modalGallery.innerHTML = "";

        filteredProjects.forEach(proj => {
            const modalFigure = document.createElement("figure");
            modalFigure.innerHTML = `
                <img src="${proj.imageUrl}" alt="${proj.title}">
                <figcaption>${proj.title}</figcaption>
            `;
            modalGallery.appendChild(modalFigure);
        });

    } catch (error) {
        console.error("Erreur lors du chargement des projets :", error);
        document.querySelector(".gallerie").innerText = "Impossible de charger les projets.";
    }
}

const openModal = function(e){
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    target.style.display = null;
    modal = target;
    modal.addEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
    fetchProjects();
};


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
  
  document.addEventListener("DOMContentLoaded", function () {
    const adminHeader = document.getElementById("adminHeader");
    const authLink = document.getElementById("authLink");
    const authToken = sessionStorage.getItem("authToken");
  
    if (authToken && authToken.trim() !== "") {
      adminHeader.style.display = "block";
      authLink.innerHTML = `<a href="#" id="logout" style="cursor: pointer;">Logout</a>`;
  
      document.getElementById("logout").addEventListener("click", function () {
        sessionStorage.removeItem("authToken");
        window.location.href = "./login.html";
      });
    } else {
      adminHeader.style.display = "none";
    }
  });
  
  document.addEventListener("DOMContentLoaded", function () {
    const adminHeader = document.getElementById("adminHeader");
    const header = document.querySelector("header");
    const authToken = sessionStorage.getItem("authToken");

    if (authToken && authToken.trim() !== "") {  
        adminHeader.style.display = "block";  
        header.style.paddingTop = "50px";
    } else {
        adminHeader.style.display = "none";
        header.style.paddingTop = "0px"; 
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const adminHeader = document.getElementById("adminHeader");
    const authToken = sessionStorage.getItem("authToken");
    const filtre = document.getElementById("filtre");

    if (authToken && authToken.trim() !== "") {  
        adminHeader.style.display = "block";  
        filtre.style.display = "none";
    } else {
        adminHeader.style.display = "none";
        filtre.style.display = "flex";
    }
});

let modal = null

const closeModal = function(e){
    if (modal === null) return
    e.preventDefault()
    modal.style.display= "none"
    modal.removeEventListener('click',closeModal)
    modal.querySelector('.js-modal-close').removeEventListener('click',closeModal)
    modal.querySelector('.js-modal-stop').removeEventListener('click',stopPropagation)
    modal = null
}

document.querySelectorAll('.js-modal').forEach(a => {
    a.addEventListener('click',openModal)
})

const stopPropagation = function (e) {
    e.stopPropagation()
}

window.addEventListener('keydown',function (e){
    if (e.key ==="Escape"|| e.key === "Esc"){
        closeModal(e)
    }
})
document.addEventListener("DOMContentLoaded", function () {
    const authToken = sessionStorage.getItem("authToken");
    const editButton = document.querySelector("#projetmodif a.js-modal"); 

    if (authToken && authToken.trim() !== "") {
        editButton.style.display = "inline-block";
    } else {
        editButton.style.display = "none"; 
    }
});

let filteredProjects = [];

async function fetchProjects(category = 'all') {
    try {
        if (Object.keys(categories).length === 0) {
            console.warn("Les catégories ne sont pas encore chargées. Attente...");
            await fetchCategories();
        }

        console.log("Récupération des projets...");
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error("Erreur lors de la récupération des projets");

        const projects = await response.json();
        console.log("Projets récupérés :", projects);

        projects.forEach(proj => {
            console.log(`Projet : ${proj.title}, categoryId: ${proj.categoryId}, Mapped: ${categories[proj.categoryId]}`);
        });

        filteredProjects = category === 'all'
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

        const modalGallery = document.querySelector(".modalGallery");
        modalGallery.innerHTML = "";

        filteredProjects.forEach(proj => {
            const modalFigure = document.createElement("figure");
            modalFigure.style.position = "relative";
            modalFigure.innerHTML = `
                <img src="${proj.imageUrl}" alt="${proj.title}">
                <figcaption>${proj.title}</figcaption>
                <button class="delete-btn" data-id="${proj.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            modalGallery.appendChild(modalFigure);
        });

    } catch (error) {
        console.error("Erreur lors du chargement des projets :", error);
        document.querySelector(".gallerie").innerText = "Impossible de charger les projets.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".modalGallery").addEventListener("click", async (event) => {
        const button = event.target.closest(".delete-btn");
        if (!button) return;

        const projectId = button.dataset.id;

        try {
            const authToken = sessionStorage.getItem("authToken");
            if (!authToken) throw new Error("Utilisateur non authentifié");

            const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Erreur lors de la suppression");

            console.log(`Projet ${projectId} supprimé avec succès`);

            const modalFigure = button.closest("figure");
            modalFigure.classList.add("fade-out");
            setTimeout(() => modalFigure.remove(),);

            document.querySelectorAll(".gallerie figure").forEach(fig => {
                if (fig.dataset.id === projectId) {
                    fig.classList.add("fade-out");
                    setTimeout(() => fig.remove(),);
                }
            });

            filteredProjects = filteredProjects.filter(proj => proj.id != projectId);
            updateGallery();

        } catch (error) {
            console.error("Échec de la suppression :", error);
            alert("Impossible de supprimer ce projet.");
        }
    });
});

function updateGallery() {
    const gallery = document.querySelector(".gallerie");
    gallery.innerHTML = ""; 

    if (filteredProjects.length === 0) {
        gallery.innerHTML = `<p>Aucun projet trouvé.</p>`;
    } else {
        filteredProjects.forEach(proj => {
            const figure = document.createElement("figure");
            figure.dataset.id = proj.id;
            figure.innerHTML = `
                <img src="${proj.imageUrl}" alt="${proj.title}">
                <figcaption>${proj.title}</figcaption>
            `;
            gallery.appendChild(figure);
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const modal1 = document.getElementById("modal1");
    const modal2 = document.getElementById("modal2");
    const btnOpenModal2 = document.querySelector(".ajout-projet"); 
    const btnCloseModals = document.querySelectorAll(".js-modal-close");

    btnOpenModal2.addEventListener("click", function () {
        modal1.style.display = "none";
        modal2.style.display = "flex";
    });

    btnCloseModals.forEach((btn) => {
        btn.addEventListener("click", function () {
            modal1.style.display = "none";
            modal2.style.display = "none";
        });
    });

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("modal")) {
            modal1.style.display = "none";
            modal2.style.display = "none";
        }
    });
});
