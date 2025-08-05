/**
 * Clase para gestionar la navegación entre pestañas
 */
class NavigationManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 0;
        this.dataPopulated = false;
    }
    
    validateCharacterData(characterData) {
        // Validar campos requeridos
        if (!characterData.name || characterData.name.trim() === '') {
            return 'El nombre del personaje es requerido';
        }
        
        if (!characterData.race_id) {
            return 'Debes seleccionar una raza para tu personaje';
        }
        
        if (!characterData.class_id) {
            return 'Debes seleccionar una clase para tu personaje';
        }
        
        if (!characterData.background_id) {
            return 'Debes seleccionar un trasfondo para tu personaje';
        }
        
        if (!characterData.alignment_id) {
            return 'Debes seleccionar un alineamiento para tu personaje';
        }
        
        if (!characterData.level || characterData.level < 1 || characterData.level > 20) {
            return 'El nivel debe estar entre 1 y 20';
        }
        
        // Validar atributos
        const requiredAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        for (const attr of requiredAttributes) {
            if (!characterData.attributes[attr] || characterData.attributes[attr] < 3 || characterData.attributes[attr] > 18) {
                return `El atributo ${attr} debe estar entre 3 y 18`;
            }
        }
        
        return null; // No hay errores
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
        
        // Estructurar los datos según el esquema esperado por la API
        const characterData = {
            name: formData.get('character_name') || '',
            player_name: formData.get('player_name') || '',
            level: parseInt(formData.get('level')) || 1,
            experience: parseInt(formData.get('experience')) || 0,
            alignment_id: formData.get('alignment_id') ? parseInt(formData.get('alignment_id')) : null,
            race_id: formData.get('race_id') ? parseInt(formData.get('race_id')) : null,
            class_id: formData.get('class_id') ? parseInt(formData.get('class_id')) : null,
            background_id: formData.get('background_id') ? parseInt(formData.get('background_id')) : null,
            is_anonymous: true, // Por defecto, los personajes son anónimos
            
            // Atributos
            attributes: {
                strength: parseInt(formData.get('strength')) || 10,
                dexterity: parseInt(formData.get('dexterity')) || 10,
                constitution: parseInt(formData.get('constitution')) || 10,
                intelligence: parseInt(formData.get('intelligence')) || 10,
                wisdom: parseInt(formData.get('wisdom')) || 10,
                charisma: parseInt(formData.get('charisma')) || 10
            },
            
            // Habilidades seleccionadas
            skills: this.getSelectedSkills(),
            
            // Idiomas seleccionados
            languages: this.getSelectedLanguages(),
            
            // Competencias seleccionadas
            proficiencies: this.getSelectedProficiencies(),
            
            // Equipamiento seleccionado
            items: this.getSelectedItems(),
            
            // Hechizos seleccionados
            spells: this.getSelectedSpells()
        };
        
        // Validar datos antes de enviar
        const validationError = this.validateCharacterData(characterData);
        if (validationError) {
            this.showError(validationError);
            return;
        }
        
        // Mostrar cargando
        this.showLoading();
        
        // Enviar datos al servidor
        fetch('/api/characters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(characterData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    // Manejar diferentes tipos de errores
                    let errorMessage = 'Error al crear el personaje';
                    
                    if (errorData && typeof errorData === 'object') {
                        if (errorData.detail) {
                            errorMessage = errorData.detail;
                        } else if (errorData.message) {
                            errorMessage = errorData.message;
                        } else if (Array.isArray(errorData)) {
                            // Manejar errores de validación de FastAPI
                            errorMessage = errorData.map(err => err.msg || err.message || 'Error de validación').join(', ');
                        }
                    }
                    
                    throw new Error(errorMessage);
                }).catch(jsonError => {
                    // Si no se puede parsear como JSON, usar el status text
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            // Limpiar borrador guardado
            localStorage.removeItem('character-draft');
            
            // Mostrar mensaje de éxito
            this.showSuccess('¡Personaje creado exitosamente!');
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                window.location.href = `/characters/${data.id}`;
            }, 1500);
        })
        .catch(error => {
            console.error('Error:', error);
            this.hideLoading();
            this.showError(error.message || 'Error al crear el personaje. Por favor, inténtalo de nuevo.');
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
        // Implementar mostrar error
        console.error(message);
        
        // Crear o actualizar elemento de error
        let errorElement = document.getElementById('form-error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'form-error-message';
            errorElement.className = 'alert alert-error';
            errorElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f44336;
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 10000;
                max-width: 400px;
                word-wrap: break-word;
            `;
            document.body.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }, 5000);
    }
    
    showSuccess(message) {
        // Crear elemento de éxito
        let successElement = document.getElementById('form-success-message');
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.id = 'form-success-message';
            successElement.className = 'alert alert-success';
            successElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 10000;
                max-width: 400px;
                word-wrap: break-word;
            `;
            document.body.appendChild(successElement);
        }
        
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            if (successElement) {
                successElement.style.display = 'none';
            }
        }, 3000);
    }
    
    getSelectedSkills() {
        const skills = [];
        const skillCheckboxes = document.querySelectorAll('#skills-list input[type="checkbox"]:checked');
        skillCheckboxes.forEach(checkbox => {
            const skillId = parseInt(checkbox.value);
            if (skillId) {
                skills.push({ skill_id: skillId });
            }
        });
        return skills;
    }
    
    getSelectedLanguages() {
        const languages = [];
        const languageCheckboxes = document.querySelectorAll('#languages-list input[type="checkbox"]:checked');
        languageCheckboxes.forEach(checkbox => {
            const languageId = parseInt(checkbox.value);
            if (languageId) {
                languages.push({ language_id: languageId });
            }
        });
        return languages;
    }
    
    getSelectedProficiencies() {
        const proficiencies = [];
        const proficiencyCheckboxes = document.querySelectorAll('#proficiencies-list input[type="checkbox"]:checked');
        proficiencyCheckboxes.forEach(checkbox => {
            const proficiencyId = parseInt(checkbox.value);
            if (proficiencyId) {
                proficiencies.push({ proficiency_id: proficiencyId });
            }
        });
        return proficiencies;
    }
    
    getSelectedItems() {
        const items = [];
        const itemCheckboxes = document.querySelectorAll('#starting-equipment-list input[type="checkbox"]:checked, #additional-equipment-list input[type="checkbox"]:checked');
        itemCheckboxes.forEach(checkbox => {
            const itemId = parseInt(checkbox.value);
            const quantity = parseInt(checkbox.dataset.quantity) || 1;
            if (itemId) {
                items.push({ 
                    item_id: itemId,
                    quantity: quantity
                });
            }
        });
        return items;
    }
    
    getSelectedSpells() {
        const spells = [];
        const spellCheckboxes = document.querySelectorAll('#spells-list input[type="checkbox"]:checked');
        spellCheckboxes.forEach(checkbox => {
            const spellId = parseInt(checkbox.value);
            if (spellId) {
                spells.push({ spell_id: spellId });
            }
        });
        return spells;
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
