/**
 * Clase para gestionar la navegación entre pestañas
 */
class NavigationManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 0;
        this.dataPopulated = false;
    }
    
    init() {
        this.tabs = document.querySelectorAll('.tab-button');
        this.sections = document.querySelectorAll('.form-section');
        this.totalSteps = this.tabs.length;
        
        // Botones de navegación
        this.nextBtn = document.getElementById('next-step-btn');
        this.prevBtn = document.getElementById('prev-step-btn');
        this.createBtn = document.getElementById('create-character-btn');
        this.saveDraftBtn = document.getElementById('save-draft-btn');
        
        // Elementos de progreso
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        this.setupNavigation();
        this.setupFormSubmission();
        this.setupErrorClearingListeners();
        
        // Escuchar eventos de cambio de tipo de juego
        document.addEventListener('gameTypeSelected', () => {
            // Actualizar el estado de los botones después de seleccionar un tipo de juego
            this.updateButtonStates();
            // Limpiar error si existe
            this.clearError('game-type-error');
        });
    }
    
    setupNavigation() {
        // Configurar navegación con botones siguiente y anterior
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.goToNextStep();
            });
        }
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.goToPreviousStep();
            });
        }
        
        // Configurar navegación directa haciendo clic en las pestañas
        this.tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.goToStep(index + 1);
            });
        });
    }
    
    goToStep(stepNumber) {
        // Validar solo si estamos en el último paso y queremos crear el personaje
        if (stepNumber < 1 || stepNumber > this.totalSteps) return;
        
        // Si estamos avanzando al segundo paso por primera vez, solo validar que se haya seleccionado un tipo de juego
        if (stepNumber > 1 && this.currentStep === 1) {
            // Si no se ha seleccionado un tipo de juego, mostrar error
            if (!window.gameTypeSelector?.isGameTypeSelected()) {
                window.gameTypeSelector?.showGameTypeError();
                return;
            }
            
            this.dataPopulated = true;
        }
        
        // Actualizar UI
        this.currentStep = stepNumber;
        
        // Actualizar pestañas activas
        this.tabs.forEach((tab, idx) => {
            if (idx + 1 === this.currentStep) {
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
            } else {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            }
        });
        
        // Actualizar secciones visibles
        this.sections.forEach((section, idx) => {
            if (idx + 1 === this.currentStep) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        
        // Actualizar progreso
        if (this.progressFill) {
            const progressPercent = (this.currentStep / this.totalSteps) * 100;
            this.progressFill.style.width = `${progressPercent}%`;
        }
        
        if (this.progressText) {
            this.progressText.textContent = `Paso ${this.currentStep} de ${this.totalSteps}`;
        }
        
        // Actualizar estado de los botones
        this.updateButtonStates();
    }
    
    goToNextStep() {
        this.goToStep(this.currentStep + 1);
    }
    
    goToPreviousStep() {
        this.goToStep(this.currentStep - 1);
    }
    
    updateButtonStates() {
        // Actualizar botón anterior
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentStep === 1;
        }
        
        // Actualizar botones siguiente y crear
        if (this.nextBtn && this.createBtn) {
            if (this.currentStep === this.totalSteps) {
                this.nextBtn.classList.add('hidden');
                this.createBtn.classList.remove('hidden');
            } else {
                this.nextBtn.classList.remove('hidden');
                this.createBtn.classList.add('hidden');
            }
        }
    }
    
    // Método para configurar los listeners que limpian los mensajes de error
    setupErrorClearingListeners() {
        // Limpiar errores en campos de entrada de texto cuando el usuario escribe
        const nameInput = document.getElementById('character-name');
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                this.clearError('name-error');
                nameInput.classList.remove('error');
            });
        }
        
        // Limpiar errores en selects cuando cambia el valor
        const raceSelect = document.getElementById('race');
        if (raceSelect) {
            raceSelect.addEventListener('change', () => {
                this.clearError('race-error');
                raceSelect.classList.remove('error');
            });
        }
        
        const classSelect = document.getElementById('character-class');
        if (classSelect) {
            classSelect.addEventListener('change', () => {
                this.clearError('class-error');
                classSelect.classList.remove('error');
            });
        }
    }
    
    // Método auxiliar para limpiar un mensaje de error
    clearError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('active');
        }
    }
    
    validateForm() {
        // Validar todo el formulario al intentar crear el personaje
        let isValid = true;
        let errors = [];
        
        // Validar selección de tipo de juego (único requisito obligatorio)
        if (!window.gameTypeSelector?.isGameTypeSelected()) {
            window.gameTypeSelector?.showGameTypeError();
            this.goToStep(1); // Ir al paso de selección de tipo de juego
            isValid = false;
            errors.push('Debe seleccionar un tipo de juego');
        }
        
        // Validar límites de equipamiento
        if (window.dataManager) {
            const equipmentValidation = this.validateEquipmentLimits();
            if (!equipmentValidation.isValid) {
                isValid = false;
                errors.push(...equipmentValidation.errors);
            }
            
            // Validar límites de habilidades
            const skillsValidation = this.validateSkillsLimits();
            if (!skillsValidation.isValid) {
                isValid = false;
                errors.push(...skillsValidation.errors);
            }
            
            // Validar límites de idiomas
            const languagesValidation = this.validateLanguagesLimits();
            if (!languagesValidation.isValid) {
                isValid = false;
                errors.push(...languagesValidation.errors);
            }
            
            // Validar límites de competencias
            const proficienciesValidation = this.validateProficienciesLimits();
            if (!proficienciesValidation.isValid) {
                isValid = false;
                errors.push(...proficienciesValidation.errors);
            }
            
            // Validar límites de hechizos
            const spellsValidation = this.validateSpellsLimits();
            if (!spellsValidation.isValid) {
                isValid = false;
                errors.push(...spellsValidation.errors);
            }
        }
        
        // Mostrar errores si los hay
        if (!isValid && errors.length > 0) {
            this.showValidationErrors(errors);
        }
        
        return isValid;
    }
    
    setupFormSubmission() {
        const form = document.getElementById('character-form');
        if (form && this.createBtn) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validar todo el formulario solo cuando se intente enviar
                if (this.validateForm()) {
                    // Si todo está validado, enviar el formulario
                    this.submitForm();
                }
            });
        }
    }
    
    submitForm() {
        // Obtener todos los datos del formulario
        const form = document.getElementById('character-form');
        if (!form) return;
        
        const formData = new FormData(form);
        
        // Obtener personaje de la vista previa
        const character = window.previewManager?.getCharacter();
        
        // Combinar datos del formulario con datos del personaje
        const combinedData = {
            ...Object.fromEntries(formData),
            skills: character?.skills || [],
            equipment: character?.equipment || [],
            spells: character?.spells || []
        };
        
        // Mostrar cargando
        this.showLoading();
        
        // Enviar datos al servidor
        fetch('/api/characters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(combinedData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al crear el personaje');
            }
            return response.json();
        })
        .then((data) => {
            // Redirigir a la página del personaje creado
            window.location.href = `/characters/${data.id}`;
        })
        .catch(error => {
            console.error('Error:', error);
            this.hideLoading();
            this.showError('Error al crear el personaje. Por favor, inténtalo de nuevo.');
        });
    }
    
    showLoading() {
        if (this.createBtn) {
            this.createBtn.disabled = true;
            this.createBtn.classList.add('loading');
            this.createBtn.innerHTML = 'Creando...';
        }
    }
    
    hideLoading() {
        if (this.createBtn) {
            this.createBtn.disabled = false;
            this.createBtn.classList.remove('loading');
            this.createBtn.innerHTML = '✅ Crear Personaje';
        }
    }
    
    showError(message) {
        alert(message);
    }
    
    validateEquipmentLimits() {
        const errors = [];
        let isValid = true;
        
        if (!window.dataManager) return { isValid: true, errors: [] };
        
        const limits = window.dataManager.getEquipmentLimits();
        const selectedStarting = document.querySelectorAll('#starting-equipment-list .equipment-item input[type="checkbox"]:checked').length;
        const selectedAdditional = document.querySelectorAll('#additional-equipment-list .equipment-item input[type="checkbox"]:checked').length;
        
        if (selectedStarting > limits.starting) {
            isValid = false;
            errors.push(`Equipamiento inicial: ${selectedStarting}/${limits.starting} (excede el límite)`);
        }
        
        if (selectedAdditional > limits.additional) {
            isValid = false;
            errors.push(`Equipamiento adicional: ${selectedAdditional}/${limits.additional} (excede el límite)`);
        }
        
        return { isValid, errors };
    }
    
    validateSkillsLimits() {
        const errors = [];
        let isValid = true;
        
        if (!window.dataManager) return { isValid: true, errors: [] };
        
        const limits = window.dataManager.getSkillsLimits();
        const selected = document.querySelectorAll('#skills-list .skill-item input[type="checkbox"]:checked').length;
        
        if (selected > limits) {
            isValid = false;
            errors.push(`Habilidades: ${selected}/${limits} (excede el límite)`);
        }
        
        return { isValid, errors };
    }
    
    validateLanguagesLimits() {
        const errors = [];
        let isValid = true;
        
        if (!window.dataManager) return { isValid: true, errors: [] };
        
        const limits = window.dataManager.getLanguagesLimits();
        const selected = document.querySelectorAll('#languages-list .language-item input[type="checkbox"]:checked').length;
        
        if (selected > limits) {
            isValid = false;
            errors.push(`Idiomas: ${selected}/${limits} (excede el límite)`);
        }
        
        return { isValid, errors };
    }
    
    validateProficienciesLimits() {
        const errors = [];
        let isValid = true;
        
        if (!window.dataManager) return { isValid: true, errors: [] };
        
        const limits = window.dataManager.getProficienciesLimits();
        const selected = document.querySelectorAll('#proficiencies-list .proficiency-item input[type="checkbox"]:checked').length;
        
        if (selected > limits) {
            isValid = false;
            errors.push(`Competencias: ${selected}/${limits} (excede el límite)`);
        }
        
        return { isValid, errors };
    }
    
    validateSpellsLimits() {
        const errors = [];
        let isValid = true;
        
        if (!window.dataManager) return { isValid: true, errors: [] };
        
        const limits = window.dataManager.getSpellsLimits();
        const selected = document.querySelectorAll('#spells-list .spell-item input[type="checkbox"]:checked').length;
        
        if (selected > limits) {
            isValid = false;
            errors.push(`Hechizos: ${selected}/${limits} (excede el límite)`);
        }
        
        return { isValid, errors };
    }
    
    showValidationErrors(errors) {
        let message = 'Se encontraron los siguientes errores de validación:\n\n';
        errors.forEach((error, index) => {
            message += `${index + 1}. ${error}\n`;
        });
        message += '\nPor favor, corrija estos errores antes de crear el personaje.';
        
        alert(message);
    }
}

// Exportar para uso global
window.navigationManager = new NavigationManager();
