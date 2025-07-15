/**
 * Componente de atributo configurable para personajes.
 * Permite crear elementos de atributos con distintas configuraciones.
 */
class AttributeComponent {
    /**
     * Crea un nuevo componente de atributo.
     * @param {Object} config - Configuración del atributo
     * @param {string} config.id - ID del atributo
     * @param {string} config.name - Nombre mostrado del atributo
     * @param {string} config.modifierType - Tipo de modificador ('attribute', 'proficiency', 'level', 'custom')
     * @param {Function} config.customModifierCalc - Función personalizada para calcular el modificador
     * @param {number} config.defaultValue - Valor por defecto
     * @param {number} config.minValue - Valor mínimo permitido
     * @param {number} config.maxValue - Valor máximo permitido
     * @param {boolean} config.showDescription - Si se debe mostrar la descripción
     * @param {string} config.description - Texto de la descripción
     * @param {boolean} config.showModifier - Si se debe mostrar el modificador
     * @param {boolean} config.showError - Si se debe mostrar el área de error
     * @param {boolean} config.isRequired - Si el campo es requerido
     * @param {boolean} config.isReadOnly - Si el campo es de solo lectura
     */
    constructor(config) {
        this.config = {
            id: config.id || 'attribute',
            name: config.name || 'Attribute',
            modifierType: config.modifierType || 'attribute',
            customModifierCalc: config.customModifierCalc || null,
            defaultValue: config.defaultValue || 8,
            minValue: config.minValue || 0,
            maxValue: config.maxValue || 20,
            showDescription: config.showDescription !== undefined ? config.showDescription : true,
            description: config.description || 'Attribute description',
            showModifier: config.showModifier !== undefined ? config.showModifier : true,
            showError: config.showError !== undefined ? config.showError : false,
            isRequired: config.isRequired !== undefined ? config.isRequired : false,
            isReadOnly: config.isReadOnly !== undefined ? config.isReadOnly : false
        };
    }

    /**
     * Genera el HTML del componente.
     * @returns {string} HTML del componente
     */
    render() {
        const requiredMark = this.config.isRequired ? ' *' : '';
        const readOnlyAttr = this.config.isReadOnly ? ' readonly' : '';
        
        let html = `
        <div class="attribute-item" id="${this.config.id}-container">
            <label for="${this.config.id}" class="attribute-label">
                ${this.config.name}${requiredMark}
                ${this.config.showDescription ? `<span class="attribute-description">${this.config.description}</span>` : ''}
            </label>
            <div class="attribute-controls">
                <button type="button" class="attribute-btn decrease" data-attribute="${this.config.id}">−</button>
                <input type="number" id="${this.config.id}" name="${this.config.id}" class="attribute-input" 
                       value="${this.config.defaultValue}" min="${this.config.minValue}" max="${this.config.maxValue}" 
                       data-modifier-type="${this.config.modifierType}" data-cost="0"${readOnlyAttr}>
                <button type="button" class="attribute-btn increase" data-attribute="${this.config.id}">+</button>
            </div>
            ${this.config.showModifier ? `<div class="attribute-modifier" id="${this.config.id}-modifier"></div>` : ''}
            ${this.config.showError ? `<div class="form-error" id="${this.config.id}-error" role="alert" aria-live="polite"></div>` : ''}
        </div>`;
        
        return html;
    }

    /**
     * Inserta el componente en el DOM.
     * @param {string} selector - Selector CSS del elemento donde se insertará el componente
     * @param {string} position - Posición de inserción ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
     */
    appendTo(selector, position = 'beforeend') {
        const container = document.querySelector(selector);
        if (container) {
            container.insertAdjacentHTML(position, this.render());
            this.setupListeners();
        }
    }

    /**
     * Configura los listeners del componente.
     */
    setupListeners() {
        const input = document.getElementById(this.config.id);
        const increaseBtn = document.querySelector(`.attribute-btn.increase[data-attribute="${this.config.id}"]`);
        const decreaseBtn = document.querySelector(`.attribute-btn.decrease[data-attribute="${this.config.id}"]`);
        const modifierElement = document.getElementById(`${this.config.id}-modifier`);
        
        if (input && increaseBtn && decreaseBtn) {
            increaseBtn.addEventListener('click', () => {
                let value = parseInt(input.value);
                const max = parseInt(input.getAttribute('max') || 999999);
                
                if (value < max) {
                    input.value = ++value;
                    this.updateModifier(value);
                }
            });
            
            decreaseBtn.addEventListener('click', () => {
                let value = parseInt(input.value);
                const min = parseInt(input.getAttribute('min') || 0);
                
                if (value > min) {
                    input.value = --value;
                    this.updateModifier(value);
                }
            });
            
            // Inicializar el modificador
            this.updateModifier(parseInt(input.value));
        }
    }

    /**
     * Actualiza el valor del modificador basado en el tipo.
     * @param {number} value - Valor actual del atributo
     */
    updateModifier(value) {
        const modifierElement = document.getElementById(`${this.config.id}-modifier`);
        if (!modifierElement || !this.config.showModifier) return;
        
        let modifierText = '';
        
        switch (this.config.modifierType) {
            case 'attribute':
                const modifier = Math.floor((value - 10) / 2);
                modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                break;
            case 'proficiency':
                const profBonus = Math.ceil(value / 4) + 1;
                modifierText = `+${profBonus}`;
                break;
            case 'level':
                const estimatedLevel = Math.min(20, Math.max(1, Math.floor(Math.sqrt(value / 100))));
                modifierText = `Lvl ${estimatedLevel}`;
                break;
            case 'custom':
                if (typeof this.config.customModifierCalc === 'function') {
                    modifierText = this.config.customModifierCalc(value);
                }
                break;
            default:
                modifierText = '';
        }
        
        modifierElement.textContent = modifierText;
    }
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AttributeComponent;
}
