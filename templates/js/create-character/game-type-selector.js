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
        
        // Mostrar/ocultar configuración personalizada si corresponde
        if (this.customConfig) {
            const isCustom = this.selectedGameType === 'custom';
            this.customConfig.style.display = isCustom ? 'block' : 'none';
            
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
}

// Exportar para uso global
window.gameTypeSelector = new GameTypeSelector();
