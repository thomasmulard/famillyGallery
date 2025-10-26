// ===== PHOTO DATA =====
const photos = [
    {
        id: 1,
        src: 'images/image_1.jpeg',
        title: 'Plage au coucher du soleil',
        description: 'Famille souriante sur une plage de sable fin avec des palmiers en arrière-plan au coucher du soleil',
        date: 'Été 2024',
        category: 'vacances',
        year: '2024'
    },
    {
        id: 2,
        src: 'images/image_2.jpeg',
        title: 'Anniversaire',
        description: 'Jeune garçon blond soufflant les bougies d\'un gâteau d\'anniversaire coloré entouré de sa famille',
        date: 'Printemps 2024',
        category: 'fetes',
        year: '2024'
    },
    {
        id: 3,
        src: 'images/image_3.jpeg',
        title: 'Randonnée en montagne',
        description: 'Famille de cinq personnes en tenue de randonnée posant devant un panorama montagneux avec des sommets enneigés',
        date: 'Automne 2024',
        category: 'vacances',
        year: '2024'
    },
    {
        id: 4,
        src: 'images/image_4.jpeg',
        title: 'Noël en famille',
        description: 'Sapin de Noël décoré avec des guirlandes dorées et des cadeaux colorés disposés au pied dans un salon chaleureux',
        date: 'Décembre 2023',
        category: 'fetes',
        year: '2023'
    },
    {
        id: 5,
        src: 'images/image_5.jpeg',
        title: 'Pique-nique au parc',
        description: 'Famille assise sur une couverture à carreaux dans un parc verdoyant avec un panier de pique-nique et des enfants qui jouent',
        date: 'Été 2024',
        category: 'quotidien',
        year: '2024'
    },
    {
        id: 6,
        src: 'images/image_6.jpeg',
        title: 'Premiers pas',
        description: 'Petite fille aux cheveux bouclés faisant ses premiers pas dans un salon lumineux avec ses parents qui l\'encouragent',
        date: 'Printemps 2024',
        category: 'quotidien',
        year: '2024'
    },
    {
        id: 7,
        src: 'images/image_7.jpeg',
        title: 'Barbecue familial',
        description: 'Barbecue familial dans un jardin avec une grande table dressée et la famille réunie autour du grill fumant',
        date: 'Été 2024',
        category: 'quotidien',
        year: '2024'
    },
    {
        id: 8,
        src: 'images/image_8.jpeg',
        title: 'Sortie au zoo',
        description: 'Enfants émerveillés devant l\'enclos des girafes au zoo, pointant du doigt les animaux avec excitation',
        date: 'Printemps 2024',
        category: 'vacances',
        year: '2024'
    },
    {
        id: 9,
        src: 'images/image_9.jpeg',
        title: 'Moments précieux',
        description: 'Collection de moments familiaux mémorables capturés ensemble',
        date: 'Toute l\'année 2024',
        category: 'quotidien',
        year: '2024'
    },
    {
        id: 10,
        src: 'images/image_10.jpeg',
        title: 'Souvenirs d\'été',
        description: 'Moments inoubliables passés en famille pendant les vacances d\'été',
        date: 'Été 2024',
        category: 'vacances',
        year: '2024'
    },
    {
        id: 11,
        src: 'images/image_11.jpeg',
        title: 'Après-midi ensoleillé',
        description: 'Profiter d\'un bel après-midi ensoleillé en famille',
        date: 'Été 2024',
        category: 'quotidien',
        year: '2024'
    },
    {
        id: 12,
        src: 'images/image_12.jpeg',
        title: 'Aventures familiales',
        description: 'Exploration et découvertes en famille lors de nos sorties',
        date: 'Automne 2024',
        category: 'vacances',
        year: '2024'
    },
    {
        id: 13,
        src: 'images/image_13.jpeg',
        title: 'Rires et joie',
        description: 'Moments de bonheur et de complicité partagés ensemble',
        date: 'Printemps 2024',
        category: 'quotidien',
        year: '2024'
    },
    {
        id: 14,
        src: 'images/image_14.jpeg',
        title: 'Journée spéciale',
        description: 'Une journée mémorable passée en famille',
        date: 'Été 2024',
        category: 'fetes',
        year: '2024'
    },
    {
        id: 15,
        src: 'images/image_15.jpeg',
        title: 'Temps de qualité',
        description: 'Profiter de chaque instant passé ensemble en famille',
        date: 'Automne 2024',
        category: 'quotidien',
        year: '2024'
    },
    {
        id: 16,
        src: 'images/image_16.jpeg',
        title: 'Célébration',
        description: 'Moments de célébration et de fête en famille',
        date: 'Hiver 2023',
        category: 'fetes',
        year: '2023'
    },
    {
        id: 17,
        src: 'images/image_17.jpeg',
        title: 'Escapade nature',
        description: 'Découverte de la nature lors de nos balades familiales',
        date: 'Printemps 2024',
        category: 'vacances',
        year: '2024'
    },
    {
        id: 18,
        src: 'images/image_18.jpeg',
        title: 'Instants précieux',
        description: 'Capturer les petits moments qui comptent vraiment',
        date: 'Été 2024',
        category: 'quotidien',
        year: '2024'
    },
    {
        id: 19,
        src: 'images/image_19.jpeg',
        title: 'Ensemble',
        description: 'La famille réunie pour des moments inoubliables',
        date: 'Automne 2024',
        category: 'quotidien',
        year: '2024'
    },
    {
        id: 20,
        src: 'images/image_20.jpeg',
        title: 'Joie de vivre',
        description: 'Partager le bonheur et la joie de vivre en famille',
        date: 'Été 2024',
        category: 'quotidien',
        year: '2024'
    }
];

// ===== STATE MANAGEMENT =====
let currentView = 'grid';
let currentPhotoIndex = 0;
let filteredPhotos = [...photos];
let activeFilters = {
    category: ['all'],
    year: ['2024'],
    search: ''
};

// ===== DOM ELEMENTS =====
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const photoGrid = document.getElementById('photoGrid');
const photoModal = document.getElementById('photoModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalDate = document.getElementById('modalDate');
const modalIndex = document.getElementById('modalIndex');
const filterBtn = document.getElementById('filterBtn');
const filterPanel = document.getElementById('filterPanel');
const searchInput = document.getElementById('searchInput');
const photoCount = document.getElementById('photoCount');
const loadingSpinner = document.getElementById('loadingSpinner');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    renderPhotos();
    updatePhotoCount();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Sidebar toggle
    sidebarToggle?.addEventListener('click', toggleSidebar);
    mobileMenuToggle?.addEventListener('click', toggleSidebar);

    // View controls
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => changeView(btn.dataset.view));
    });

    // Navigation items
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });

    // Filter button
    filterBtn?.addEventListener('click', toggleFilterPanel);

    // Filter options
    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.addEventListener('change', handleFilterChange);
    });

    document.querySelectorAll('input[name="year"]').forEach(input => {
        input.addEventListener('change', handleFilterChange);
    });

    // Search
    searchInput?.addEventListener('input', handleSearch);

    // Modal controls
    modalClose?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', closeModal);
    modalPrev?.addEventListener('click', showPreviousPhoto);
    modalNext?.addEventListener('click', showNextPhoto);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyPress);

    // Click outside sidebar on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !mobileMenuToggle?.contains(e.target)) {
                closeSidebar();
            }
        }
    });
}

// ===== SIDEBAR FUNCTIONS =====
function toggleSidebar() {
    sidebar.classList.toggle('active');
}

function closeSidebar() {
    sidebar.classList.remove('active');
}

// ===== NAVIGATION =====
function navigateToPage(page) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to clicked items
    document.querySelectorAll(`[data-page="${page}"]`).forEach(item => {
        item.classList.add('active');
    });

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        closeSidebar();
    }

    // Show notification for non-gallery pages
    if (page !== 'gallery') {
        showNotification(`Navigation vers ${getPageName(page)}...`);
    }
}

function getPageName(page) {
    const names = {
        home: 'Accueil',
        albums: 'Mes Albums',
        gallery: 'Galerie Photos',
        upload: 'Télécharger',
        settings: 'Paramètres'
    };
    return names[page] || page;
}

// ===== VIEW CONTROLS =====
function changeView(view) {
    currentView = view;

    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update grid class
    if (view === 'masonry') {
        photoGrid.classList.add('masonry');
    } else {
        photoGrid.classList.remove('masonry');
    }
}

// ===== FILTER FUNCTIONS =====
function toggleFilterPanel() {
    filterPanel.classList.toggle('active');
}

function handleFilterChange(e) {
    const filterType = e.target.name;
    const value = e.target.value;
    const isChecked = e.target.checked;

    if (value === 'all') {
        // If "all" is checked, uncheck others
        if (isChecked) {
            activeFilters[filterType] = ['all'];
            document.querySelectorAll(`input[name="${filterType}"]`).forEach(input => {
                if (input.value !== 'all') {
                    input.checked = false;
                }
            });
        }
    } else {
        // Uncheck "all" if other option is checked
        const allCheckbox = document.querySelector(`input[name="${filterType}"][value="all"]`);
        if (allCheckbox) {
            allCheckbox.checked = false;
        }

        if (isChecked) {
            activeFilters[filterType] = activeFilters[filterType].filter(v => v !== 'all');
            if (!activeFilters[filterType].includes(value)) {
                activeFilters[filterType].push(value);
            }
        } else {
            activeFilters[filterType] = activeFilters[filterType].filter(v => v !== value);
            // If nothing is checked, check "all"
            if (activeFilters[filterType].length === 0) {
                activeFilters[filterType] = ['all'];
                if (allCheckbox) {
                    allCheckbox.checked = true;
                }
            }
        }
    }

    applyFilters();
}

function handleSearch(e) {
    activeFilters.search = e.target.value.toLowerCase();
    applyFilters();
}

function applyFilters() {
    filteredPhotos = photos.filter(photo => {
        // Category filter
        const categoryMatch = activeFilters.category.includes('all') || 
                            activeFilters.category.includes(photo.category);

        // Year filter
        const yearMatch = activeFilters.year.includes(photo.year);

        // Search filter
        const searchMatch = activeFilters.search === '' ||
                          photo.title.toLowerCase().includes(activeFilters.search) ||
                          photo.description.toLowerCase().includes(activeFilters.search);

        return categoryMatch && yearMatch && searchMatch;
    });

    renderPhotos();
    updatePhotoCount();
}

// ===== PHOTO RENDERING =====
function renderPhotos() {
    // Show loading
    loadingSpinner.classList.add('active');
    photoGrid.innerHTML = '';

    // Simulate loading delay for smooth transition
    setTimeout(() => {
        photoGrid.innerHTML = '';

        if (filteredPhotos.length === 0) {
            photoGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 48px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px; color: var(--color-muted-foreground);">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.3-4.3"/>
                    </svg>
                    <h3 style="font-size: 20px; margin-bottom: 8px;">Aucune photo trouvée</h3>
                    <p style="color: var(--color-muted-foreground);">Essayez de modifier vos filtres ou votre recherche</p>
                </div>
            `;
        } else {
            filteredPhotos.forEach((photo, index) => {
                const photoCard = createPhotoCard(photo, index);
                photoGrid.appendChild(photoCard);
            });
        }

        loadingSpinner.classList.remove('active');
    }, 300);
}

function createPhotoCard(photo, index) {
    const card = document.createElement('div');
    card.className = 'photo-card fade-in';
    card.style.animationDelay = `${index * 0.05}s`;

    card.innerHTML = `
        <img src="${photo.src}" alt="${photo.title}" class="photo-card-image" loading="lazy">
        <div class="photo-card-overlay">
            <div class="photo-card-title">${photo.title}</div>
            <div class="photo-card-date">${photo.date}</div>
        </div>
        <div class="photo-card-actions">
            <button class="photo-action-btn" onclick="event.stopPropagation(); sharePhoto(${photo.id})" title="Partager">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" x2="12" y1="2" y2="15"/>
                </svg>
            </button>
            <button class="photo-action-btn" onclick="event.stopPropagation(); likePhoto(${photo.id})" title="J'aime">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
            </button>
        </div>
    `;

    card.addEventListener('click', () => openModal(index));

    return card;
}

function updatePhotoCount() {
    const count = filteredPhotos.length;
    photoCount.textContent = `${count} photo${count > 1 ? 's' : ''}`;
}

// ===== MODAL FUNCTIONS =====
function openModal(index) {
    currentPhotoIndex = index;
    const photo = filteredPhotos[index];

    modalImage.src = photo.src;
    modalImage.alt = photo.title;
    modalTitle.textContent = photo.title;
    modalDescription.textContent = photo.description;
    modalDate.textContent = photo.date;
    modalIndex.textContent = `${index + 1} / ${filteredPhotos.length}`;

    photoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    photoModal.classList.remove('active');
    document.body.style.overflow = '';
}

function showPreviousPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    updateModalContent();
}

function showNextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % filteredPhotos.length;
    updateModalContent();
}

function updateModalContent() {
    const photo = filteredPhotos[currentPhotoIndex];

    // Add fade effect
    modalImage.style.opacity = '0';
    setTimeout(() => {
        modalImage.src = photo.src;
        modalImage.alt = photo.title;
        modalTitle.textContent = photo.title;
        modalDescription.textContent = photo.description;
        modalDate.textContent = photo.date;
        modalIndex.textContent = `${currentPhotoIndex + 1} / ${filteredPhotos.length}`;
        modalImage.style.opacity = '1';
    }, 150);
}

// ===== KEYBOARD NAVIGATION =====
function handleKeyPress(e) {
    if (!photoModal.classList.contains('active')) return;

    switch(e.key) {
        case 'Escape':
            closeModal();
            break;
        case 'ArrowLeft':
            showPreviousPhoto();
            break;
        case 'ArrowRight':
            showNextPhoto();
            break;
    }
}

// ===== PHOTO ACTIONS =====
function sharePhoto(photoId) {
    const photo = photos.find(p => p.id === photoId);
    showNotification(`Partage de "${photo.title}"...`);
}

function likePhoto(photoId) {
    const photo = photos.find(p => p.id === photoId);
    showNotification(`❤️ Vous aimez "${photo.title}"`);
}

// ===== NOTIFICATIONS =====
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        background-color: var(--color-card);
        color: var(--color-foreground);
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--color-border);
        z-index: 2000;
        animation: slideIn 0.3s ease;
        max-width: 320px;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 3000);
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===== LAZY LOADING IMAGES =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    // Observe images when they're added to the DOM
    const observeImages = () => {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    };

    // Initial observation
    observeImages();

    // Re-observe when photos are re-rendered
    const originalRenderPhotos = renderPhotos;
    renderPhotos = function() {
        originalRenderPhotos();
        setTimeout(observeImages, 100);
    };
}
