/**
 * Clase para gestionar las habilidades y sus límites según las reglas de D&D 5e
 */
class SkillManager {
    constructor() {
        // Configuración de sistemas de habilidades
        this.skillSystems = {
            dnd5e: {
                // En D&D 5e, las habilidades son binarias (proficiencia o no)
                // El número de habilidades depende de la clase y trasfondo
                baseSkillPoints: 2, // Típicamente 2 del trasfondo
                classSkillPoints: {
                    'barbarian': 2,
                    'bard': 3,
                    'cleric': 2,
                    'druid': 2,
                    'fighter': 2,
                    'monk': 2,
                    'paladin': 2,
                    'ranger': 3,
                    'rogue': 4,
                    'sorcerer': 2,
                    'warlock': 2,
                    'wizard': 2
                },
                raceSkillPoints: {
                    'half-elf': 2, // Los medio elfos obtienen 2 habilidades adicionales
                    'variant-human': 1, // Los humanos variantes obtienen 1 habilidad adicional
                    'custom-lineage': 1 // Linaje personalizado obtiene 1 habilidad adicional
                },
                maxSkillsTotal: 18, // Máximo teórico (todas las habilidades)
                name: 'D&D 5e'
            },
            pathfinder: {
                // En Pathfinder 2e, también es binario pero con más flexibilidad
                baseSkillPoints: 2,
                classSkillPoints: {
                    'alchemist': 3,
                    'barbarian': 3,
                    'bard': 6,
                    'champion': 3,
                    'cleric': 3,
                    'druid': 4,
                    'fighter': 3,
                    'monk': 4,
                    'ranger': 5,
                    'rogue': 7,
                    'sorcerer': 3,
                    'wizard': 3
                },
                raceSkillPoints: {},
                maxSkillsTotal: 16,
                name: 'Pathfinder 2e'
            },
            custom: {
                baseSkillPoints: 4,
                classSkillPoints: {},
                raceSkillPoints: {},
                maxSkillsTotal: 20,
                name: 'Custom'
            }
        };
        
        this.currentSystem = 'dnd5e';
        this.selectedSkills = new Set();
        this.maxSkillPoints = 4; // Valor por defecto
    }
    
    init() {
        this.skillPointsElement = document.getElementById('skill-points-remaining');
        this.setupEventListeners();
        
        // Inicializar con valores por defecto
        this.updateMaxSkillPoints();
        
        // Escuchar cuando se cargan los datos para actualizar
        document.addEventListener('dataPopulated', () => {
            setTimeout(() => {
                this.updateMaxSkillPoints();
            }, 100);
        });
    }
    
    setupEventListeners() {
        // Escuchar cambios en la selección de clase
        document.addEventListener('classSelected', (event) => {
            this.updateMaxSkillPoints();
            this.filterSkillsByClass(event.detail.class);
        });
        
        // Escuchar cambios en la selección de raza
        document.addEventListener('raceSelected', (event) => {
            this.updateMaxSkillPoints();
            this.autoSelectLanguages(event.detail.race);
        });
        
        // Escuchar cambios en la selección de trasfondo
        document.addEventListener('backgroundSelected', (event) => {
            this.updateMaxSkillPoints();
        });
        
        // Escuchar toggles de habilidades
        document.addEventListener('skillToggled', (event) => {
            this.handleSkillToggle(event.detail);
        });
        
        // Escuchar cambios en el tipo de juego
        document.addEventListener('gameTypeChanged', (event) => {
            this.currentSystem = event.detail.gameType;
            this.updateMaxSkillPoints();
        });
    }
    
    updateMaxSkillPoints() {
        const system = this.skillSystems[this.currentSystem];
        if (!system) return;
        
        // Verificar si hay una clase seleccionada
        const selectedClass = this.getSelectedClass();
        if (!selectedClass) {
            // Si no hay clase seleccionada, usar solo puntos base
            this.maxSkillPoints = system.baseSkillPoints;
            this.updateSkillPointsDisplay();
            this.updateSkillAvailability();
            return;
        }
        
        let totalPoints = system.baseSkillPoints;
        
        // Obtener puntos de la clase seleccionada
        if (system.classSkillPoints[selectedClass]) {
            totalPoints += system.classSkillPoints[selectedClass];
        }
        
        // Obtener puntos de la raza seleccionada
        const selectedRace = this.getSelectedRace();
        if (selectedRace && system.raceSkillPoints[selectedRace]) {
            totalPoints += system.raceSkillPoints[selectedRace];
        }
        
        this.maxSkillPoints = totalPoints;
        this.updateSkillPointsDisplay();
        this.updateSkillAvailability();
    }
    
    handleSkillToggle(detail) {
        const { id, selected } = detail;
        
        // Verificar si hay una clase seleccionada
        const selectedClass = this.getSelectedClass();
        if (!selectedClass && selected) {
            this.revertSkillSelection(id);
            this.showNoClassSelectedMessage();
            return;
        }
        
        if (selected) {
            // Verificar si podemos seleccionar más habilidades
            if (this.selectedSkills.size >= this.maxSkillPoints) {
                // No permitir seleccionar más habilidades
                this.revertSkillSelection(id);
                this.showSkillLimitMessage();
                return;
            }
            this.selectedSkills.add(id);
        } else {
            this.selectedSkills.delete(id);
        }
        
        this.updateSkillPointsDisplay();
        this.updateSkillAvailability();
    }
    
    revertSkillSelection(skillId) {
        // Revertir la selección visual de la habilidad
        const skillItem = document.querySelector(`[data-id="${skillId}"]`);
        if (skillItem) {
            const checkbox = skillItem.querySelector('.skill-checkbox');
            if (checkbox) {
                checkbox.classList.remove('checked');
                skillItem.classList.remove('selected');
            }
        }
    }
    
    updateSkillPointsDisplay() {
        if (this.skillPointsElement) {
            const remaining = this.maxSkillPoints - this.selectedSkills.size;
            this.skillPointsElement.textContent = remaining;
            
            // Cambiar color según los puntos restantes
            if (remaining === 0) {
                this.skillPointsElement.style.color = '#dc3545'; // Rojo
            } else if (remaining <= 1) {
                this.skillPointsElement.style.color = '#ffc107'; // Amarillo
            } else {
                this.skillPointsElement.style.color = '#28a745'; // Verde
            }
        }
    }
    
    updateSkillAvailability() {
        const skillItems = document.querySelectorAll('.skill-item');
        const canSelectMore = this.selectedSkills.size < this.maxSkillPoints;
        
        skillItems.forEach(item => {
            const isSelected = item.classList.contains('selected');
            
            if (!isSelected && !canSelectMore) {
                item.classList.add('disabled');
                item.style.opacity = '0.5';
                item.style.pointerEvents = 'none';
            } else {
                item.classList.remove('disabled');
                item.style.opacity = '1';
                item.style.pointerEvents = 'auto';
            }
        });
    }
    
    showSkillLimitMessage() {
        // Crear un mensaje temporal
        const message = document.createElement('div');
        message.className = 'skill-limit-message';
        
        // Detectar idioma y mostrar mensaje apropiado
        const isSpanish = document.documentElement.lang === 'es' || 
                         document.querySelector('html[lang="es"]') ||
                         window.location.pathname.includes('/es/');
        
        if (isSpanish) {
            message.textContent = `Solo puedes seleccionar ${this.maxSkillPoints} habilidades como máximo.`;
        } else {
            message.textContent = `You can only select ${this.maxSkillPoints} skills maximum.`;
        }
        
        document.body.appendChild(message);
        
        // Remover el mensaje después de 3 segundos
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
    
    showNoClassSelectedMessage() {
        // Crear un mensaje temporal
        const message = document.createElement('div');
        message.className = 'skill-limit-message';
        
        // Detectar idioma y mostrar mensaje apropiado
        const isSpanish = document.documentElement.lang === 'es' || 
                         document.querySelector('html[lang="es"]') ||
                         window.location.pathname.includes('/es/');
        
        if (isSpanish) {
            message.textContent = 'Debes seleccionar una clase antes de elegir habilidades.';
        } else {
            message.textContent = 'You must select a class before choosing skills.';
        }
        
        document.body.appendChild(message);
        
        // Remover el mensaje después de 3 segundos
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
    
    getSelectedClass() {
        const classButton = document.getElementById('class-button');
        if (classButton && classButton.classList.contains('selected')) {
            const selectedText = classButton.querySelector('.selection-text').textContent;
            // Verificar que no sea un placeholder
            if (selectedText && !selectedText.includes('Selecciona') && !selectedText.includes('Select')) {
                // Convertir el nombre de la clase a formato de clave
                return selectedText.toLowerCase().replace(/\s+/g, '-');
            }
        }
        return null;
    }
    
    getSelectedRace() {
        const raceButton = document.getElementById('race-button');
        if (raceButton && raceButton.classList.contains('selected')) {
            const selectedText = raceButton.querySelector('.selection-text').textContent;
            // Verificar que no sea un placeholder
            if (selectedText && !selectedText.includes('Selecciona') && !selectedText.includes('Select')) {
                // Convertir el nombre de la raza a formato de clave
                return selectedText.toLowerCase().replace(/\s+/g, '-');
            }
        }
        return null;
    }
    
    // Método para limpiar todas las habilidades seleccionadas
    clearAllSkills() {
        this.selectedSkills.clear();
        
        const skillItems = document.querySelectorAll('.skill-item');
        skillItems.forEach(item => {
            const checkbox = item.querySelector('.skill-checkbox');
            if (checkbox) {
                checkbox.classList.remove('checked');
                item.classList.remove('selected');
            }
        });
        
        this.updateSkillPointsDisplay();
        this.updateSkillAvailability();
    }
    
    // Método para obtener las habilidades seleccionadas
    getSelectedSkills() {
        return Array.from(this.selectedSkills);
    }
    
    // Método para establecer habilidades seleccionadas (para cargar datos guardados)
    setSelectedSkills(skillIds) {
        this.selectedSkills.clear();
        
        skillIds.forEach(skillId => {
            if (this.selectedSkills.size < this.maxSkillPoints) {
                this.selectedSkills.add(skillId);
                
                // Actualizar la UI
                const skillItem = document.querySelector(`[data-id="${skillId}"]`);
                if (skillItem) {
                    const checkbox = skillItem.querySelector('.skill-checkbox');
                    if (checkbox) {
                        checkbox.classList.add('checked');
                        skillItem.classList.add('selected');
                    }
                }
            }
        });
        
        this.updateSkillPointsDisplay();
        this.updateSkillAvailability();
    }
    
    // Auto-seleccionar idiomas basados en la raza
    autoSelectLanguages(race) {
        const raceLanguages = {
            'dwarf': ['common', 'dwarvish'],
            'elf': ['common', 'elvish'],
            'halfling': ['common', 'halfling'],
            'human': ['common'],
            'dragonborn': ['common', 'draconic'],
            'gnome': ['common', 'gnomish'],
            'half-elf': ['common', 'elvish'],
            'half-orc': ['common', 'orc'],
            'tiefling': ['common', 'infernal']
        };
        
        const raceKey = race.index || race.id;
        const languages = raceLanguages[raceKey];
        
        if (languages) {
            languages.forEach(langId => {
                const langItem = document.querySelector(`#languages-list [data-id="${langId}"]`);
                if (langItem && !langItem.classList.contains('selected')) {
                    const checkbox = langItem.querySelector('.language-checkbox');
                    if (checkbox) {
                        checkbox.classList.add('checked');
                        langItem.classList.add('selected');
                        
                        // Disparar evento de toggle
                        document.dispatchEvent(new CustomEvent('languageToggled', {
                            detail: {
                                id: langId,
                                selected: true
                            }
                        }));
                    }
                }
            });
        }
    }
    
    // Filtrar habilidades disponibles por clase
    filterSkillsByClass(classData) {
        const classSkills = {
            'barbarian': ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
            'bard': [], // Los bardos pueden elegir cualquier habilidad
            'cleric': ['history', 'insight', 'medicine', 'persuasion', 'religion'],
            'druid': ['arcana', 'animal-handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
            'fighter': ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
            'monk': ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
            'paladin': ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
            'ranger': ['animal-handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
            'rogue': ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleight-of-hand', 'stealth'],
            'sorcerer': ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
            'warlock': ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
            'wizard': ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion']
        };
        
        const classKey = classData.index || classData.id;
        const availableSkills = classSkills[classKey] || [];
        
        // Si es bardo, mostrar todas las habilidades
        if (classKey === 'bard') {
            document.querySelectorAll('.skill-item').forEach(item => {
                item.style.display = 'flex';
            });
            return;
        }
        
        // Para otras clases, mostrar solo las habilidades disponibles
        document.querySelectorAll('.skill-item').forEach(item => {
            const skillId = item.dataset.id;
            if (availableSkills.includes(skillId)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
                // Deseleccionar si estaba seleccionada
                if (item.classList.contains('selected')) {
                    const checkbox = item.querySelector('.skill-checkbox');
                    if (checkbox) {
                        checkbox.classList.remove('checked');
                        item.classList.remove('selected');
                        this.selectedSkills.delete(skillId);
                    }
                }
            }
        });
        
        this.updateSkillPointsDisplay();
        this.updateSkillAvailability();
    }
}

// Exportar para uso global
window.skillManager = new SkillManager();