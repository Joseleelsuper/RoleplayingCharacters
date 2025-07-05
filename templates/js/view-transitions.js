/**
 * Sistema de View Transitions para navegación suave entre páginas.
 * Utiliza la View Transitions API para crear transiciones fluidas.
 */

class ViewTransitionsManager {
    constructor() {
        this.init();
    }

    init() {
        // Verificar si el navegador soporta View Transitions
        if (!document.startViewTransition) {
            console.log('View Transitions API no está disponible en este navegador');
            return;
        }

        this.setupNavigationHandlers();
        this.setupLanguageChangeHandlers();
    }

    /**
     * Configura los manejadores para navegación interna
     */
    setupNavigationHandlers() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            
            // Solo manejar enlaces internos
            if (!link || !this.isInternalLink(link)) {
                return;
            }

            // Prevenir navegación por defecto
            event.preventDefault();
            
            // Realizar transición
            this.navigateWithTransition(link.href);
        });
    }

    /**
     * Configura manejadores específicos para cambio de idioma
     */
    setupLanguageChangeHandlers() {
        document.addEventListener('click', (event) => {
            const langLink = event.target.closest('.language-selector a');
            
            if (!langLink) {
                return;
            }

            event.preventDefault();
            this.changeLanguageWithTransition(langLink.href);
        });
    }

    /**
     * Verifica si un enlace es interno al sitio
     */
    isInternalLink(link) {
        return link.hostname === location.hostname && 
               !link.hasAttribute('download') && 
               link.getAttribute('href') !== '#';
    }

    /**
     * Realiza navegación con transición
     */
    async navigateWithTransition(url) {
        if (!document.startViewTransition) {
            // Fallback para navegadores sin soporte
            location.href = url;
            return;
        }

        try {
            const transition = document.startViewTransition(async () => {
                await this.updatePageContent(url);
            });

            await transition.finished;
        } catch (error) {
            console.error('Error en la transición:', error);
            // Fallback en caso de error
            location.href = url;
        }
    }

    /**
     * Cambia idioma con transición suave
     */
    async changeLanguageWithTransition(url) {
        if (!document.startViewTransition) {
            location.href = url;
            return;
        }

        try {
            // Usar una transición más rápida para cambio de idioma
            const transition = document.startViewTransition(async () => {
                await this.updatePageContent(url);
            });

            // Personalizar la transición para cambio de idioma
            document.documentElement.style.setProperty('--vt-duration', '0.3s');
            
            await transition.finished;
            
            // Restaurar duración por defecto
            document.documentElement.style.removeProperty('--vt-duration');
        } catch (error) {
            console.error('Error en transición de idioma:', error);
            location.href = url;
        }
    }

    /**
     * Actualiza el contenido de la página
     */
    async updatePageContent(url) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            const parser = new DOMParser();
            const newDocument = parser.parseFromString(html, 'text/html');

            // Actualizar el título
            document.title = newDocument.title;

            // Actualizar el contenido principal
            const newContainer = newDocument.querySelector('.container');
            const currentContainer = document.querySelector('.container');
            
            if (newContainer && currentContainer) {
                currentContainer.innerHTML = newContainer.innerHTML;
            }

            // Actualizar la URL sin recargar
            history.pushState(null, '', url);

            // Reejecutar scripts si es necesario
            this.reinitializeScripts();

        } catch (error) {
            console.error('Error actualizando contenido:', error);
            throw error;
        }
    }

    /**
     * Reinicializa scripts después de actualizar contenido
     */
    reinitializeScripts() {
        // Aquí se pueden reinicializar componentes específicos
        // Por ejemplo, si hay otros scripts que necesiten ejecutarse
        
        // Reconfigurar manejadores si es necesario
        this.setupLanguageChangeHandlers();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ViewTransitionsManager();
});

// También funcionar con navegación del navegador (atrás/adelante)
window.addEventListener('popstate', () => {
    if (document.startViewTransition) {
        document.startViewTransition(() => {
            location.reload();
        });
    } else {
        location.reload();
    }
});
