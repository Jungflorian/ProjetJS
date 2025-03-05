let categories = [];

function afficherprojets(tab){
    const gallery = document.querySelector(".gallerie");
        gallery.innerHTML = ""; 

    if (tab.length === 0) {
        gallery.innerHTML = `<p>Aucun projet trouvé .</p>`;
    } else {
        tab.forEach(proj => {
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

        tab.forEach(proj => {
            const modalFigure = document.createElement("figure");
            modalFigure.innerHTML = `
                <img src="${proj.imageUrl}" alt="${proj.title}">
                <button class="delete-btn" data-id="${proj.id}"><i class="fa-solid fa-trash-can"></i></button>
            `;
            modalGallery.appendChild(modalFigure);
            document.querySelectorAll(".delete-btn").forEach(button =>{
                button.addEventListener("click",async function () {
                    const projectId= this.dataset.id;
                    await supprimerProjet(projectId);                  
                })
            })
            
        });
}


async function fetchProjects(category = 'all') {
    try {
        if (Object.keys(categories).length === 0) {
            await fetchCategories();
        }

        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error("Erreur lors de la récupération des projets");

        const projects = await response.json();

        const filteredProjects = category === 'all'
            ? projects
            : projects.filter(proj => categories[proj.categoryId] === category);

        afficherprojets(filteredProjects);

    } catch (error) {
        console.error("Erreur dans fetchProjects :", error);
    }
}


async function fetchCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) throw new Error("Problème lors de la récupération des catégories");

    const data = await response.json();
    categories = data.reduce((acc, cat) => {
        acc[cat.id] = cat.name.toLowerCase(); 
        return acc;
    }, {});
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
            resetModal();
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

function resetModal() {
    document.getElementById("add-project-form").reset(); // Réinitialise le formulaire
    removeImage(); // Supprime l'aperçu de l'image
} 

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

document.getElementById("file-input").addEventListener("change", () => {
    const file = document.getElementById("file-input").files[0];

    if (file) {
        // Vérification de la taille du fichier
        if (file.size > 4 * 1024 * 1024) {
            alert("Le fichier est trop grand, il dépasse 4 Mo.");
            removeImage();
            return;
        }

        // Vérification du type du fichier
        const typesValides = ["image/jpeg", "image/png"];
        if (!typesValides.includes(file.type)) {
            alert("Seuls les fichiers JPG et PNG sont autorisés.");
            removeImage();
            return;
        }

        // Affichage de l'aperçu de l'image
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById("preview");
            preview.src = e.target.result;
            preview.style.display = "block";
            document.getElementById("icon").style.display = "none";
            document.getElementById("info-txt").style.display = "none";
            document.getElementById("btn-ajout").style.display = "none";
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
        else {
            let response = await fetch("http://localhost:5678/api/works");
            let data = await response.json();
            afficherprojets(data);
            document.getElementById("add-project-form").reset();
            document.getElementById("preview").src = "";
            document.getElementById("preview").style.display = "none";
            document.getElementById("icon").style.display = "flex";
            document.getElementById("info-txt").style.display = "flex";
            document.getElementById("file-input").style.display = "none";
            document.getElementById("btn-ajout").style.display = "flex";
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

document.addEventListener("DOMContentLoaded", function () {
    const modal1 = document.getElementById("modal1");
    const modal2 = document.getElementById("modal2");
    const modalBackButton = document.querySelector(".js-modal-back");

    modalBackButton.addEventListener("click", function () {
        modal2.style.display = "none";
        modal1.style.display = "flex"; 
    });
});

function checkFormValidity() {
    const title = document.getElementById("titre").value.trim();
    const category = document.getElementById("categorie").value;
    const file = document.getElementById("file-input").files.length > 0;
    const validateBtn = document.querySelector(".btn-valider");

    if (title !== "" && category !== "" && file) {
        validateBtn.style.backgroundColor = "#1D6154";
        validateBtn.disabled = false;
    } else {
        validateBtn.style.backgroundColor = "#A7A7A7"; 
        validateBtn.style.cursor = "pointer";
        validateBtn.disabled = true;
    }
}

document.getElementById("titre").addEventListener("input", checkFormValidity);
document.getElementById("categorie").addEventListener("change", checkFormValidity);
document.getElementById("file-input").addEventListener("change", checkFormValidity);

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".btn-valider").disabled = true;
    checkFormValidity();
});

async function supprimerProjet(projectId) {
    const confirmation = confirm("Voulez-vous vraiment supprimer ce projet ?");
    if (!confirmation) return;

    try {
        const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
            }
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la suppression du projet");
        }

        alert("Projet supprimé avec succès !");
        fetchProjects();
    } catch (error) {
        console.error("Erreur lors de la suppression :", error);
    }
}
function removeImage() {
    document.getElementById("file-input").value = "";
    document.getElementById("preview").src = "";
    document.getElementById("preview").style.display = "none";
    document.getElementById("icon").style.display = "flex";
    document.getElementById("info-txt").style.display = "flex";
    document.getElementById("btn-ajout").style.display = "flex";
}

function resetModal() {
    document.getElementById("add-project-form").reset(); // Réinitialise le formulaire
    removeImage(); // Supprime l'aperçu de l'image
}

document.addEventListener("DOMContentLoaded", function () {
    const modal1 = document.getElementById("modal1");
    const modal2 = document.getElementById("modal2");
    const modalBackButton = document.querySelector(".js-modal-back");

    modalBackButton.addEventListener("click", function () {
        modal2.style.display = "none";
        modal1.style.display = "flex";
        resetModal(); // Réinitialise la modale au retour
    });
});
