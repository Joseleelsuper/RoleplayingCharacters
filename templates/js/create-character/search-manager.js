/**
 * Search Manager - Maneja la funcionalidad de búsqueda en las secciones
 * de habilidades, equipamiento y hechizos
 */
class SearchManager {
    constructor() {
        this.searchInputs = {
            skills: document.getElementById('skills-search'),
            languages: document.getElementById('languages-search'),
            proficiencies: document.getElementById('proficiencies-search'),
            startingEquipment: document.getElementById('starting-equipment-search'),
            additionalEquipment: document.getElementById('additional-equipment-search'),
            spells: document.getElementById('spells-search')
        };
        
        this.containers = {
            skills: document.getElementById('skills-list'),
            languages: document.getElementById('languages-list'),
            proficiencies: document.getElementById('proficiencies-list'),
            startingEquipment: document.getElementById('starting-equipment-list'),
            additionalEquipment: document.getElementById('additional-equipment-list'),
            spells: document.getElementById('spells-list')
        };
        
        this.init();
    }
    
    init() {
        // Configurar event listeners para cada input de búsqueda
        Object.keys(this.searchInputs).forEach(key => {
            const input = this.searchInputs[key];
            if (input) {
                input.addEventListener('input', (e) => {
                    this.performSearch(key, e.target.value.toLowerCase().trim());
                });
                
                // Limpiar búsqueda al presionar Escape
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        e.target.value = '';
                        this.performSearch(key, '');
                        e.target.blur();
                    }
                });
            }
        });
    }
    
    /**
     * Realiza la búsqueda en el contenedor especificado
     * @param {string} containerKey - Clave del contenedor
     * @param {string} searchTerm - Término de búsqueda
     */
    performSearch(containerKey, searchTerm) {
        const container = this.containers[containerKey];
        if (!container) return;
        
        const items = this.getSearchableItems(container);
        let visibleCount = 0;
        
        items.forEach(item => {
            const text = this.getItemText(item).toLowerCase();
            const isVisible = searchTerm === '' || text.includes(searchTerm);
            
            if (isVisible) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Mostrar mensaje si no hay resultados
        this.toggleNoResultsMessage(container, visibleCount === 0 && searchTerm !== '');
    }
    
    /**
     * Obtiene los elementos que se pueden buscar en un contenedor
     * @param {HTMLElement} container - Contenedor
     * @returns {NodeList} Lista de elementos
     */
    getSearchableItems(container) {
        // Buscar diferentes tipos de elementos según el contenedor
        const selectors = [
            '.skill-item',
            '.language-item', 
            '.proficiency-item',
            '.equipment-item',
            '.spell-item'
        ];
        
        return container.querySelectorAll(selectors.join(', '));
    }
    
    /**
     * Extrae el texto de búsqueda de un elemento
     * @param {HTMLElement} item - Elemento
     * @returns {string} Texto del elemento
     */
    getItemText(item) {
        // Buscar el texto en diferentes selectores según el tipo de elemento
        const textSelectors = [
            '.skill-name',
            '.language-name',
            '.proficiency-name', 
            '.equipment-name',
            '.spell-name'
        ];
        
        for (const selector of textSelectors) {
            const textElement = item.querySelector(selector);
            if (textElement) {
                return textElement.textContent || textElement.innerText || '';
            }
        }
        
        // Fallback: usar todo el texto del elemento
        return item.textContent || item.innerText || '';
    }
    
    /**
     * Muestra u oculta el mensaje de "sin resultados"
     * @param {HTMLElement} container - Contenedor
     * @param {boolean} show - Si mostrar el mensaje
     */
    toggleNoResultsMessage(container, show) {
        const messageId = `no-results-${container.id}`;
        let message = document.getElementById(messageId);
        
        if (show && !message) {
            // Crear mensaje de sin resultados
            message = document.createElement('div');
            message.id = messageId;
            message.className = 'no-results-message';
            message.innerHTML = `
                <div class="no-results-content">
                    <span class="no-results-icon">🔍</span>
                    <p class="no-results-text">No se encontraron resultados</p>
                    <small class="no-results-hint">Intenta con otros términos de búsqueda</small>
                </div>
            `;
            container.appendChild(message);
        } else if (!show && message) {
            // Remover mensaje
            message.remove();
        }
    }
    
    /**
     * Limpia todas las búsquedas
     */
    clearAllSearches() {
        Object.keys(this.searchInputs).forEach(key => {
            const input = this.searchInputs[key];
            if (input) {
                input.value = '';
                this.performSearch(key, '');
            }
        });
    }
    
    /**
     * Actualiza los contenedores después de que se cargue contenido dinámico
     */
    refreshContainers() {
        // Re-aplicar búsquedas activas después de cargar contenido
        Object.keys(this.searchInputs).forEach(key => {
            const input = this.searchInputs[key];
            if (input && input.value.trim()) {
                this.performSearch(key, input.value.toLowerCase().trim());
            }
        });
    }
}

// Exportar para uso global
window.searchManager = new SearchManager();

// Escuchar cuando se cargan los datos para refrescar las búsquedas
document.addEventListener('dataPopulated', () => {
    if (window.searchManager) {
        window.searchManager.refreshContainers();
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
}