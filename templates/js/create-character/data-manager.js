/**
 * Clase para manejar la carga y filtrado de datos de la API
 */
class DataManager {
    constructor() {
        this.allData = null;
        this.selects = {};
        this.containers = {};
        this.dataPopulated = false;
        this.currentSpells = null; // Almacenar hechizos para re-filtrar cuando cambie el nivel
    }
    
    init() {
        // Cachear referencias a los elementos (ahora solo contenedores)
        this.selects = {}; // Ya no usamos selects, pero mantenemos para compatibilidad
        
        this.containers = {
            skillsList: document.getElementById('skills-list'),
            languagesList: document.getElementById('languages-list'),
            proficienciesList: document.getElementById('proficiencies-list'),
            startingEquipmentList: document.getElementById('starting-equipment-list'),
            additionalEquipmentList: document.getElementById('additional-equipment-list'),
            spellsList: document.getElementById('spells-list')
        };
        
        // Escuchar cambios de tipo de juego
        document.addEventListener('gameTypeSelected', (event) => {
            this.loadDataForGameType(event.detail.gameType);
        });
        
        // Escuchar cambios en el nivel del personaje para actualizar restricciones de hechizos
        const levelInput = document.getElementById('level');
        if (levelInput) {
            levelInput.addEventListener('change', () => {
                if (this.currentSpells && this.getSelectedGameType() === 'dnd5e') {
                    this.populateSpells(this.currentSpells);
                }
            });
        }
    }
    
    clearAll() {
        // Limpiar botones de selección
        document.querySelectorAll('.selection-button').forEach(button => {
            const textSpan = button.querySelector('.selection-text');
            const type = button.dataset.selectionType;
            if (textSpan && type) {
                // Obtener texto placeholder desde elementos de traducción ocultos
                const placeholderElement = document.getElementById(`${type}-placeholder-text`);
                if (placeholderElement) {
                    textSpan.textContent = placeholderElement.textContent;
                } else {
                    // Fallback: obtener desde atributos data o texto original del HTML
                    const originalText = textSpan.getAttribute('data-original-text');
                    if (originalText) {
                        textSpan.textContent = originalText;
                    }
                }
                button.classList.remove('selected');
            }
        });
        
        // Limpiar inputs ocultos
        document.querySelectorAll('input[type="hidden"][name$="_id"]').forEach(input => {
            input.value = '';
        });
        
        // Limpiar contenedores
        Object.values(this.containers).forEach(container => {
            if (container) container.innerHTML = '';
        });
        
        // Limpiar habilidades seleccionadas
        if (window.skillManager) {
            window.skillManager.clearAllSkills();
        }
    }
    
    async loadDataForGameType(gameType) {
        try {
            // Limpiar datos existentes
            this.clearAll();
            
            const endpoints = {
                races: '/api/races',
                classes: '/api/classes',
                backgrounds: '/api/backgrounds',
                alignments: '/api/alignments',
                skills: '/api/skills',
                languages: '/api/languages',
                proficiencies: '/api/proficiencies',
                spells: '/api/spells',
                items: '/api/items'
            };
            
            const data = {};
            const promises = Object.entries(endpoints).map(async ([key, url]) => {
                const urlWithGameType = `${url}?game_type=${gameType}`;
                const response = await fetch(urlWithGameType);
                data[key] = await response.json();
            });
            
            await Promise.all(promises);
            
            // Guardar los datos completos
            this.allData = data;
            
            // Poblar formulario directamente
            this.populateFormWithData(data);
            
            // Notificar que los datos se han cargado
            document.dispatchEvent(new CustomEvent('dataLoaded', {
                detail: { success: true, gameType: gameType }
            }));
        } catch (err) {
            console.error('Error loading data:', err);
            document.dispatchEvent(new CustomEvent('dataLoaded', {
                detail: { success: false, error: err }
            }));
        }
    }
    
    async loadAllData() {
        // Método mantenido para compatibilidad, pero ahora carga datos personalizados por defecto
        await this.loadDataForGameType('custom');
    }
    
    filterDataByGameType(gameType) {
        if (!this.allData) return null;
        
        const gameTypeValue = gameType || 'custom';
        const filteredData = {};
        
        // Si es personalizado, mostrar todo
        if (gameTypeValue === 'custom') {
            Object.keys(this.allData).forEach(key => {
                filteredData[key] = this.allData[key];
            });
        } else {
            // Filtrar por tipo de juego
            Object.keys(this.allData).forEach(key => {
                if (Array.isArray(this.allData[key])) {
                    filteredData[key] = this.allData[key].filter(item => 
                        !item.game_type || item.game_type === gameTypeValue);
                } else {
                    filteredData[key] = this.allData[key];
                }
            });
        }
        
        return filteredData;
    }
    
    populateFormWithData(data) {
        if (!data) return;
        
        // Los datos ahora se manejan directamente en el overlay
        // No necesitamos poblar selects
        
        // Poblar listas
        this.populateSkills(data.skills);
        this.populateLanguages(data.languages);
        this.populateProficiencies(data.proficiencies);
        this.populateEquipment(data.items);
        this.populateSpells(data.spells);
        
        this.dataPopulated = true;
        
        // Notificar que se han poblado los datos
        document.dispatchEvent(new CustomEvent('dataPopulated', {
            detail: { success: true }
        }));
    }
    
    populateFormWithFilteredData(gameType) {
        // Método mantenido para compatibilidad
        // Ahora simplemente carga datos para el tipo de juego especificado
        this.loadDataForGameType(gameType);
    }
    
    populateSelect(select, options) {
        // Método mantenido para compatibilidad, pero ya no se usa
        // Los datos se manejan ahora en selection-overlay.js
        return;
    }
    
    populateSkills(skills) {
        const container = this.containers.skillsList;
        if (!container || !skills) return;
        
        skills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.classList.add('skill-item');
            skillItem.dataset.id = skill.id;
            
            const checkbox = document.createElement('div');
            checkbox.classList.add('skill-checkbox');
            
            const name = document.createElement('span');
            name.classList.add('skill-name');
            name.textContent = skill.name;
            
            const attribute = document.createElement('span');
            attribute.classList.add('skill-attribute');
            attribute.textContent = `(${skill.attribute})`;
            
            skillItem.appendChild(checkbox);
            skillItem.appendChild(name);
            skillItem.appendChild(attribute);
            
            skillItem.addEventListener('click', () => {
                const checked = checkbox.classList.contains('checked');
                if (!checked) {
                    checkbox.classList.add('checked');
                    skillItem.classList.add('selected');
                } else {
                    checkbox.classList.remove('checked');
                    skillItem.classList.remove('selected');
                }
                
                document.dispatchEvent(new CustomEvent('skillToggled', {
                    detail: {
                        id: skill.id,
                        name: skill.name,
                        selected: !checked
                    }
                }));
            });
            
            container.appendChild(skillItem);
        });
    }
    
    populateLanguages(languages) {
        const container = this.containers.languagesList;
        if (!container || !languages) return;
        
        languages.forEach(language => {
            const languageItem = document.createElement('div');
            languageItem.classList.add('language-item');
            languageItem.dataset.id = language.id;
            
            const checkbox = document.createElement('div');
            checkbox.classList.add('language-checkbox');
            
            const name = document.createElement('span');
            name.classList.add('language-name');
            name.textContent = language.name;
            
            languageItem.appendChild(checkbox);
            languageItem.appendChild(name);
            
            languageItem.addEventListener('click', () => {
                const checked = checkbox.classList.contains('checked');
                if (!checked) {
                    checkbox.classList.add('checked');
                    languageItem.classList.add('selected');
                } else {
                    checkbox.classList.remove('checked');
                    languageItem.classList.remove('selected');
                }
                
                document.dispatchEvent(new CustomEvent('languageToggled', {
                    detail: {
                        id: language.id,
                        name: language.name,
                        selected: !checked
                    }
                }));
            });
            
            container.appendChild(languageItem);
        });
    }
    
    populateProficiencies(proficiencies) {
        const container = this.containers.proficienciesList;
        if (!container || !proficiencies) return;
        
        proficiencies.forEach(proficiency => {
            const proficiencyItem = document.createElement('div');
            proficiencyItem.classList.add('proficiency-item');
            proficiencyItem.dataset.id = proficiency.id;
            
            const checkbox = document.createElement('div');
            checkbox.classList.add('proficiency-checkbox');
            
            const name = document.createElement('span');
            name.classList.add('proficiency-name');
            name.textContent = proficiency.name;
            
            proficiencyItem.appendChild(checkbox);
            proficiencyItem.appendChild(name);
            
            proficiencyItem.addEventListener('click', () => {
                const checked = checkbox.classList.contains('checked');
                if (!checked) {
                    checkbox.classList.add('checked');
                    proficiencyItem.classList.add('selected');
                } else {
                    checkbox.classList.remove('checked');
                    proficiencyItem.classList.remove('selected');
                }
                
                document.dispatchEvent(new CustomEvent('proficiencyToggled', {
                    detail: {
                        id: proficiency.id,
                        name: proficiency.name,
                        selected: !checked
                    }
                }));
            });
            
            container.appendChild(proficiencyItem);
        });
    }
    
    populateEquipment(items) {
        const startingContainer = this.containers.startingEquipmentList;
        const additionalContainer = this.containers.additionalEquipmentList;
        
        if (!startingContainer || !additionalContainer || !items) return;
        
        // Dividir items: primeros 50 en equipamiento inicial, resto en adicional
        const startingItems = items.slice(0, 50);
        const additionalItems = items.slice(50);
        
        startingItems.forEach(item => {
            const itemElement = this.createEquipmentItem(item, startingContainer);
            startingContainer.appendChild(itemElement);
        });
        
        additionalItems.forEach(item => {
            const itemElement = this.createEquipmentItem(item, additionalContainer);
            additionalContainer.appendChild(itemElement);
        });
    }
    
    createEquipmentItem(item, container) {
        const itemElement = document.createElement('div');
        itemElement.classList.add('equipment-item');
        itemElement.dataset.id = item.id;
        
        const checkbox = document.createElement('div');
        checkbox.classList.add('equipment-checkbox');
        
        const name = document.createElement('span');
        name.classList.add('equipment-name');
        name.textContent = item.name;
        
        const rarity = document.createElement('span');
        rarity.classList.add('equipment-rarity');
        rarity.textContent = ` (${item.rarity || 'common'})`;
        
        itemElement.appendChild(checkbox);
        itemElement.appendChild(name);
        itemElement.appendChild(rarity);
        
        itemElement.addEventListener('click', () => {
            const checked = checkbox.classList.contains('checked');
            if (!checked) {
                checkbox.classList.add('checked');
                itemElement.classList.add('selected');
            } else {
                checkbox.classList.remove('checked');
                itemElement.classList.remove('selected');
            }
            
            document.dispatchEvent(new CustomEvent('equipmentToggled', {
                detail: {
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    rarity: item.rarity,
                    selected: !checked,
                    isStarting: container === this.containers.startingEquipmentList
                }
            }));
        });
        
        return itemElement;
    }
    
    populateSpells(spells) {
        const container = this.containers.spellsList;
        if (!container || !spells) return;
        
        // Almacenar hechizos para re-filtrar cuando cambie el nivel
        this.currentSpells = spells;
        
        // Limpiar contenedor antes de poblar
        container.innerHTML = '';
        
        // Obtener información del personaje para restricciones de D&D 5e
        const gameType = this.getSelectedGameType();
        const characterLevel = this.getCharacterLevel();
        const characterClass = this.getCharacterClass();
        
        // Filtrar hechizos según las reglas de D&D 5e
        let filteredSpells = spells;
        if (gameType === 'dnd5e') {
            filteredSpells = this.filterSpellsByDnD5eRules(spells, characterLevel, characterClass);
        }
        
        // Agrupar hechizos por nivel
        const spellsByLevel = {};
        
        filteredSpells.forEach(spell => {
            const level = spell.level || 0;
            if (!spellsByLevel[level]) {
                spellsByLevel[level] = [];
            }
            spellsByLevel[level].push(spell);
        });
        
        // Ordenar por nivel y crear los elementos
        Object.entries(spellsByLevel)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .forEach(([level, levelSpells]) => {
                const levelContainer = document.createElement('div');
                levelContainer.classList.add('spell-level-container');
                
                const levelTitle = document.createElement('h3');
                levelTitle.classList.add('spell-level-title');
                levelTitle.textContent = level === '0' ? 'Cantrips' : `Level ${level}`;
                
                levelContainer.appendChild(levelTitle);
                
                levelSpells.forEach(spell => {
                    const spellItem = document.createElement('div');
                    spellItem.classList.add('spell-item');
                    spellItem.dataset.id = spell.id;
                    spellItem.dataset.level = spell.level;
                    
                    const checkbox = document.createElement('div');
                    checkbox.classList.add('spell-checkbox');
                    
                    const name = document.createElement('span');
                    name.classList.add('spell-name');
                    name.textContent = spell.name;
                    
                    spellItem.appendChild(checkbox);
                    spellItem.appendChild(name);
                    
                    spellItem.addEventListener('click', () => {
                        if (gameType === 'dnd5e' && !this.canSelectMoreSpells(spell.level)) {
                            this.showSpellLimitMessage(spell.level);
                            return;
                        }
                        
                        const checked = checkbox.classList.contains('checked');
                        if (!checked) {
                            checkbox.classList.add('checked');
                            spellItem.classList.add('selected');
                        } else {
                            checkbox.classList.remove('checked');
                            spellItem.classList.remove('selected');
                        }
                        
                        document.dispatchEvent(new CustomEvent('spellToggled', {
                            detail: {
                                id: spell.id,
                                name: spell.name,
                                level: spell.level,
                                selected: !checked
                            }
                        }));
                    });
                    
                    levelContainer.appendChild(spellItem);
                });
                
                container.appendChild(levelContainer);
            });
    }
    
    // Métodos para restricciones de D&D 5e
    getSelectedGameType() {
        const gameTypeInput = document.getElementById('selected-game-type');
        return gameTypeInput ? gameTypeInput.value : 'custom';
    }
    
    getCharacterLevel() {
        const levelInput = document.getElementById('level');
        return levelInput ? parseInt(levelInput.value) || 1 : 1;
    }
    
    getCharacterClass() {
        const classInput = document.getElementById('character-class');
        return classInput ? classInput.value : null;
    }
    
    // Tabla de spell slots por nivel para D&D 5e (casters completos como Wizard)
    getSpellSlotsForLevel(characterLevel) {
        const spellSlotTable = {
            1: [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],  // Cantrips, 1st, 2nd, ..., 9th
            2: [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
            3: [0, 4, 2, 0, 0, 0, 0, 0, 0, 0],
            4: [0, 4, 3, 0, 0, 0, 0, 0, 0, 0],
            5: [0, 4, 3, 2, 0, 0, 0, 0, 0, 0],
            6: [0, 4, 3, 3, 0, 0, 0, 0, 0, 0],
            7: [0, 4, 3, 3, 1, 0, 0, 0, 0, 0],
            8: [0, 4, 3, 3, 2, 0, 0, 0, 0, 0],
            9: [0, 4, 3, 3, 3, 1, 0, 0, 0, 0],
            10: [0, 4, 3, 3, 3, 2, 0, 0, 0, 0],
            11: [0, 4, 3, 3, 3, 2, 1, 0, 0, 0],
            12: [0, 4, 3, 3, 3, 2, 1, 0, 0, 0],
            13: [0, 4, 3, 3, 3, 2, 1, 1, 0, 0],
            14: [0, 4, 3, 3, 3, 2, 1, 1, 0, 0],
            15: [0, 4, 3, 3, 3, 2, 1, 1, 1, 0],
            16: [0, 4, 3, 3, 3, 2, 1, 1, 1, 0],
            17: [0, 4, 3, 3, 3, 2, 1, 1, 1, 1],
            18: [0, 4, 3, 3, 3, 3, 1, 1, 1, 1],
            19: [0, 4, 3, 3, 3, 3, 2, 1, 1, 1],
            20: [0, 4, 3, 3, 3, 3, 2, 2, 1, 1]
        };
        
        return spellSlotTable[Math.min(characterLevel, 20)] || spellSlotTable[1];
    }
    
    // Filtrar hechizos según las reglas de D&D 5e
    filterSpellsByDnD5eRules(spells, characterLevel, characterClass) {
        const spellSlots = this.getSpellSlotsForLevel(characterLevel);
        
        return spells.filter(spell => {
            const spellLevel = spell.level || 0;
            
            // Los cantrips (nivel 0) siempre están disponibles
            if (spellLevel === 0) return true;
            
            // Solo mostrar hechizos para los cuales el personaje tiene spell slots
            return spellLevel <= spellSlots.length - 1 && spellSlots[spellLevel] > 0;
        });
    }
    
    // Verificar si se pueden seleccionar más hechizos de un nivel específico
    canSelectMoreSpells(spellLevel) {
        const characterLevel = this.getCharacterLevel();
        const selectedSpells = document.querySelectorAll('.spell-item.selected');
        
        // Límites básicos de hechizos conocidos para casters completos
        const spellsKnownLimits = {
            0: Math.min(4, Math.floor(characterLevel / 3) + 3), // Cantrips
            1: Math.min(6, characterLevel + 1), // Hechizos de nivel 1+
            2: Math.min(4, Math.max(0, characterLevel - 2)),
            3: Math.min(4, Math.max(0, characterLevel - 4)),
            4: Math.min(3, Math.max(0, characterLevel - 6)),
            5: Math.min(3, Math.max(0, characterLevel - 8)),
            6: Math.min(2, Math.max(0, characterLevel - 10)),
            7: Math.min(2, Math.max(0, characterLevel - 12)),
            8: Math.min(1, Math.max(0, characterLevel - 14)),
            9: Math.min(1, Math.max(0, characterLevel - 16))
        };
        
        const currentCount = Array.from(selectedSpells).filter(spell => 
            parseInt(spell.dataset.level) === spellLevel
        ).length;
        
        const limit = spellsKnownLimits[spellLevel] || 0;
        return currentCount < limit;
    }
    
    // Mostrar mensaje de límite de hechizos
    showSpellLimitMessage(spellLevel) {
        const message = document.createElement('div');
        message.className = 'spell-limit-message';
        message.textContent = spellLevel === 0 
            ? `Has alcanzado el límite de cantrips para tu nivel`
            : `Has alcanzado el límite de hechizos de nivel ${spellLevel} para tu nivel`;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// Exportar para uso global
window.dataManager = new DataManager();
