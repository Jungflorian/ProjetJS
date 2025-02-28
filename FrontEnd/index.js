let categories = [];
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

document.addEventListener("DOMContentLoaded", function () {
    fetchCategories().then(populateCategorySelect);
});

document.addEventListener("DOMContentLoaded", function () {
    fetchCategories();
    fetchProjects();
    setupFilters();

    const adminHeader = document.getElementById("adminHeader");
    const authLink = document.getElementById("authLink");
    const authToken = sessionStorage.getItem("authToken");
    const header = document.querySelector("header");
    const editButton = document.querySelector("#projetmodif a.js-modal");

    if (authToken && authToken.trim() !== "") {
        adminHeader.style.display = "block";  
        header.style.paddingTop = "50px";
        filtre.style.display = "none";
        authLink.innerHTML = `<a href="#" id="logout" style="cursor: pointer;">Logout</a>`;
        editButton.style.display = "inline-block";

        document.getElementById("logout").addEventListener("click", function () {
            sessionStorage.removeItem("authToken");
            window.location.href = "./login.html";
        });
    } else {
        adminHeader.style.display = "none";
        header.style.paddingTop = "0px";
        filtre.style.display = "flex"; 
        editButton.style.display = "none"; 
    }

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

    document.getElementById('file-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('preview');
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById("file-input").addEventListener("change", function() {
        if (this.files.length > 0) { 
            document.getElementById("icon").style.display = "none";
            document.getElementById("info-txt").style.display = "none";
            document.getElementById("btn-ajout").style.display = "none";
        }
    });
});

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


const token = sessionStorage.getItem("authToken")


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

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    console.log(file)
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('preview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});
// Enleve les elements si une image est ajouté 
document.getElementById("file-input").addEventListener("change", function() {
    if (this.files.length > 0) { 
        document.getElementById("icon").style.display = "none";
        document.getElementById("info-txt").style.display = "none";
        document.getElementById("file-input").style.display = "none";
    }
});

async function ecoutevalider (){
    document.querySelector('.btn-valider').addEventListener("click",async function (e) {
        e.preventDefault();
       const categorie = document.getElementById('categorie')
        
        const newworks = new FormData();
        newworks.append("image",document.getElementById('file-input').files[0]);
        newworks.append("title",document.getElementById('titre').value);
        newworks.append("category",categorie.value);
    console.log(newworks)
    try{
        const response = await fetch("http://localhost:5678/api/works",{
            method: "POST",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
            },
            body:newworks
        });
        if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(
              `Erreur HTTP ! Statut : ${
                response.status
              }, Détails : ${JSON.stringify(errorDetails)}`
            );
          }
    } 
    catch (Erreur){
        console.log(Erreur)
    }
});
}

ecoutevalider();

async function populateCategorySelect() {
    try {
        if (Object.keys(categories).length === 0) {
            await fetchCategories(); 
        }

        const select = document.getElementById("categorie");
        select.innerHTML = '<option value="">Sélectionner une catégorie</option>';

        Object.entries(categories).forEach(([id, name]) => {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erreur lors du remplissage du select :", error);
    }
}
