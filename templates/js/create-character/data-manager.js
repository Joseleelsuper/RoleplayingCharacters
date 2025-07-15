/**
 * Clase para manejar la carga y filtrado de datos de la API
 */
class DataManager {
    constructor() {
        this.allData = null;
        this.selects = {};
        this.containers = {};
        this.dataPopulated = false;
    }
    
    init() {
        // Cachear referencias a los elementos
        this.selects = {
            race: document.getElementById('race'),
            class: document.getElementById('character-class'),
            background: document.getElementById('background'),
            alignment: document.getElementById('alignment')
        };
        
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
            this.populateFormWithFilteredData(event.detail.gameType);
        });
        
        // Cargar datos
        this.loadAllData();
    }
    
    clearAll() {
        // Limpiar selectores
        Object.values(this.selects).forEach(select => {
            if (select) {
                const firstOption = select.querySelector('option');
                if (firstOption) {
                    select.innerHTML = firstOption.outerHTML;
                } else {
                    select.innerHTML = '';
                }
            }
        });
        
        // Limpiar contenedores
        Object.values(this.containers).forEach(container => {
            if (container) container.innerHTML = '';
        });
    }
    
    async loadAllData() {
        try {
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
                const response = await fetch(url);
                data[key] = await response.json();
            });
            
            await Promise.all(promises);
            
            // Guardar los datos completos
            this.allData = data;
            
            // Notificar que los datos se han cargado
            document.dispatchEvent(new CustomEvent('dataLoaded', {
                detail: { success: true }
            }));
        } catch (err) {
            console.error('Error loading data:', err);
            document.dispatchEvent(new CustomEvent('dataLoaded', {
                detail: { success: false, error: err }
            }));
        }
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
    
    populateFormWithFilteredData(gameType) {
        // Limpiar datos existentes
        this.clearAll();
        
        // Obtener datos filtrados
        const filteredData = this.filterDataByGameType(gameType);
        if (!filteredData) return;
        
        // Poblar selects
        this.populateSelect(this.selects.race, filteredData.races);
        this.populateSelect(this.selects.class, filteredData.classes);
        this.populateSelect(this.selects.background, filteredData.backgrounds);
        this.populateSelect(this.selects.alignment, filteredData.alignments);
        
        // Poblar listas
        this.populateSkills(filteredData.skills);
        this.populateLanguages(filteredData.languages);
        this.populateProficiencies(filteredData.proficiencies);
        this.populateEquipment(filteredData.items);
        this.populateSpells(filteredData.spells);
        
        this.dataPopulated = true;
        
        // Notificar que se han poblado los datos
        document.dispatchEvent(new CustomEvent('dataPopulated', {
            detail: { gameType: gameType }
        }));
    }
    
    populateSelect(select, options) {
        if (!select || !options) return;
        
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.id;
            option.textContent = opt.name;
            select.appendChild(option);
        });
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
        
        // Dividir items en equipamiento inicial y adicional
        const startingItems = items.filter(item => ['weapon', 'armor', 'gear'].includes(item.type));
        const additionalItems = items.filter(item => item.type === 'magic' || item.rarity !== 'common');
        
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
        
        // Agrupar hechizos por nivel
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
                levelTitle.textContent = level === '0' ? 'Cantrips' : `Level ${level}`;
                
                levelContainer.appendChild(levelTitle);
                
                levelSpells.forEach(spell => {
                    const spellItem = document.createElement('div');
                    spellItem.classList.add('spell-item');
                    spellItem.dataset.id = spell.id;
                    
                    const checkbox = document.createElement('div');
                    checkbox.classList.add('spell-checkbox');
                    
                    const name = document.createElement('span');
                    name.classList.add('spell-name');
                    name.textContent = spell.name;
                    
                    spellItem.appendChild(checkbox);
                    spellItem.appendChild(name);
                    
                    spellItem.addEventListener('click', () => {
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
}

// Exportar para uso global
window.dataManager = new DataManager();
