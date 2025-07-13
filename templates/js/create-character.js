/**
 * JavaScript para la página de creación de personajes
 * Maneja la navegación por pestañas, validación de formularios y actualizaciones en tiempo real
 */

class CharacterCreator {
    constructor() {
        this.currentTab = 0;
        this.tabs = document.querySelectorAll('.tab-button');
        this.panels = document.querySelectorAll('[role="tabpanel"]');
        this.form = document.getElementById('character-form');
        this.characterData = {};
        
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupFormHandlers();
        this.setupAttributeCalculators();
        this.loadInitialData();
        this.setupPreviewUpdates();
        this.setupFormValidation();
    }

    /**
     * Configura la navegación por pestañas con accesibilidad
     */
    setupTabNavigation() {
        this.tabs.forEach((tab, index) => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(index);
            });

            // Navegación con teclado
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const direction = e.key === 'ArrowLeft' ? -1 : 1;
                    const newIndex = (index + direction + this.tabs.length) % this.tabs.length;
                    this.switchTab(newIndex);
                    this.tabs[newIndex].focus();
                }
            });
        });
    }

    /**
     * Cambia a una pestaña específica
     */
    switchTab(index) {
        // Remover estado activo de todas las pestañas
        this.tabs.forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
            tab.setAttribute('aria-selected', i === index);
        });

        // Mostrar/ocultar paneles
        this.panels.forEach((panel, i) => {
            panel.classList.toggle('hidden', i !== index);
        });

        this.currentTab = index;
    }

    /**
     * Configura los manejadores del formulario
     */
    setupFormHandlers() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Botones de acción
        document.getElementById('save-draft-btn').addEventListener('click', () => {
            this.saveDraft();
        });

        document.getElementById('preview-character-btn').addEventListener('click', () => {
            this.previewCharacter();
        });
    }

    /**
     * Configura los calculadores de modificadores de atributos
     */
    setupAttributeCalculators() {
        const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        attributes.forEach(attr => {
            const input = document.getElementById(attr);
            const modifier = document.getElementById(`${attr}-modifier`);
            
            if (input && modifier) {
                input.addEventListener('input', () => {
                    const value = parseInt(input.value) || 10;
                    const mod = Math.floor((value - 10) / 2);
                    modifier.textContent = mod >= 0 ? `+${mod}` : `${mod}`;
                });
            }
        });
    }

    /**
     * Carga los datos iniciales desde las APIs
     */
    async loadInitialData() {
        try {
            const [races, classes, backgrounds, alignments, skills, languages, proficiencies] = await Promise.all([
                this.fetchData('/api/races'),
                this.fetchData('/api/classes'),
                this.fetchData('/api/backgrounds'),
                this.fetchData('/api/alignments'),
                this.fetchData('/api/skills'),
                this.fetchData('/api/languages'),
                this.fetchData('/api/proficiencies')
            ]);

            this.populateSelect('race', races);
            this.populateSelect('character-class', classes);
            this.populateSelect('background', backgrounds);
            this.populateSelect('alignment', alignments);
            this.populateSkills(skills);
            this.populateLanguages(languages);
            this.populateProficiencies(proficiencies);
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load character options. Please refresh the page.');
        }
    }

    /**
     * Realiza una petición a la API
     */
    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Rellena un elemento select con opciones
     */
    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.id;
            optionElement.textContent = option.name;
            optionElement.title = option.description || option.name;
            select.appendChild(optionElement);
        });
    }

    /**
     * Rellena el contenedor de habilidades
     */
    populateSkills(skills) {
        const container = document.getElementById('skills-container');
        if (!container) return;

        skills.forEach(skill => {
            const div = document.createElement('div');
            div.className = 'form-group-enhanced';
            div.innerHTML = `
                <label class="form-label-enhanced">
                    <input type="checkbox" name="skills[]" value="${skill.id}" class="mr-sm">
                    ${skill.name}
                    ${skill.description ? `<small class="text-muted">${skill.description}</small>` : ''}
                </label>
            `;
            container.appendChild(div);
        });
    }

    /**
     * Rellena el contenedor de idiomas
     */
    populateLanguages(languages) {
        const container = document.getElementById('languages-container');
        if (!container) return;

        languages.forEach(language => {
            const div = document.createElement('div');
            div.className = 'form-group-enhanced';
            div.innerHTML = `
                <label class="form-label-enhanced">
                    <input type="checkbox" name="languages[]" value="${language.id}" class="mr-sm">
                    ${language.name}
                </label>
            `;
            container.appendChild(div);
        });
    }

    /**
     * Rellena el contenedor de competencias
     */
    populateProficiencies(proficiencies) {
        const container = document.getElementById('proficiencies-container');
        if (!container) return;

        proficiencies.forEach(proficiency => {
            const div = document.createElement('div');
            div.className = 'form-group-enhanced';
            div.innerHTML = `
                <label class="form-label-enhanced">
                    <input type="checkbox" name="proficiencies[]" value="${proficiency.id}" class="mr-sm">
                    ${proficiency.name}
                </label>
            `;
            container.appendChild(div);
        });
    }

    /**
     * Configura las actualizaciones en tiempo real de la vista previa
     */
    setupPreviewUpdates() {
        // Nombre del personaje
        const nameInput = document.getElementById('character-name');
        const previewName = document.getElementById('preview-name');
        
        nameInput.addEventListener('input', () => {
            previewName.textContent = nameInput.value || 'Unnamed Character';
        });

        // Raza
        const raceSelect = document.getElementById('race');
        const previewRace = document.getElementById('preview-race');
        
        raceSelect.addEventListener('change', () => {
            const selectedOption = raceSelect.options[raceSelect.selectedIndex];
            previewRace.textContent = selectedOption.value === '' ? 'Not selected' : selectedOption.text;
        });

        // Clase
        const classSelect = document.getElementById('character-class');
        const previewClass = document.getElementById('preview-class');
        
        classSelect.addEventListener('change', () => {
            const selectedOption = classSelect.options[classSelect.selectedIndex];
            previewClass.textContent = selectedOption.text === 'Select a class' ? 'Not selected' : selectedOption.text;
        });

        // Background
        const backgroundSelect = document.getElementById('background');
        const previewBackground = document.getElementById('preview-background');
        
        backgroundSelect.addEventListener('change', () => {
            const selectedOption = backgroundSelect.options[backgroundSelect.selectedIndex];
            previewBackground.textContent = selectedOption.text === 'Select a background' ? 'Not selected' : selectedOption.text;
        });

        // Nivel
        const levelInput = document.getElementById('level');
        const previewLevel = document.getElementById('preview-level');
        
        levelInput.addEventListener('input', () => {
            previewLevel.textContent = levelInput.value || '1';
        });
    }

    /**
     * Configura la validación del formulario
     */
    setupFormValidation() {
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
        });
    }

    /**
     * Valida un campo individual
     */
    validateField(field) {
        const isValid = field.checkValidity();
        field.classList.toggle('error', !isValid);
        
        // Remover mensaje de error existente
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Añadir mensaje de error si es necesario
        if (!isValid) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = field.validationMessage;
            field.parentNode.appendChild(errorMessage);
        }
    }

    /**
     * Maneja el envío del formulario
     */
    async handleFormSubmit() {
        if (!this.validateForm()) {
            return;
        }

        const formData = new FormData(this.form);
        const characterData = this.serializeFormData(formData);

        try {
            this.setLoading(true);
            
            const response = await fetch('/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(characterData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.showSuccess('Character created successfully!');
            
            // Redireccionar al personaje creado
            setTimeout(() => {
                window.location.href = `/characters/${result.id}`;
            }, 1000);

        } catch (error) {
            console.error('Error creating character:', error);
            this.showError('Failed to create character. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Valida todo el formulario
     */
    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.checkValidity()) {
                this.validateField(field);
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Serializa los datos del formulario
     */
    serializeFormData(formData) {
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (key.endsWith('[]')) {
                const arrayKey = key.slice(0, -2);
                if (!data[arrayKey]) {
                    data[arrayKey] = [];
                }
                data[arrayKey].push(value);
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    /**
     * Guarda un borrador del personaje
     */
    async saveDraft() {
        const formData = new FormData(this.form);
        const characterData = this.serializeFormData(formData);
        
        try {
            localStorage.setItem('character-draft', JSON.stringify(characterData));
            this.showSuccess('Draft saved successfully!');
        } catch (error) {
            console.error('Error saving draft:', error);
            this.showError('Failed to save draft.');
        }
    }

    /**
     * Carga un borrador guardado
     */
    loadDraft() {
        try {
            const draft = localStorage.getItem('character-draft');
            if (draft) {
                const data = JSON.parse(draft);
                this.populateForm(data);
                this.showSuccess('Draft loaded successfully!');
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }

    /**
     * Rellena el formulario con datos
     */
    populateForm(data) {
        Object.entries(data).forEach(([key, value]) => {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = value;
                } else {
                    field.value = value;
                }
            }
        });
    }

    /**
     * Muestra la vista previa del personaje
     */
    previewCharacter() {
        // Aquí se podría abrir un modal o navegar a una página de vista previa
        console.log('Preview character functionality');
    }

    /**
     * Establece el estado de carga
     */
    setLoading(isLoading) {
        const form = document.getElementById('character-form');
        const buttons = document.querySelectorAll('.form-actions .btn');
        
        form.classList.toggle('loading', isLoading);
        buttons.forEach(btn => {
            btn.disabled = isLoading;
        });
    }

    /**
     * Muestra un mensaje de éxito
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Muestra un mensaje de error
     */
    showError(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Muestra un mensaje
     */
    showMessage(message, type) {
        // Remover mensajes existentes
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Crear nuevo mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background-color: ${type === 'success' ? 'var(--success-500)' : 'var(--error-500)'};
        `;

        document.body.appendChild(messageDiv);

        // Remover después de 5 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CharacterCreator();
});

// Añadir estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .error {
        border-color: var(--error-500) !important;
        box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1) !important;
    }
    
    .error-message {
        color: var(--error-600);
        font-size: var(--font-size-xs);
        margin-top: var(--spacing-xs);
    }
    
    .mr-sm {
        margin-right: var(--spacing-sm);
    }
`;
document.head.appendChild(style);