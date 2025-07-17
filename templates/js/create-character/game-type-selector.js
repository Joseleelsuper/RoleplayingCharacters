/**
 * Gestor del tipo de juego para la creación de personajes.
 * 
 * Este módulo se encarga de gestionar la selección del tipo de juego
 * y cargar los datos correspondientes al juego seleccionado.
 */

/**
 * Clase para gestionar la selección del tipo de juego de rol
 */
class GameTypeSelector {
    constructor() {
        this.selectedGameType = '';
        
        // Mapa de sistemas de atributos por tipo de juego
        this.gameTypeAttributeSystemMap = {
            'dnd5e': 'dnd5e',
            'pathfinder': 'pathfinder',
            'wod': 'custom',
            'custom': 'custom'
        };
        
        this.currentGameType = 'custom';
    }
    
    init() {
        this.gameTypeCards = document.querySelectorAll('.game-type-card');
        this.selectedGameTypeInput = document.getElementById('selected-game-type');
        this.customConfig = document.getElementById('custom-attribute-config');
        this.setupGameTypeSelection();
    }
    
    setupGameTypeSelection() {
        if (this.gameTypeCards && this.gameTypeCards.length) {
            this.gameTypeCards.forEach(card => {
                card.addEventListener('click', () => {
                    this.selectGameType(card);
                });
            });
        }
    }
    
    selectGameType(card) {
        // Eliminar selección previa
        this.gameTypeCards.forEach(c => c.classList.remove('selected'));
        
        // Seleccionar la nueva opción
        card.classList.add('selected');
        
        // Guardar el tipo de juego seleccionado
        this.selectedGameType = card.dataset.gameType;
        
        // Actualizar el input oculto
        if (this.selectedGameTypeInput) {
            this.selectedGameTypeInput.value = this.selectedGameType;
        }
        
        // Ya no tenemos selector de tipo de juego
        
        // Mostrar/ocultar configuración personalizada si corresponde
        // Ahora el config está en la sección de atributos, pero sigue funcionando igual
        const customConfig = document.getElementById('custom-attribute-config');
        if (customConfig) {
            const isCustom = this.selectedGameType === 'custom' || this.selectedGameType === 'wod';
            customConfig.style.display = isCustom ? 'block' : 'none';
            
            // Si es personalizado, aplicar valores de configuración inmediatamente
            if (isCustom && window.attributeManager) {
                const customMin = document.getElementById('custom-min');
                const customMax = document.getElementById('custom-max');
                const customPoints = document.getElementById('custom-points');
                
                if (customMin && customMax && customPoints) {
                    window.attributeManager.updateCustomSystem(
                        parseInt(customMin.value),
                        parseInt(customMax.value),
                        parseInt(customPoints.value)
                    );
                }
            }
        }
        
        // Actualizar el sistema de atributos según el juego seleccionado
        if (this.gameTypeAttributeSystemMap[this.selectedGameType]) {
            const attributeSystem = this.gameTypeAttributeSystemMap[this.selectedGameType];
            if (window.attributeManager) {
                window.attributeManager.setAttributeSystem(attributeSystem);
            }
        }
        
        // Ocultar mensaje de error si existe
        const errorElement = document.getElementById('game-type-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('active');
        }
        
        // Actualizar el tipo de juego actual y cargar los datos del juego
        this.currentGameType = this.selectedGameType;
        this.loadGameData();
        
        // Notificar que se ha seleccionado un juego
        document.dispatchEvent(new CustomEvent('gameTypeSelected', { 
            detail: { gameType: this.selectedGameType } 
        }));
        
        // Actualizar la previsualización
        if (window.previewManager) {
            window.previewManager.updatePreview();
        }
    }
    
    getSelectedGameType() {
        return this.selectedGameType;
    }
    
    getGameTypeName(gameType) {
        const type = gameType || this.selectedGameType;
        switch (type) {
            case 'dnd5e': return 'D&D 5e';
            case 'pathfinder': return 'Pathfinder';
            case 'wod': return 'World of Darkness';
            case 'custom': return 'Custom';
            default: return type || 'Not set';
        }
    }
    
    isGameTypeSelected() {
        return !!this.selectedGameType;
    }
    
    showGameTypeError() {
        const errorElement = document.getElementById('game-type-error');
        if (errorElement) {
            errorElement.textContent = 'Por favor, selecciona un tipo de juego para continuar.';
            errorElement.classList.add('active');
        }
    }
    
    // Se eliminó el método loadGameTypes
    
    // Se eliminaron los métodos handleGameTypeChange, updateGameTypeDescription y updateGameTypeCards
    
    /**
     * Carga los datos del juego seleccionado.
     */
    async loadGameData() {
        try {
            // Mostrar indicador de carga
            document.body.classList.add('loading');
            
            // Hacer la petición a la API para obtener los datos del juego
            const response = await fetch(`/api/game-data?game_type=${this.currentGameType}`);
            if (!response.ok) {
                throw new Error(`Error al cargar los datos del juego: ${response.statusText}`);
            }
            
            const gameData = await response.json();
            
            // Actualizar los selectores del formulario con los nuevos datos
            this.updateFormSelects(gameData);
            
            // Notificar a otros módulos que se han cargado nuevos datos de juego
            document.dispatchEvent(new CustomEvent('gameDataLoaded', {
                detail: {
                    gameType: this.currentGameType,
                    gameData: gameData
                }
            }));
            
        } catch (error) {
            console.error('Error al cargar los datos del juego:', error);
        } finally {
            // Ocultar indicador de carga
            document.body.classList.remove('loading');
        }
    }
    
    /**
     * Actualiza los selectores del formulario con los datos del juego.
     * 
     * @param {Object} gameData - Datos del juego cargados
     */
    updateFormSelects(gameData) {
        // Actualizar selector de razas
        this.updateSelect('race', gameData.races);
        
        // Actualizar selector de clases
        this.updateSelect('class', gameData.classes);
        
        // Actualizar selector de trasfondos
        this.updateSelect('background', gameData.backgrounds);
        
        // Actualizar selector de alineamientos
        this.updateSelect('alignment', gameData.alignments);
    }
    
    /**
     * Actualiza un selector con los datos proporcionados.
     * 
     * @param {string} selectId - ID del selector a actualizar
     * @param {Array} items - Elementos para añadir al selector
     */
    updateSelect(selectId, items) {
        const select = document.getElementById(selectId);
        if (select) {
            // Guardar el valor seleccionado actual
            const currentValue = select.value;
            
            // Limpiar opciones existentes
            select.innerHTML = '';
            
            // Añadir opción vacía
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '-- Selecciona --';
            select.appendChild(emptyOption);
            
            // Añadir las nuevas opciones
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.name;
                option.dataset.description = item.description || '';
                select.appendChild(option);
            });
            
            // Intentar restaurar el valor seleccionado
            if (currentValue) {
                // Buscar una opción con el mismo valor
                const matchingOption = Array.from(select.options)
                    .find(option => option.value === currentValue);
                
                if (matchingOption) {
                    select.value = currentValue;
                }
            }
            
            // Disparar evento de cambio para actualizar descripciones, etc.
            select.dispatchEvent(new Event('change'));
        }
    }
}

// Exportar para uso global
window.gameTypeSelector = new GameTypeSelector();
