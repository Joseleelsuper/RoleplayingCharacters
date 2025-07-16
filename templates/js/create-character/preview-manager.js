/**
 * Clase para gestionar la vista previa del personaje
 */
class PreviewManager {
    constructor() {
        this.character = {
            gameType: '',
            name: '',
            race: '',
            class: '',
            level: 1,
            attributes: {
                str: 8,
                dex: 8,
                con: 8,
                int: 8,
                wis: 8,
                cha: 8
            },
            skills: [],
            equipment: [],
            spells: []
        };
    }
    
    init() {
        // Elementos para mostrar la previsualización
        this.previewElements = {
            gameType: document.getElementById('preview-game-type'),
            name: document.getElementById('preview-name'),
            race: document.getElementById('preview-race'),
            class: document.getElementById('preview-class'),
            level: document.getElementById('preview-level'),
            str: document.getElementById('preview-str'),
            dex: document.getElementById('preview-dex'),
            con: document.getElementById('preview-con'),
            int: document.getElementById('preview-int'),
            wis: document.getElementById('preview-wis'),
            cha: document.getElementById('preview-cha')
        };
        
        // Indicadores de completitud
        this.completionIndicators = {
            basic: document.getElementById('basic-completion'),
            attributes: document.getElementById('attributes-completion'),
            skills: document.getElementById('skills-completion'),
            equipment: document.getElementById('equipment-completion'),
            spells: document.getElementById('spells-completion')
        };
        
        // Escuchar cambios relevantes
        document.addEventListener('gameTypeSelected', (event) => {
            this.character.gameType = event.detail.gameType;
            this.updatePreview();
        });
        
        document.addEventListener('attributeChanged', (event) => {
            const attr = event.detail.attribute;
            const value = event.detail.value;
            
            // Si es un atributo principal, actualizar en el objeto de personaje
            if (['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].includes(attr)) {
                const attrShort = {
                    'strength': 'str',
                    'dexterity': 'dex',
                    'constitution': 'con',
                    'intelligence': 'int',
                    'wisdom': 'wis',
                    'charisma': 'cha'
                }[attr];
                
                this.character.attributes[attrShort] = value;
            } else if (attr === 'level') {
                this.character.level = value;
            }
            
            this.updatePreview();
        });
        
        // Configurar listeners para cambios en los inputs
        this.setupInputListeners();
    }
    
    setupInputListeners() {
        const nameInput = document.getElementById('character-name');
        const raceSelect = document.getElementById('race');
        const classSelect = document.getElementById('character-class');
        
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                this.character.name = nameInput.value;
                this.updatePreview();
                this.checkCompletionStatus();
            });
        }
        
        if (raceSelect) {
            raceSelect.addEventListener('change', () => {
                const selectedOption = raceSelect.options[raceSelect.selectedIndex];
                this.character.race = selectedOption.textContent;
                this.updatePreview();
                this.checkCompletionStatus();
            });
        }
        
        if (classSelect) {
            classSelect.addEventListener('change', () => {
                const selectedOption = classSelect.options[classSelect.selectedIndex];
                this.character.class = selectedOption.textContent;
                this.updatePreview();
                this.checkCompletionStatus();
            });
        }
    }
    
    updatePreview() {
        // Actualizar la información del tipo de juego
        if (this.previewElements.gameType) {
            let gameTypeName = 'No definido';
            if (this.character.gameType) {
                switch (this.character.gameType) {
                    case 'dnd5e':
                        gameTypeName = 'D&D 5e';
                        break;
                    case 'pathfinder':
                        gameTypeName = 'Pathfinder';
                        break;
                    case 'wod':
                        gameTypeName = 'World of Darkness';
                        break;
                    case 'custom':
                        gameTypeName = 'Personalizado';
                        break;
                    default:
                        gameTypeName = this.character.gameType;
                }
            }
            this.previewElements.gameType.textContent = gameTypeName;
        }
        
        // Actualizar información básica
        if (this.previewElements.name) {
            this.previewElements.name.textContent = this.character.name || 'No definido';
        }
        
        if (this.previewElements.race) {
            this.previewElements.race.textContent = this.character.race || 'No definido';
        }
        
        if (this.previewElements.class) {
            this.previewElements.class.textContent = this.character.class || 'No definido';
        }
        
        if (this.previewElements.level) {
            this.previewElements.level.textContent = this.character.level;
        }
        
        // Actualizar atributos
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(attr => {
            const element = this.previewElements[attr];
            if (element) {
                const value = this.character.attributes[attr] || 0;
                const modifier = Math.floor((value - 10) / 2);
                element.textContent = `${value} (${modifier >= 0 ? '+' : ''}${modifier})`;
            }
        });
        
        // Verificar estado de completitud
        this.checkCompletionStatus();
    }
    
    checkCompletionStatus() {
        // Verificar información básica
        const basicComplete = Boolean(
            this.character.gameType &&
            this.character.name && 
            this.character.race && 
            this.character.class
        );
        
        // Verificar atributos
        const attributesComplete = Object.values(this.character.attributes).every(val => val > 0);
        
        // Verificar habilidades (al menos 1 habilidad seleccionada)
        const skillsComplete = this.character.skills.length > 0;
        
        // Verificar equipamiento (al menos 1 pieza de equipo)
        const equipmentComplete = this.character.equipment.length > 0;
        
        // Verificar hechizos (solo si es clase mágica)
        let spellsComplete = true;
        if (this.isMagicClass()) {
            spellsComplete = this.character.spells.length > 0;
        }
        
        // Actualizar indicadores visuales
        if (this.completionIndicators.basic) {
            this.completionIndicators.basic.textContent = basicComplete ? '✅' : '❌';
        }
        
        if (this.completionIndicators.attributes) {
            this.completionIndicators.attributes.textContent = attributesComplete ? '✅' : '❌';
        }
        
        if (this.completionIndicators.skills) {
            this.completionIndicators.skills.textContent = skillsComplete ? '✅' : '❌';
        }
        
        if (this.completionIndicators.equipment) {
            this.completionIndicators.equipment.textContent = equipmentComplete ? '✅' : '❌';
        }
        
        if (this.completionIndicators.spells) {
            this.completionIndicators.spells.textContent = spellsComplete ? '✅' : '❌';
        }
        
        return basicComplete && attributesComplete && skillsComplete && equipmentComplete && spellsComplete;
    }
    
    isMagicClass() {
        // Clases mágicas conocidas
        const magicClasses = [
            'wizard', 'sorcerer', 'warlock', 'cleric', 'druid', 'bard', 'paladin', 'ranger', 'arcane trickster', 'eldritch knight',
            'mago', 'hechicero', 'brujo', 'clérigo', 'druida', 'bardo', 'paladín', 'explorador'
        ];
        
        return magicClasses.some(cls => 
            this.character.class && this.character.class.toLowerCase().includes(cls.toLowerCase())
        );
    }
    
    // Métodos para actualizar el objeto de personaje desde eventos externos
    updateSkills(skills) {
        this.character.skills = skills;
        this.checkCompletionStatus();
    }
    
    updateEquipment(equipment) {
        this.character.equipment = equipment;
        this.checkCompletionStatus();
    }
    
    updateSpells(spells) {
        this.character.spells = spells;
        this.checkCompletionStatus();
    }
    
    // Obtener el objeto de personaje completo
    getCharacter() {
        return { ...this.character };
    }
}

// Exportar para uso global
window.previewManager = new PreviewManager();
