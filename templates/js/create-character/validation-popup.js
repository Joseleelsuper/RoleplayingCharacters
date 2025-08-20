/**
 * Clase para gestionar popups de validación amigables
 */
class ValidationPopup {
    constructor() {
        this.overlay = null;
        this.popup = null;
        this.isVisible = false;
        this.validationData = {
            'game-type': {
                step: 1,
                title: 'Tipo de Juego',
                icon: '🎲',
                helpText: 'Selecciona el sistema de juego en la primera pestaña "Tipo de Juego". Esto determinará las reglas y opciones disponibles.'
            },
            'character-name': {
                step: 2,
                title: 'Información Básica',
                icon: '📝',
                helpText: 'Ve a la pestaña "Información Básica" y escribe el nombre de tu personaje en el campo correspondiente.'
            },
            'race': {
                step: 2,
                title: 'Información Básica',
                icon: '🧝',
                helpText: 'Ve a la pestaña "Información Básica" y selecciona una raza del menú desplegable. La raza influye en los atributos y habilidades.'
            },
            'class': {
                step: 2,
                title: 'Información Básica',
                icon: '⚔️',
                helpText: 'Ve a la pestaña "Información Básica" y selecciona una clase del menú desplegable. La clase determina las habilidades y equipamiento inicial.'
            },
            'background': {
                step: 2,
                title: 'Información Básica',
                icon: '📜',
                helpText: 'Ve a la pestaña "Información Básica" y selecciona un trasfondo. El trasfondo proporciona habilidades adicionales y equipamiento.'
            },
            'alignment': {
                step: 2,
                title: 'Información Básica',
                icon: '⚖️',
                helpText: 'Ve a la pestaña "Información Básica" y selecciona un alineamiento que represente la moral y ética de tu personaje.'
            },
            'attributes': {
                step: 3,
                title: 'Atributos',
                icon: '💪',
                helpText: 'Ve a la pestaña "Atributos" y ajusta los valores usando los controles. Los atributos deben estar entre 3 y 18.'
            },
            'skills': {
                step: 4,
                title: 'Habilidades',
                icon: '🎯',
                helpText: 'Ve a la pestaña "Habilidades" y selecciona las habilidades que quieres que tenga tu personaje. Respeta los límites mostrados.'
            },
            'equipment': {
                step: 5,
                title: 'Equipamiento',
                icon: '🎒',
                helpText: 'Ve a la pestaña "Equipamiento" y selecciona el equipo inicial y adicional. Puedes ver los límites en la parte superior de cada sección.'
            },
            'languages': {
                step: 4,
                title: 'Habilidades',
                icon: '🗣️',
                helpText: 'Ve a la pestaña "Habilidades" y selecciona los idiomas que conoce tu personaje en la sección correspondiente.'
            },
            'proficiencies': {
                step: 4,
                title: 'Habilidades',
                icon: '🔧',
                helpText: 'Ve a la pestaña "Habilidades" y selecciona las competencias de tu personaje en la sección correspondiente.'
            },
            'spells': {
                step: 6,
                title: 'Hechizos',
                icon: '✨',
                helpText: 'Ve a la pestaña "Hechizos" y selecciona los hechizos que conoce tu personaje. Solo disponible para ciertas clases.'
            }
        };
    }

    /**
     * Muestra el popup de validación con los errores especificados
     * @param {Array<string>} errors - Lista de mensajes de error
     */
    show(errors) {
        if (this.isVisible) {
            this.hide();
        }

        const processedErrors = this.processErrors(errors);
        this.createPopup(processedErrors);
        this.showPopup();
    }

    /**
     * Procesa los errores para extraer información y clasificarlos
     * @param {Array<string>} errors - Lista de mensajes de error
     * @returns {Array<Object>} Lista de errores procesados
     */
    processErrors(errors) {
        return errors.map((error, index) => {
            const processedError = {
                id: index,
                originalMessage: error,
                message: error,
                type: 'general',
                stepInfo: null,
                helpText: 'Revisa este elemento y asegúrate de completarlo correctamente.',
                icon: '⚠️'
            };

            // Detectar el tipo de error basado en el mensaje
            if (error.includes('tipo de juego') || error.includes('game')) {
                processedError.type = 'game-type';
            } else if (error.includes('nombre') || error.includes('name')) {
                processedError.type = 'character-name';
            } else if (error.includes('raza') || error.includes('race')) {
                processedError.type = 'race';
            } else if (error.includes('clase') || error.includes('class')) {
                processedError.type = 'class';
            } else if (error.includes('trasfondo') || error.includes('background')) {
                processedError.type = 'background';
            } else if (error.includes('alineamiento') || error.includes('alignment')) {
                processedError.type = 'alignment';
            } else if (error.includes('atributo') || error.includes('attribute')) {
                processedError.type = 'attributes';
            } else if (error.includes('Habilidades:') || error.includes('skills')) {
                processedError.type = 'skills';
            } else if (error.includes('Equipamiento') || error.includes('equipment')) {
                processedError.type = 'equipment';
            } else if (error.includes('Idiomas:') || error.includes('language')) {
                processedError.type = 'languages';
            } else if (error.includes('Competencias:') || error.includes('proficienc')) {
                processedError.type = 'proficiencies';
            } else if (error.includes('Hechizos:') || error.includes('spell')) {
                processedError.type = 'spells';
            }

            // Asignar información específica del tipo
            if (this.validationData[processedError.type]) {
                const typeInfo = this.validationData[processedError.type];
                processedError.stepInfo = typeInfo;
                processedError.helpText = typeInfo.helpText;
                processedError.icon = typeInfo.icon;
            }

            return processedError;
        });
    }

    /**
     * Crea el HTML del popup
     * @param {Array<Object>} errors - Lista de errores procesados
     */
    createPopup(errors) {
        // Crear overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'validation-popup-overlay';
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // Crear popup
        this.popup = document.createElement('div');
        this.popup.className = 'validation-popup';

        // Header
        const header = document.createElement('div');
        header.className = 'validation-popup-header';
        header.innerHTML = `
            <span class="icon">❌</span>
            <h3 class="validation-popup-title">Información Incompleta</h3>
        `;

        // Content
        const content = document.createElement('div');
        content.className = 'validation-popup-content';

        const description = document.createElement('p');
        description.className = 'validation-popup-description';
        description.textContent = 'Tu personaje necesita algunos datos adicionales antes de poder ser creado. Haz clic en los pasos sugeridos para completar la información faltante:';

        const errorsList = document.createElement('ul');
        errorsList.className = 'validation-errors-list';

        errors.forEach((error) => {
            const errorItem = this.createErrorItem(error);
            errorsList.appendChild(errorItem);
        });

        content.appendChild(description);
        content.appendChild(errorsList);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'validation-popup-actions';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'validation-popup-btn secondary';
        closeBtn.innerHTML = `
            <span>Cerrar</span>
        `;
        closeBtn.addEventListener('click', () => this.hide());

        const fixBtn = document.createElement('button');
        fixBtn.className = 'validation-popup-btn primary';
        fixBtn.innerHTML = `
            <span>Ir al Primer Error</span>
            <span>👆</span>
        `;
        fixBtn.addEventListener('click', () => {
            const firstError = errors[0];
            this.goToStep(firstError);
            this.hide();
        });

        actions.appendChild(closeBtn);
        actions.appendChild(fixBtn);

        // Ensamblar popup
        this.popup.appendChild(header);
        this.popup.appendChild(content);
        this.popup.appendChild(actions);

        this.overlay.appendChild(this.popup);
        document.body.appendChild(this.overlay);

        // Permitir cerrar con Escape
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    /**
     * Crea un elemento de error individual
     * @param {Object} error - Objeto de error procesado
     * @returns {HTMLElement} Elemento DOM del error
     */
    createErrorItem(error) {
        const errorItem = document.createElement('li');
        errorItem.className = 'validation-error-item';

        const icon = document.createElement('span');
        icon.className = 'validation-error-icon';
        icon.textContent = error.icon;

        const content = document.createElement('div');
        content.className = 'validation-error-content';

        const message = document.createElement('div');
        message.className = 'validation-error-message';
        message.textContent = error.originalMessage;

        const help = document.createElement('div');
        help.className = 'validation-error-help';
        help.textContent = error.helpText;

        content.appendChild(message);
        content.appendChild(help);

        // Botón para ir al paso si tenemos información del paso
        if (error.stepInfo) {
            const stepBtn = document.createElement('div');
            stepBtn.className = 'validation-error-step';
            stepBtn.innerHTML = `
                <span>Ir a ${error.stepInfo.title}</span>
                <span class="step-number">${error.stepInfo.step}</span>
            `;
            stepBtn.addEventListener('click', () => {
                this.goToStep(error);
                this.hide();
            });
            content.appendChild(stepBtn);
        }

        errorItem.appendChild(icon);
        errorItem.appendChild(content);

        return errorItem;
    }

    /**
     * Navega al paso correspondiente del error
     * @param {Object} error - Objeto de error con información del paso
     */
    goToStep(error) {
        if (error.stepInfo && window.navigationManager) {
            window.navigationManager.goToStep(error.stepInfo.step);
            
            // Hacer scroll al elemento específico si es posible
            setTimeout(() => {
                this.scrollToElement(error.type);
            }, 300);
        }
    }

    /**
     * Hace scroll al elemento específico relacionado con el error
     * @param {string} errorType - Tipo de error
     */
    scrollToElement(errorType) {
        let targetElement = null;

        switch (errorType) {
            case 'character-name':
                targetElement = document.getElementById('character-name');
                break;
            case 'race':
                targetElement = document.getElementById('race');
                break;
            case 'class':
                targetElement = document.getElementById('character-class');
                break;
            case 'background':
                targetElement = document.getElementById('background');
                break;
            case 'alignment':
                targetElement = document.getElementById('alignment');
                break;
            case 'attributes':
                targetElement = document.getElementById('strength')?.closest('.attributes-grid');
                break;
            case 'skills':
                targetElement = document.getElementById('skills-list');
                break;
            case 'equipment':
                targetElement = document.getElementById('starting-equipment-list');
                break;
            case 'languages':
                targetElement = document.getElementById('languages-list');
                break;
            case 'proficiencies':
                targetElement = document.getElementById('proficiencies-list');
                break;
            case 'spells':
                targetElement = document.getElementById('spells-list');
                break;
        }

        if (targetElement) {
            targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });

            // Añadir efecto de highlight temporal
            targetElement.style.transition = 'box-shadow 0.3s ease';
            targetElement.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.5)';
            
            setTimeout(() => {
                targetElement.style.boxShadow = '';
            }, 2000);
        }
    }

    /**
     * Muestra el popup con animación
     */
    showPopup() {
        this.isVisible = true;
        // Forzar reflow para que la animación funcione
        this.overlay.offsetHeight;
        this.overlay.classList.add('show');
    }

    /**
     * Oculta el popup
     */
    hide() {
        if (!this.isVisible) return;

        this.overlay.classList.remove('show');
        
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.overlay = null;
            this.popup = null;
            this.isVisible = false;
        }, 300);

        // Limpiar event listener
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }
    }

    /**
     * Método estático para mostrar popup rápidamente
     * @param {Array<string>} errors - Lista de errores
     */
    static show(errors) {
        const popup = new ValidationPopup();
        popup.show(errors);
        return popup;
    }
}

// Exportar para uso global
window.ValidationPopup = ValidationPopup;
