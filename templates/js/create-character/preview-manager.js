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
        const raceInput = document.getElementById('race');
        const classInput = document.getElementById('character-class');
        const backgroundInput = document.getElementById('background');
        const alignmentInput = document.getElementById('alignment');
        
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                this.character.name = nameInput.value;
                this.updatePreview();
                this.checkCompletionStatus();
            });
        }
        
        // Escuchar cambios en los campos ocultos
        if (raceInput) {
            raceInput.addEventListener('change', () => {
                this.character.race = this.getOptionName('races', raceInput.value);
                this.updatePreview();
                this.checkCompletionStatus();
            });
        }
        
        if (classInput) {
            classInput.addEventListener('change', () => {
                this.character.class = this.getOptionName('classes', classInput.value);
                this.updatePreview();
                this.checkCompletionStatus();
            });
        }
        
        if (backgroundInput) {
            backgroundInput.addEventListener('change', () => {
                this.character.background = this.getOptionName('backgrounds', backgroundInput.value);
                this.updatePreview();
                this.checkCompletionStatus();
            });
        }
        
        if (alignmentInput) {
            alignmentInput.addEventListener('change', () => {
                this.character.alignment = this.getOptionName('alignments', alignmentInput.value);
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
    
    getOptionName(dataType, optionId) {
        if ((!optionId && optionId !== 0) || !window.dataManager || !window.dataManager.allData) {
            return 'No definido';
        }
        
        const data = window.dataManager.allData[dataType];
        if (!data) return 'No definido';
        const optionIdStr = String(optionId);
        const option = data.find(item => String(item.id ?? item.index) === optionIdStr);
        return option ? option.name : 'No definido';
    }
    
    // Obtener el objeto de personaje completo
    getCharacter() {
        return { ...this.character };
    }
}

// Exportar para uso global
window.previewManager = new PreviewManager();
