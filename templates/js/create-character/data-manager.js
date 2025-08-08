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
        this.dataCache = new Map(); // Caché para evitar llamadas duplicadas a la API
        this.loadingPromises = new Map(); // Promesas de carga en progreso
    }
    
    init() {
        // Cachear referencias a los elementos (ahora solo contenedores)
        this.selects = {};
        
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
                    this.updateSpellsForLevelChange();
                }
            });
            
            // También escuchar el input event para cambios en tiempo real
            levelInput.addEventListener('input', () => {
                if (this.currentSpells && this.getSelectedGameType() === 'dnd5e') {
                    this.updateSpellsForLevelChange();
                }
            });
        }
        
        // Escuchar eventos de cambio de nivel desde AttributeManager
        document.addEventListener('levelChanged', (event) => {
            console.log('Evento levelChanged recibido:', event.detail);
            if (this.currentSpells && this.getSelectedGameType() === 'dnd5e') {
                this.updateSpellsForLevelChange();
            }
            if (this.getSelectedGameType() === 'dnd5e') {
                this.updateEquipmentLimitsDisplay();
                this.updateSkillsLimitsDisplay();
                this.updateLanguagesLimitsDisplay();
                this.updateProficienciesLimitsDisplay();
                this.updateSpellsLimitsDisplay();
            }
        });
        
        // Escuchar eventos de cambio de atributos
        document.addEventListener('attributeChanged', (event) => {
            console.log('Evento attributeChanged recibido:', event.detail);
            if (event.detail.attribute === 'level' && this.currentSpells && this.getSelectedGameType() === 'dnd5e') {
                this.updateSpellsForLevelChange();
            }
            if (event.detail.attribute === 'level' && this.getSelectedGameType() === 'dnd5e') {
                this.updateEquipmentLimitsDisplay();
                this.updateSkillsLimitsDisplay();
                this.updateLanguagesLimitsDisplay();
                this.updateProficienciesLimitsDisplay();
                this.updateSpellsLimitsDisplay();
            }
        });
        
        // Escuchar cambios de clase para actualizar límites de equipamiento
        document.addEventListener('classChanged', (event) => {
            console.log('Evento classChanged recibido:', event.detail);
            if (this.getSelectedGameType() === 'dnd5e') {
                this.updateEquipmentLimitsDisplay();
                this.updateSkillsLimitsDisplay();
                this.updateLanguagesLimitsDisplay();
                this.updateProficienciesLimitsDisplay();
                this.updateSpellsLimitsDisplay();
            }
        });
        
        // Escuchar cambios en la selección de equipamiento
        document.addEventListener('equipmentToggled', (event) => {
            if (this.getSelectedGameType() === 'dnd5e') {
                this.updateEquipmentLimitsDisplay();
            }
        });
        
        // Escuchar cuando se carga equipamiento para inicializar contadores
        document.addEventListener('equipmentLoaded', (event) => {
            if (this.getSelectedGameType() === 'dnd5e') {
                this.updateEquipmentLimitsDisplay();
            }
        });
        
        // Escuchar cuando se cargan datos para inicializar todos los contadores
        document.addEventListener('dataLoaded', (event) => {
            if (this.getSelectedGameType() === 'dnd5e') {
                this.updateEquipmentLimitsDisplay();
                this.updateSkillsLimitsDisplay();
                this.updateLanguagesLimitsDisplay();
                this.updateProficienciesLimitsDisplay();
                this.updateSpellsLimitsDisplay();
            }
        });
        
        // Escuchar cambios en la selección de habilidades
        document.addEventListener('skillToggled', (event) => {
            if (this.getSelectedGameType() === 'dnd5e') {
                this.updateSkillsLimitsDisplay();
            }
        });
        
        // Escuchar cambios en la selección de idiomas
        document.addEventListener('languageToggled', (event) => {
            if (this.getSelectedGameType() === 'dnd5e') {
                this.updateLanguagesLimitsDisplay();
            }
        });
        
        // Escuchar cambios en la selección de competencias
        document.addEventListener('proficiencyToggled', (event) => {
            if (this.getSelectedGameType() === 'dnd5e') {
                this.updateProficienciesLimitsDisplay();
            }
        });
        
        // Escuchar cambios en la selección de hechizos
        document.addEventListener('spellToggled', (event) => {
            if (this.getSelectedGameType() === 'dnd5e') {
                this.updateSpellsLimitsDisplay();
            }
        });
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
            // Verificar si ya tenemos los datos en caché
            if (this.dataCache.has(gameType)) {
                console.log(`Usando datos en caché para ${gameType}`);
                const cachedData = this.dataCache.get(gameType);
                this.allData = cachedData;
                this.populateFormWithData(cachedData);
                
                // Notificar que los datos se han cargado
                document.dispatchEvent(new CustomEvent('dataLoaded', {
                    detail: { success: true, gameType: gameType, fromCache: true }
                }));
                return;
            }
            
            // Verificar si ya hay una carga en progreso para este gameType
            if (this.loadingPromises.has(gameType)) {
                console.log(`Esperando carga en progreso para ${gameType}`);
                await this.loadingPromises.get(gameType);
                return;
            }
            
            // Crear promesa de carga y almacenarla
            const loadingPromise = this._loadDataFromAPI(gameType);
            this.loadingPromises.set(gameType, loadingPromise);
            
            try {
                await loadingPromise;
            } finally {
                // Limpiar la promesa de carga
                this.loadingPromises.delete(gameType);
            }
            
        } catch (err) {
            console.error('Error loading data:', err);
            document.dispatchEvent(new CustomEvent('dataLoaded', {
                detail: { success: false, error: err }
            }));
        }
    }
    
    async _loadDataFromAPI(gameType) {
        console.log(`Cargando datos desde API para ${gameType}`);
        
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
        
        // Guardar en caché
        this.dataCache.set(gameType, data);
        
        // Guardar los datos completos
        this.allData = data;
        
        // Poblar formulario directamente
        this.populateFormWithData(data);
        
        // Notificar que los datos se han cargado
        document.dispatchEvent(new CustomEvent('dataLoaded', {
            detail: { success: true, gameType: gameType, fromCache: false }
        }));
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
    
    /**
     * Limpia el caché de datos para un gameType específico o todo el caché
     * @param {string} gameType - Tipo de juego específico a limpiar, o null para limpiar todo
     */
    clearCache(gameType = null) {
        if (gameType) {
            this.dataCache.delete(gameType);
            this.loadingPromises.delete(gameType);
            console.log(`Caché limpiado para ${gameType}`);
        } else {
            this.dataCache.clear();
            this.loadingPromises.clear();
            console.log('Caché completamente limpiado');
        }
    }
    
    /**
     * Verifica si hay datos en caché para un gameType
     * @param {string} gameType - Tipo de juego a verificar
     * @returns {boolean} - True si hay datos en caché
     */
    hasDataInCache(gameType) {
        return this.dataCache.has(gameType);
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
            
            skillItem.appendChild(checkbox);
            skillItem.appendChild(name);
            
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
                const gameType = this.getSelectedGameType();
                
                // Si está intentando seleccionar (no deseleccionar) y ha alcanzado el límite
                if (gameType === 'dnd5e' && !checked && !this.canSelectMoreProficiencies()) {
                    this.showProficiencyLimitMessage();
                    return;
                }
                
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
        
        // Limpiar contenedores antes de poblar
        startingContainer.innerHTML = '';
        additionalContainer.innerHTML = '';
        
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
        
        // Disparar evento para notificar que el equipamiento se ha cargado
        document.dispatchEvent(new CustomEvent('equipmentLoaded', {
            detail: {
                startingItems: startingItems.length,
                additionalItems: additionalItems.length,
                totalItems: items.length
            }
        }));
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
            const isStarting = container === this.containers.startingEquipmentList;
            
            // Verificar límites antes de seleccionar
            if (!checked && !this.canSelectMoreEquipment(isStarting)) {
                this.showEquipmentLimitMessage(isStarting);
                return;
            }
            
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
                    isStarting: isStarting
                }
            }));
        });
        
        return itemElement;
    }
    
    populateSpells(spells, skipFiltering = false) {
        const container = this.containers.spellsList;
        if (!container || !spells) return;
        
        // Solo almacenar hechizos originales si no estamos en modo de filtrado
        if (!skipFiltering) {
            this.currentSpells = spells;
        }
        
        // Limpiar contenedor antes de poblar
        container.innerHTML = '';
        
        // Obtener información del personaje para restricciones de D&D 5e
        const gameType = this.getSelectedGameType();
        const characterLevel = this.getCharacterLevel();
        const characterClass = this.getCharacterClass();
        
        // Usar todos los hechizos, pero determinar cuáles están disponibles
        let availableSpells = [];
        if (gameType === 'dnd5e' && !skipFiltering) {
            availableSpells = this.filterSpellsByDnD5eRules(spells, characterLevel, characterClass);
        } else {
            availableSpells = spells;
        }
        
        // Crear un Set de IDs de hechizos disponibles para búsqueda rápida
        const availableSpellIds = new Set(availableSpells.map(spell => spell.id));
        
        // Agrupar TODOS los hechizos por nivel (no solo los disponibles)
        const spellsByLevel = {};
        
        spells.forEach(spell => {
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
                const cantripsTitle = document.getElementById('spell-cantrips-title')?.textContent || 'Cantrips';
                const levelTitle_text = document.getElementById('spell-level-title')?.textContent || 'Level';
                levelTitle.textContent = level === '0' ? cantripsTitle : `${levelTitle_text} ${level}`;
                
                const spellItemsContainer = document.createElement('div');
                spellItemsContainer.classList.add('spell-items');
                
                levelContainer.appendChild(levelTitle);
                levelContainer.appendChild(spellItemsContainer);
                
                levelSpells.forEach(spell => {
                    const spellItem = document.createElement('div');
                    spellItem.classList.add('spell-item');
                    spellItem.dataset.id = spell.id;
                    spellItem.dataset.level = spell.level;
                    
                    // Verificar si el hechizo está disponible para el nivel actual
                    const isAvailable = availableSpellIds.has(spell.id);
                    
                    // Aplicar estilos según disponibilidad
                    if (!isAvailable) {
                        spellItem.classList.add('spell-unavailable');
                        spellItem.style.opacity = '0.4';
                        spellItem.style.pointerEvents = 'none';
                        spellItem.title = `Este hechizo requiere nivel ${this.getMinimumLevelForSpell(spell.level)} o superior`;
                    }
                    
                    const checkbox = document.createElement('div');
                    checkbox.classList.add('spell-checkbox');
                    
                    const name = document.createElement('span');
                    name.classList.add('spell-name');
                    name.textContent = spell.name;
                    
                    spellItem.appendChild(checkbox);
                    spellItem.appendChild(name);
                    
                    // Solo agregar event listener si el hechizo está disponible
                    if (isAvailable) {
                        spellItem.addEventListener('click', () => {
                            const checked = checkbox.classList.contains('checked');
                            
                            // Si está intentando seleccionar (no deseleccionar) y ha alcanzado el límite
                            if (gameType === 'dnd5e' && !checked && !this.canSelectMoreSpells(spell.level)) {
                                this.showSpellLimitMessage(spell.level);
                                return;
                            }
                            
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
                    }
                    
                    spellItemsContainer.appendChild(spellItem);
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
    
    getMinimumLevelForSpell(spellLevel) {
        // Mapeo de nivel de hechizo al nivel mínimo de personaje requerido
        const minimumLevels = {
            0: 1,  // Cantrips disponibles desde nivel 1
            1: 1,  // Hechizos de nivel 1 disponibles desde nivel 1
            2: 3,  // Hechizos de nivel 2 disponibles desde nivel 3
            3: 5,  // Hechizos de nivel 3 disponibles desde nivel 5
            4: 7,  // Hechizos de nivel 4 disponibles desde nivel 7
            5: 9,  // Hechizos de nivel 5 disponibles desde nivel 9
            6: 11, // Hechizos de nivel 6 disponibles desde nivel 11
            7: 13, // Hechizos de nivel 7 disponibles desde nivel 13
            8: 15, // Hechizos de nivel 8 disponibles desde nivel 15
            9: 17  // Hechizos de nivel 9 disponibles desde nivel 17
        };
        
        return minimumLevels[spellLevel] || 1;
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
        
        // Límites mejorados de hechizos conocidos para casters completos (basado en Wizard)
        const spellsKnownLimits = {
            0: this.getCantripsKnown(characterLevel), // Cantrips
            1: this.getSpellsKnownForLevel(characterLevel, 1),
            2: this.getSpellsKnownForLevel(characterLevel, 2),
            3: this.getSpellsKnownForLevel(characterLevel, 3),
            4: this.getSpellsKnownForLevel(characterLevel, 4),
            5: this.getSpellsKnownForLevel(characterLevel, 5),
            6: this.getSpellsKnownForLevel(characterLevel, 6),
            7: this.getSpellsKnownForLevel(characterLevel, 7),
            8: this.getSpellsKnownForLevel(characterLevel, 8),
            9: this.getSpellsKnownForLevel(characterLevel, 9)
        };
        
        const currentCount = Array.from(selectedSpells).filter(spell => 
            parseInt(spell.dataset.level) === spellLevel
        ).length;
        
        const limit = spellsKnownLimits[spellLevel] || 0;
        return currentCount < limit;
    }
    
    // Obtener número de cantrips conocidos según el nivel
    getCantripsKnown(characterLevel) {
        if (characterLevel >= 17) return 4;
        if (characterLevel >= 10) return 4;
        if (characterLevel >= 4) return 3;
        return 3;
    }
    
    // Obtener número de hechizos conocidos para un nivel específico
    getSpellsKnownForLevel(characterLevel, spellLevel) {
        // Verificar si el personaje puede lanzar hechizos de este nivel
        const spellSlots = this.getSpellSlotsForLevel(characterLevel);
        if (spellLevel >= spellSlots.length || spellSlots[spellLevel] === 0) {
            return 0; // No puede lanzar hechizos de este nivel
        }
        
        // Límites generosos para permitir flexibilidad en la selección
        // Basado en que un wizard puede aprender 2 hechizos por nivel + hechizos encontrados
        const baseSpellsPerLevel = Math.max(0, (characterLevel - spellLevel + 1) * 2);
        
        // Límites máximos razonables por nivel de hechizo
        const maxLimits = {
            1: 8,  // Muchos hechizos de nivel 1
            2: 6,  // Buen número de hechizos de nivel 2
            3: 5,  // Hechizos de nivel 3
            4: 4,  // Hechizos de nivel 4
            5: 4,  // Hechizos de nivel 5
            6: 3,  // Hechizos de nivel 6
            7: 3,  // Hechizos de nivel 7
            8: 2,  // Hechizos de nivel 8
            9: 2   // Hechizos de nivel 9
        };
        
        return Math.min(baseSpellsPerLevel, maxLimits[spellLevel] || 2);
    }
    
    // Actualizar hechizos cuando cambia el nivel del personaje
    updateSpellsForLevelChange() {
        if (!this.currentSpells) return;
        
        const characterLevel = this.getCharacterLevel();
        const characterClass = this.getCharacterClass();
        
        console.log(`Actualizando hechizos para nivel ${characterLevel}`);
        
        // Obtener hechizos actualmente seleccionados
        const selectedSpells = [];
        document.querySelectorAll('.spell-item.selected').forEach(item => {
            selectedSpells.push({
                id: item.dataset.id,
                level: parseInt(item.dataset.level),
                name: item.querySelector('.spell-name')?.textContent || 'Unknown'
            });
        });
        
        console.log('Hechizos seleccionados antes del cambio:', selectedSpells);
        
        // Filtrar hechizos según el nuevo nivel
        const filteredSpells = this.filterSpellsByDnD5eRules(this.currentSpells, characterLevel, characterClass);
        const validSpellIds = new Set(filteredSpells.map(spell => spell.id));
        
        console.log(`Hechizos disponibles para nivel ${characterLevel}:`, filteredSpells.length);
        console.log('Niveles de hechizos disponibles:', [...new Set(filteredSpells.map(s => s.level))].sort((a, b) => a - b));
        
        // Verificar qué hechizos seleccionados ya no son válidos
        const invalidSelections = [];
        const validSelections = [];
        
        selectedSpells.forEach(spell => {
            if (!validSpellIds.has(spell.id)) {
                invalidSelections.push(spell);
            } else {
                validSelections.push(spell);
            }
        });
        
        console.log('Hechizos inválidos que se removerán:', invalidSelections);
        console.log('Hechizos válidos que se mantendrán:', validSelections);
        
        // Mostrar mensaje si hay hechizos que se van a remover
        if (invalidSelections.length > 0) {
            const message = document.createElement('div');
            message.className = 'spell-limit-message';
            message.style.backgroundColor = '#ffc107';
            message.style.color = '#000';
            
            const messageTemplate = document.getElementById('spell-removed-message')?.textContent || 
                'Se han removido {count} hechizo(s) que ya no están disponibles para tu nivel actual.';
            message.textContent = messageTemplate.replace('{count}', invalidSelections.length);
            
            document.body.appendChild(message);
            
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 4000);
        }
        
        // Re-poblar todos los hechizos (no solo los filtrados) para mostrar disponibilidad visual
        this.populateSpells(this.currentSpells, false);
        
        // Restaurar selecciones válidas después de un breve delay
        setTimeout(() => {
            console.log('Restaurando selecciones válidas...');
            validSelections.forEach(spell => {
                const spellElement = document.querySelector(`[data-id="${spell.id}"]`);
                if (spellElement) {
                    const checkbox = spellElement.querySelector('.spell-checkbox');
                    if (checkbox) {
                        checkbox.classList.add('checked');
                        spellElement.classList.add('selected');
                        console.log(`Restaurado hechizo: ${spell.name}`);
                    }
                } else {
                    console.log(`No se encontró elemento para hechizo: ${spell.name}`);
                }
            });
            
            // Disparar evento para notificar cambios en hechizos
            document.dispatchEvent(new CustomEvent('spellsUpdated', {
                detail: {
                    level: characterLevel,
                    availableSpells: filteredSpells.length,
                    selectedSpells: validSelections.length,
                    removedSpells: invalidSelections.length
                }
            }));
        }, 150);
    }
    
    // Mostrar mensaje de límite de hechizos
    showSpellLimitMessage(spellLevel) {
        const message = document.createElement('div');
        message.className = 'spell-limit-message';
        
        if (spellLevel === 0) {
            const cantripsLimitText = document.getElementById('spell-limit-cantrips')?.textContent || 'Has alcanzado el límite de cantrips para tu nivel';
            message.textContent = cantripsLimitText;
        } else {
            const levelLimitText = document.getElementById('spell-limit-level')?.textContent || 'Has alcanzado el límite de hechizos de nivel {level} para tu nivel';
            message.textContent = levelLimitText.replace('{level}', spellLevel);
        }
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    // Verificar si se puede seleccionar más equipamiento
     canSelectMoreEquipment(isStarting) {
         const gameType = this.getSelectedGameType();
         
         // Solo aplicar límites para D&D 5e
         if (gameType !== 'dnd5e') {
             return true;
         }
         
         const selectedEquipment = document.querySelectorAll('.equipment-item.selected');
         const startingEquipment = Array.from(selectedEquipment).filter(item => {
             const container = item.closest('#starting-equipment-list');
             return container !== null;
         });
         const additionalEquipment = Array.from(selectedEquipment).filter(item => {
             const container = item.closest('#additional-equipment-list');
             return container !== null;
         });
         
         const limits = this.getEquipmentLimits();
         
         if (isStarting) {
             return startingEquipment.length < limits.starting;
         } else {
             return additionalEquipment.length < limits.additional;
         }
     }
     
     // Obtener límites de equipamiento según las reglas de D&D 5e
     getEquipmentLimits() {
         const characterClass = this.getCharacterClass();
         const characterLevel = this.getCharacterLevel();
         
         // Límites base según las reglas de D&D 5e
         let startingLimit = 6; // Equipamiento inicial estándar
         let additionalLimit = 8; // Equipamiento adicional base
         
         // Ajustar según la clase (basado en las reglas oficiales)
         const classLimits = {
             'fighter': { starting: 8, additional: 12 }, // Más armas y armaduras
             'paladin': { starting: 8, additional: 12 }, // Similar a fighter
             'ranger': { starting: 7, additional: 10 }, // Equipamiento de exploración
             'rogue': { starting: 6, additional: 10 }, // Herramientas especializadas
             'wizard': { starting: 4, additional: 8 }, // Menos equipamiento físico
             'sorcerer': { starting: 4, additional: 8 }, // Similar a wizard
             'warlock': { starting: 5, additional: 9 }, // Equipamiento mágico
             'cleric': { starting: 6, additional: 10 }, // Equipamiento religioso
             'druid': { starting: 5, additional: 9 }, // Equipamiento natural
             'bard': { starting: 6, additional: 10 }, // Instrumentos y herramientas
             'barbarian': { starting: 5, additional: 8 }, // Equipamiento simple
             'monk': { starting: 4, additional: 6 } // Equipamiento mínimo
         };
         
         if (characterClass && classLimits[characterClass.toLowerCase()]) {
             const limits = classLimits[characterClass.toLowerCase()];
             startingLimit = limits.starting;
             additionalLimit = limits.additional;
         }
         
         // Ajustar según el nivel (más nivel = más capacidad de carga)
         if (characterLevel >= 5) {
             additionalLimit += 2;
         }
         if (characterLevel >= 10) {
             additionalLimit += 2;
         }
         if (characterLevel >= 15) {
             additionalLimit += 2;
         }
         
         return {
              starting: startingLimit,
              additional: additionalLimit
          };
      }
      
      // Obtener límites de habilidades según las reglas de D&D 5e
      getSkillsLimits() {
          const characterClass = this.getCharacterClass();
          const characterLevel = this.getCharacterLevel();
          
          // Límites base según las reglas de D&D 5e
          let skillsLimit = 4; // Límite base estándar
          
          // Ajustar según la clase
          const classSkillLimits = {
              'rogue': 6, // Los rogues tienen más habilidades
              'ranger': 5, // Los rangers tienen habilidades adicionales
              'bard': 5, // Los bardos son versátiles
              'fighter': 3, // Los fighters tienen menos habilidades
              'wizard': 3, // Los wizards se enfocan en magia
              'sorcerer': 3, // Similar a wizard
              'warlock': 3, // Similar a wizard
              'barbarian': 3, // Enfoque en combate
              'monk': 3, // Enfoque en disciplina
              'paladin': 3, // Enfoque en combate y magia
              'cleric': 4, // Equilibrado
              'druid': 4 // Equilibrado
          };
          
          if (characterClass && classSkillLimits[characterClass.toLowerCase()]) {
              skillsLimit = classSkillLimits[characterClass.toLowerCase()];
          }
          
          return skillsLimit;
      }
      
      // Obtener límites de idiomas según las reglas de D&D 5e
      getLanguagesLimits() {
          const characterClass = this.getCharacterClass();
          const characterLevel = this.getCharacterLevel();
          
          // Límite base: 2 idiomas adicionales (además del común)
          let languagesLimit = 2;
          
          // Ajustar según la clase
          const classLanguageLimits = {
              'bard': 3, // Los bardos aprenden más idiomas
              'cleric': 3, // Los clérigos tienen conocimiento religioso
              'druid': 2, // Druídico + otro
              'wizard': 3, // Estudio académico
              'warlock': 2, // Conocimiento sobrenatural
              'sorcerer': 2, // Magia innata
              'fighter': 1, // Enfoque en combate
              'barbarian': 1, // Cultura tribal
              'monk': 2, // Disciplina monástica
              'paladin': 2, // Entrenamiento religioso
              'ranger': 2, // Exploración
              'rogue': 2 // Versatilidad
          };
          
          if (characterClass && classLanguageLimits[characterClass.toLowerCase()]) {
              languagesLimit = classLanguageLimits[characterClass.toLowerCase()];
          }
          
          return languagesLimit;
      }
      
      // Obtener límites de competencias según las reglas de D&D 5e
      getProficienciesLimits() {
          const characterClass = this.getCharacterClass();
          const characterLevel = this.getCharacterLevel();
          
          // Límite base: 3 competencias adicionales
          let proficienciesLimit = 3;
          
          // Ajustar según la clase
          const classProficiencyLimits = {
              'fighter': 5, // Muchas armas y armaduras
              'paladin': 5, // Similar a fighter
              'ranger': 4, // Armas y herramientas de supervivencia
              'rogue': 4, // Herramientas especializadas
              'bard': 4, // Instrumentos y herramientas
              'cleric': 3, // Equipamiento religioso
              'druid': 2, // Equipamiento natural limitado
              'wizard': 2, // Pocas competencias físicas
              'sorcerer': 2, // Similar a wizard
              'warlock': 2, // Conocimiento sobrenatural
              'barbarian': 3, // Armas simples
              'monk': 2 // Armas monásticas específicas
          };
          
          if (characterClass && classProficiencyLimits[characterClass.toLowerCase()]) {
              proficienciesLimit = classProficiencyLimits[characterClass.toLowerCase()];
          }
          
          return proficienciesLimit;
      }
      
      // Obtener límites de hechizos según las reglas de D&D 5e
      getSpellsLimits() {
          const characterClass = this.getCharacterClass();
          const characterLevel = this.getCharacterLevel();
          
          // Límite base: 6 hechizos conocidos
          let spellsLimit = 6;
          
          // Ajustar según la clase y nivel
          const classSpellLimits = {
              'wizard': Math.min(2 + characterLevel, 20), // Los wizards aprenden muchos hechizos
              'sorcerer': Math.min(2 + Math.floor(characterLevel / 2), 15), // Hechizos conocidos limitados
              'warlock': Math.min(2 + Math.floor(characterLevel / 3), 10), // Pocos hechizos pero poderosos
              'bard': Math.min(4 + Math.floor(characterLevel / 2), 18), // Versatilidad mágica
              'cleric': Math.min(3 + Math.floor(characterLevel / 2), 15), // Magia divina
              'druid': Math.min(3 + Math.floor(characterLevel / 2), 15), // Magia natural
              'paladin': Math.max(0, Math.min(Math.floor((characterLevel - 1) / 2), 8)), // Magia a partir de nivel 2
              'ranger': Math.max(0, Math.min(Math.floor((characterLevel - 1) / 2), 8)), // Similar a paladin
              'fighter': characterLevel >= 3 ? Math.min(3 + Math.floor(characterLevel / 4), 6) : 0, // Eldritch Knight
              'rogue': characterLevel >= 3 ? Math.min(3 + Math.floor(characterLevel / 4), 6) : 0, // Arcane Trickster
              'barbarian': 0, // No usan magia
              'monk': 0 // No usan magia tradicional
          };
          
          if (characterClass && classSpellLimits[characterClass.toLowerCase()] !== undefined) {
              spellsLimit = classSpellLimits[characterClass.toLowerCase()];
          }
          
          return spellsLimit;
      }
     
     // Actualizar la visualización de límites de equipamiento
      updateEquipmentLimitsDisplay() {
          const gameType = this.getSelectedGameType();
          if (gameType !== 'dnd5e') return;
          
          const limits = this.getEquipmentLimits();
          
          // Actualizar contadores en la UI si existen
          const startingCounter = document.querySelector('#starting-equipment-counter');
          const additionalCounter = document.querySelector('#additional-equipment-counter');
          
          if (startingCounter) {
              const selectedStarting = document.querySelectorAll('#starting-equipment-list .equipment-item.selected').length;
              startingCounter.textContent = `${selectedStarting}/${limits.starting}`;
              
              // Aplicar clases CSS según el estado
              startingCounter.classList.remove('limit-reached', 'limit-warning');
              if (selectedStarting >= limits.starting) {
                  startingCounter.classList.add('limit-reached');
              } else if (selectedStarting >= limits.starting - 1) {
                  startingCounter.classList.add('limit-warning');
              }
          }
          
          if (additionalCounter) {
              const selectedAdditional = document.querySelectorAll('#additional-equipment-list .equipment-item.selected').length;
              additionalCounter.textContent = `${selectedAdditional}/${limits.additional}`;
              
              // Aplicar clases CSS según el estado
              additionalCounter.classList.remove('limit-reached', 'limit-warning');
              if (selectedAdditional >= limits.additional) {
                  additionalCounter.classList.add('limit-reached');
              } else if (selectedAdditional >= limits.additional - 1) {
                  additionalCounter.classList.add('limit-warning');
              }
          }
          
          // Disparar evento para notificar cambios en límites
          document.dispatchEvent(new CustomEvent('equipmentLimitsUpdated', {
              detail: {
                  limits: limits,
                  characterLevel: this.getCharacterLevel(),
                  characterClass: this.getCharacterClass()
              }
          }));
       }
       
       // Actualizar la visualización de límites de habilidades
       updateSkillsLimitsDisplay() {
           const gameType = this.getSelectedGameType();
           if (gameType !== 'dnd5e') return;
           
           const limit = this.getSkillsLimits();
           const counter = document.querySelector('#skills-counter');
           
           if (counter) {
               const selected = document.querySelectorAll('#skills-list .skill-item.selected').length;
               counter.textContent = `${selected}/${limit}`;
               
               // Aplicar clases CSS según el estado
               counter.classList.remove('limit-reached', 'limit-warning');
               if (selected >= limit) {
                   counter.classList.add('limit-reached');
               } else if (selected >= limit - 1) {
                   counter.classList.add('limit-warning');
               }
           }
       }
       
       // Actualizar la visualización de límites de idiomas
       updateLanguagesLimitsDisplay() {
           const gameType = this.getSelectedGameType();
           if (gameType !== 'dnd5e') return;
           
           const limit = this.getLanguagesLimits();
           const counter = document.querySelector('#languages-counter');
           
           if (counter) {
               const selected = document.querySelectorAll('#languages-list .language-item.selected').length;
               counter.textContent = `${selected}/${limit}`;
               
               // Aplicar clases CSS según el estado
               counter.classList.remove('limit-reached', 'limit-warning');
               if (selected >= limit) {
                   counter.classList.add('limit-reached');
               } else if (selected >= limit - 1) {
                   counter.classList.add('limit-warning');
               }
           }
       }
       
       // Actualizar la visualización de límites de competencias
       updateProficienciesLimitsDisplay() {
           const gameType = this.getSelectedGameType();
           if (gameType !== 'dnd5e') return;
           
           const limit = this.getProficienciesLimits();
           const counter = document.querySelector('#proficiencies-counter');
           
           if (counter) {
               const selected = document.querySelectorAll('#proficiencies-list .proficiency-item.selected').length;
               counter.textContent = `${selected}/${limit}`;
               
               // Aplicar clases CSS según el estado
               counter.classList.remove('limit-reached', 'limit-warning');
               if (selected >= limit) {
                   counter.classList.add('limit-reached');
               } else if (selected >= limit - 1) {
                   counter.classList.add('limit-warning');
               }
           }
        }
        
        // Verificar si se pueden seleccionar más competencias
        canSelectMoreProficiencies() {
            const limit = this.getProficienciesLimits();
            const selected = document.querySelectorAll('#proficiencies-list .proficiency-item.selected').length;
            return selected < limit;
        }
        
        // Mostrar mensaje de límite de competencias
        showProficiencyLimitMessage() {
            const limit = this.getProficienciesLimits();
            
            // Crear un mensaje temporal
            const message = document.createElement('div');
            message.className = 'proficiency-limit-message';
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #dc3545;
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                z-index: 10000;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                animation: slideInFade 0.3s ease-out;
            `;
            
            message.textContent = `Solo puedes seleccionar ${limit} competencias como máximo.`;
            
            document.body.appendChild(message);
            
            // Remover el mensaje después de 3 segundos
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 3000);
        }
       
       // Actualizar la visualización de límites de hechizos
       updateSpellsLimitsDisplay() {
           const gameType = this.getSelectedGameType();
           if (gameType !== 'dnd5e') return;
           
           const limit = this.getSpellsLimits();
           const counter = document.querySelector('#spells-counter');
           
           if (counter) {
               const selected = document.querySelectorAll('#spells-list .spell-item.selected').length;
               counter.textContent = `${selected}/${limit}`;
               
               // Aplicar clases CSS según el estado
               counter.classList.remove('limit-reached', 'limit-warning');
               if (selected >= limit) {
                   counter.classList.add('limit-reached');
               } else if (selected >= limit - 1) {
                   counter.classList.add('limit-warning');
               }
           }
       }
      
      // Mostrar mensaje de límite de equipamiento
     showEquipmentLimitMessage(isStarting) {
         const limits = this.getEquipmentLimits();
         const message = document.createElement('div');
         message.className = 'spell-limit-message'; // Reutilizar estilos
         
         if (isStarting) {
             const startingLimitText = document.getElementById('equipment-limit-starting')?.textContent || 'Has alcanzado el límite de equipamiento inicial ({count} items)';
             message.textContent = startingLimitText.replace('{count}', limits.starting);
         } else {
             const additionalLimitText = document.getElementById('equipment-limit-additional')?.textContent || 'Has alcanzado el límite de equipamiento adicional ({count} items)';
             message.textContent = additionalLimitText.replace('{count}', limits.additional);
         }
         
         document.body.appendChild(message);
         
         setTimeout(() => {
             message.remove();
         }, 3000);
     }
}

// Exportar para uso global
window.dataManager = new DataManager();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dataManager.init();
    });
} else {
    window.dataManager.init();
}
