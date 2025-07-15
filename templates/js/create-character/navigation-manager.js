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
        
        // Escuchar eventos de cambio de tipo de juego
        document.addEventListener('gameTypeSelected', () => {
            // Actualizar el estado de los botones después de seleccionar un tipo de juego
            this.updateButtonStates();
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
        // Validar paso actual antes de avanzar
        if (stepNumber > this.currentStep && !this.validateCurrentStep()) {
            return;
        }
        
        if (stepNumber < 1 || stepNumber > this.totalSteps) return;
        
        // Si estamos avanzando al segundo paso por primera vez, cargar datos filtrados
        if (stepNumber === 2 && this.currentStep === 1 && !this.dataPopulated) {
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
    
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1: // Validar selección de tipo de juego
                if (!window.gameTypeSelector?.isGameTypeSelected()) {
                    window.gameTypeSelector?.showGameTypeError();
                    return false;
                }
                return true;
                
            case 2: // Validar información básica
                // Validar nombre del personaje
                const nameInput = document.getElementById('character-name');
                const nameError = document.getElementById('name-error');
                
                if (!nameInput?.value) {
                    if (nameError) {
                        nameError.textContent = 'Por favor, introduce un nombre para tu personaje.';
                        nameError.classList.add('active');
                        nameInput.classList.add('error');
                    }
                    return false;
                }
                
                // Validar raza
                const raceSelect = document.getElementById('race');
                const raceError = document.getElementById('race-error');
                
                if (!raceSelect?.value) {
                    if (raceError) {
                        raceError.textContent = 'Por favor, selecciona una raza para tu personaje.';
                        raceError.classList.add('active');
                        raceSelect.classList.add('error');
                    }
                    return false;
                }
                
                // Validar clase
                const classSelect = document.getElementById('character-class');
                const classError = document.getElementById('class-error');
                
                if (!classSelect?.value) {
                    if (classError) {
                        classError.textContent = 'Por favor, selecciona una clase para tu personaje.';
                        classError.classList.add('active');
                        classSelect.classList.add('error');
                    }
                    return false;
                }
                
                return true;
                
            default:
                return true;
        }
    }
    
    setupFormSubmission() {
        const form = document.getElementById('character-form');
        if (form && this.createBtn) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validar todos los pasos
                for (let step = 1; step <= this.totalSteps; step++) {
                    this.currentStep = step;
                    if (!this.validateCurrentStep()) {
                        this.goToStep(step);
                        return;
                    }
                }
                
                // Si todo está validado, enviar el formulario
                this.submitForm();
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
        .then(data => {
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
}

// Exportar para uso global
window.navigationManager = new NavigationManager();
