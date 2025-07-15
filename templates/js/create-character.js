// Refactorización completa del JS para la página de creación de personajes
// Carga datos de la API y los muestra en los selects y contenedores

class CharacterCreator {
    // Configuración de los diferentes sistemas de atributos
    attributeSystems = {
        dnd5e: {
            minAttr: 6,
            maxAttr: 15,
            pointsLimit: 27,
            pointBuyCostFunction: function(val) {
                if (val < 8) return 0;
                if (val === 8) return 0;
                if (val === 9) return 1;
                if (val === 10) return 2;
                if (val === 11) return 3;
                if (val === 12) return 4;
                if (val === 13) return 5;
                if (val === 14) return 7;
                if (val === 15) return 9;
                return 1000;
            },
            name: 'D&D 5e'
        },
        dnd35: {
            minAttr: 8,
            maxAttr: 18,
            pointsLimit: 25,
            pointBuyCostFunction: function(val) {
                if (val < 8) return 0;
                if (val === 8) return 0;
                if (val === 9) return 1;
                if (val === 10) return 2;
                if (val === 11) return 3;
                if (val === 12) return 4;
                if (val === 13) return 5;
                if (val === 14) return 6;
                if (val === 15) return 8;
                if (val === 16) return 10;
                if (val === 17) return 13;
                if (val === 18) return 16;
                return 1000;
            },
            name: 'D&D 3.5'
        },
        pathfinder: {
            minAttr: 7,
            maxAttr: 18,
            pointsLimit: 20,
            pointBuyCostFunction: function(val) {
                if (val < 7) return 0;
                if (val === 7) return -4;
                if (val === 8) return -2;
                if (val === 9) return -1;
                if (val === 10) return 0;
                if (val === 11) return 1;
                if (val === 12) return 2;
                if (val === 13) return 3;
                if (val === 14) return 5;
                if (val === 15) return 7;
                if (val === 16) return 10;
                if (val === 17) return 13;
                if (val === 18) return 17;
                return 1000;
            },
            name: 'Pathfinder'
        },
        custom: {
            minAttr: 6,
            maxAttr: 15,
            pointsLimit: 27,
            pointBuyCostFunction: function(val) {
                if (val < 8) return 0;
                if (val === 8) return 0;
                if (val === 9) return 1;
                if (val === 10) return 2;
                if (val === 11) return 3;
                if (val === 12) return 4;
                if (val === 13) return 5;
                if (val === 14) return 7;
                if (val === 15) return 9;
                return 1000;
            },
            name: 'Custom'
        }
    };

    // Sistema de atributos actualmente seleccionado
    currentAttributeSystem = 'dnd5e';

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.cacheElements();
            this.clearAll();
            this.setupNavigation();
            this.loadAllData();
            this.setupPreview();
            this.setupAttributeControls();
            this.setupAttributeSystemSelector();
            this.setupLevelExperienceControls();
            this.updateAttributeButtonLabels();
            this.setupFormSubmitPrevention();
            this.setupPreviewListeners();
        });
    }
    
    setupFormSubmitPrevention() {
        const form = document.getElementById('character-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }
    }

    setupPreviewListeners() {
        const nameInput = document.getElementById('character-name');
        const raceSelect = document.getElementById('race');
        const classSelect = document.getElementById('character-class');
        if (nameInput) {
            nameInput.addEventListener('input', () => this.updatePreview());
        }
        if (raceSelect) {
            raceSelect.addEventListener('change', () => this.updatePreview());
        }
        if (classSelect) {
            classSelect.addEventListener('change', () => this.updatePreview());
        }
    }

    cacheElements() {
        this.selects = {
            race: document.getElementById('race'),
            class: document.getElementById('character-class'),
            background: document.getElementById('background'),
            alignment: document.getElementById('alignment'),
            attributeSystem: document.getElementById('attribute-system'),
        };
        this.containers = {
            skillsList: document.getElementById('skills-list'),
            languagesList: document.getElementById('languages-list'),
            proficienciesList: document.getElementById('proficiencies-list'),
            startingEquipmentList: document.getElementById('starting-equipment-list'),
            additionalEquipmentList: document.getElementById('additional-equipment-list'),
            spellsList: document.getElementById('spells-list'),
        };
        this.tabs = document.querySelectorAll('.tab-button');
        this.sections = document.querySelectorAll('.form-section');
        this.attributeButtons = document.querySelectorAll('.attribute-btn');
        this.skillPointsRemaining = document.getElementById('skill-points-remaining');
        this.attributePointsRemaining = document.getElementById('points-remaining');
        this.randomStatsBtn = document.getElementById('random-attributes-btn');
        this.defaultStatsBtn = document.getElementById('default-attributes-btn');
    }

    clearAll() {
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
        Object.values(this.containers).forEach(container => {
            if (container) container.innerHTML = '';
        });
    }

    setupAttributeControls() {
        this.attributeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const attribute = button.dataset.attribute;
                const isIncrease = button.classList.contains('increase');
                const input = document.getElementById(attribute);
                if (!input) return;
                let value = parseInt(input.value);
                
                // Usar los límites del sistema actual
                const system = this.attributeSystems[this.currentAttributeSystem];
                const min = system.minAttr;
                const max = system.maxAttr;

                // Calcular puntos usados antes del cambio
                const attrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                let values = attrs.map(attr => parseInt(document.getElementById(attr).value));
                let idx = attrs.indexOf(attribute);
                let oldVal = values[idx];
                let newVal = oldVal;
                if (isIncrease && value < max) {
                    newVal = oldVal + 1;
                } else if (!isIncrease && value > min) {
                    newVal = oldVal - 1;
                }
                values[idx] = newVal;
                let used = this.getTotalAttributePoints(values);
                if (used <= this.attributeSystems[this.currentAttributeSystem].pointsLimit && newVal >= min && newVal <= max) {
                    input.value = newVal;
                }

                // Actualizar modificador si existe
                const modifierElement = document.getElementById(`${attribute}-modifier`);
                if (modifierElement) {
                    const modifier = Math.floor((newVal - 10) / 2);
                    modifierElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                }

                this.updateAttributePointsRemaining();
                this.updatePreview();
                this.updateAttributeButtonStates();
            });
        });

        // Inicializar brillo de botones
        this.updateAttributeButtonStates();

        // Botón de estadísticas aleatorias (point buy legal)
        if (this.randomStatsBtn) {
            this.randomStatsBtn.addEventListener('click', () => {
                const attrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                const system = this.attributeSystems[this.currentAttributeSystem];
                const minAttr = system.minAttr;
                const maxAttr = system.maxAttr;
                const pointsLimit = system.pointsLimit;
                
                let values = Array(6).fill(minAttr);
                
                // Generar valores aleatorios válidos para point buy
                for (let i = 0; i < 1000; i++) {
                    let temp = Array(6).fill(minAttr);
                    let pts = pointsLimit;
                    
                    // Sube aleatoriamente atributos mientras haya puntos
                    while (pts > 0) {
                        let idx = Math.floor(Math.random() * 6);
                        if (temp[idx] < maxAttr) {
                            let cost = this.pointBuyCost(temp[idx] + 1) - this.pointBuyCost(temp[idx]);
                            if (pts - cost >= 0) {
                                temp[idx]++;
                                pts -= cost;
                            } else {
                                break;
                            }
                        }
                    }
                    // Si es una distribución válida, la usamos
                    if (pts >= 0) {
                        values = temp;
                        break;
                    }
                }
                attrs.forEach((attr, i) => {
                    const input = document.getElementById(attr);
                    if (input) {
                        input.value = values[i];
                        const modifierElement = document.getElementById(`${attr}-modifier`);
                        if (modifierElement) {
                            const modifier = Math.floor((values[i] - 10) / 2);
                            modifierElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                        }
                    }
                });
                this.updateAttributePointsRemaining();
                this.updatePreview();
                this.updateAttributeButtonStates();
            });
        }

        // Botón de restaurar por defecto (valores mínimos del sistema actual)
        if (this.defaultStatsBtn) {
            this.defaultStatsBtn.addEventListener('click', () => {
                const attrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                const system = this.attributeSystems[this.currentAttributeSystem];
                const defaultValue = system.minAttr;
                
                attrs.forEach(attr => {
                    const input = document.getElementById(attr);
                    if (input) {
                        input.value = defaultValue;
                        const modifierElement = document.getElementById(`${attr}-modifier`);
                        if (modifierElement) {
                            const modifier = Math.floor((defaultValue - 10) / 2);
                            modifierElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                        }
                    }
                });
                this.updateAttributePointsRemaining();
                this.updatePreview();
                this.updateAttributeButtonStates();
            });
        }
    }

    // Cambia el brillo de los botones de sumar/restar según el valor actual
    updateAttributeButtonStates() {
        const system = this.attributeSystems[this.currentAttributeSystem];
        const minAttr = system.minAttr;
        const maxAttr = system.maxAttr;
        const attrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        attrs.forEach(attr => {
            const input = document.getElementById(attr);
            if (!input) return;
            const value = parseInt(input.value);
            const btnInc = document.querySelector(`.attribute-btn.increase[data-attribute="${attr}"]`);
            const btnDec = document.querySelector(`.attribute-btn.decrease[data-attribute="${attr}"]`);
            if (btnInc) {
                if (value >= maxAttr) {
                    btnInc.classList.add('at-max');
                } else {
                    btnInc.classList.remove('at-max');
                }
            }
            if (btnDec) {
                if (value <= minAttr) {
                    btnDec.classList.add('at-min');
                } else {
                    btnDec.classList.remove('at-min');
                }
            }
        });
    }

    // Calcula el coste de un valor de atributo según el sistema actual
    pointBuyCost(val) {
        return this.attributeSystems[this.currentAttributeSystem].pointBuyCostFunction(val);
    }

    getTotalAttributePoints(values) {
        // Si recibe valores, calcula el coste de esos valores, si no, de los inputs actuales
        const attrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        let total = 0;
        if (!values) {
            values = attrs.map(attr => parseInt(document.getElementById(attr).value));
        }
        for (let i = 0; i < 6; i++) {
            total += this.pointBuyCost(values[i]);
        }
        return total;
    }

    updateAttributePointsRemaining() {
        const pointsLimit = this.attributeSystems[this.currentAttributeSystem].pointsLimit;
        const used = this.getTotalAttributePoints();
        const el = document.getElementById('points-remaining') || this.attributePointsRemaining;
        if (el) {
            el.textContent = pointsLimit - used;
        }
    }
    
    setupLevelExperienceControls() {
        // Inicializar modificadores para nivel y experiencia
        const levelInput = document.getElementById('level');
        if (levelInput) {
            // Establecer tipo de modificador
            levelInput.dataset.modifierType = 'proficiency';
            
            // Inicializar valor del modificador
            const levelModifier = document.getElementById('level-modifier');
            if (levelModifier) {
                const level = parseInt(levelInput.value) || 1;
                const profBonus = Math.ceil(level / 4) + 1;
                levelModifier.textContent = `+${profBonus}`;
            }
        }
        
        // Configurar experiencia
        const expInput = document.getElementById('experience');
        if (expInput) {
            // Establecer tipo de modificador
            expInput.dataset.modifierType = 'level';
            
            // Inicializar valor del modificador
            const expModifier = document.getElementById('experience-modifier');
            if (expModifier) {
                const exp = parseInt(expInput.value) || 0;
                const estimatedLevel = Math.min(20, Math.max(1, Math.floor(Math.sqrt(exp / 100))));
                expModifier.textContent = `Lvl ${estimatedLevel}`;
            }
        }
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
            
            // Poblar selects
            this.populateSelect(this.selects.race, data.races);
            this.populateSelect(this.selects.class, data.classes);
            this.populateSelect(this.selects.background, data.backgrounds);
            this.populateSelect(this.selects.alignment, data.alignments);
            
            // Poblar listas
            this.populateSkills(data.skills);
            this.populateLanguages(data.languages);
            this.populateProficiencies(data.proficiencies);
            this.populateEquipment(data.items);
            this.populateSpells(data.spells);
        } catch (err) {
            console.error('Error loading data:', err);
            this.showError('Error cargando datos de la API.');
        }
    }

    setupNavigation() {
        this.tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.tabs.forEach(t => t.classList.remove('active'));
                this.sections.forEach(s => s.classList.add('hidden'));
                tab.classList.add('active');
                this.sections[index].classList.remove('hidden');
                
                // Actualizar progreso
                const progressFill = document.getElementById('progress-fill');
                if (progressFill) {
                    const progress = ((index + 1) / this.tabs.length) * 100;
                    progressFill.style.width = `${progress}%`;
                }
                
                const progressText = document.getElementById('progress-text');
                if (progressText) {
                    progressText.textContent = `Paso ${index + 1} de ${this.tabs.length}`;
                }
                
                // Actualizar botones de navegación
                const prevBtn = document.getElementById('prev-step-btn');
                const nextBtn = document.getElementById('next-step-btn');
                const createBtn = document.getElementById('create-character-btn');
                
                if (prevBtn) {
                    prevBtn.disabled = index === 0;
                }
                
                if (nextBtn && createBtn) {
                    if (index === this.tabs.length - 1) {
                        nextBtn.classList.add('hidden');
                        createBtn.classList.remove('hidden');
                    } else {
                        nextBtn.classList.remove('hidden');
                        createBtn.classList.add('hidden');
                    }
                }
            });
        });
    }

    populateSelect(select, options) {
        if (!select) return;
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.id;
            option.textContent = opt.name;
            select.appendChild(option);
        });
    }

    populateSkills(skills) {
        const container = this.containers.skillsList;
        if (!container) return;
        
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
            });
            
            container.appendChild(skillItem);
        });
    }

    populateLanguages(languages) {
        const container = this.containers.languagesList;
        if (!container) return;
        
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
            });
            
            container.appendChild(languageItem);
        });
    }

    populateProficiencies(proficiencies) {
        const container = this.containers.proficienciesList;
        if (!container) return;
        
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
            });
            
            container.appendChild(proficiencyItem);
        });
    }

    populateEquipment(items) {
        const startingContainer = this.containers.startingEquipmentList;
        const additionalContainer = this.containers.additionalEquipmentList;
        
        if (!startingContainer || !additionalContainer) return;
        const startingItems = items.filter(item => ['weapon', 'armor', 'gear'].includes(item.type));
        const additionalItems = items.filter(item => item.type === 'magic' || item.rarity !== 'common');
        startingItems.forEach(item => {
            const itemElement = this.createEquipmentItem(item);
            startingContainer.appendChild(itemElement);
        });
        additionalItems.forEach(item => {
            const itemElement = this.createEquipmentItem(item);
            additionalContainer.appendChild(itemElement);
        });
    }

    createEquipmentItem(item) {
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
        rarity.textContent = ` (${item.rarity})`;
        
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
        });
        
        return itemElement;
    }

    populateSpells(spells) {
        const container = this.containers.spellsList;
        if (!container) return;
        const spellsByLevel = {};
        
        spells.forEach(spell => {
            const level = spell.level || 0;
            if (!spellsByLevel[level]) {
                spellsByLevel[level] = [];
            }
            spellsByLevel[level].push(spell);
        });
        Object.entries(spellsByLevel).sort((a, b) => a[0] - b[0]).forEach(([level, levelSpells]) => {
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
                });
                
                levelContainer.appendChild(spellItem);
            });
            
            container.appendChild(levelContainer);
        });
    }

    setupPreview() {
        this.updatePreview();
    }

    updatePreview() {
        const namePreview = document.getElementById('preview-name');
        const characterName = document.getElementById('character-name');
        if (namePreview && characterName) {
            namePreview.textContent = characterName.value || 'Not set';
        }
        const racePreview = document.getElementById('preview-race');
        const race = document.getElementById('race');
        if (racePreview && race) {
            racePreview.textContent = race.options[race.selectedIndex].text !== 'Select a race' ? 
                race.options[race.selectedIndex].text : 'Not set';
        }
        const classPreview = document.getElementById('preview-class');
        const charClass = document.getElementById('character-class');
        if (classPreview && charClass) {
            classPreview.textContent = charClass.options[charClass.selectedIndex].text !== 'Select a class' ? 
                charClass.options[charClass.selectedIndex].text : 'Not set';
        }
        const levelPreview = document.getElementById('preview-level');
        const level = document.getElementById('level');
        if (levelPreview && level) {
            levelPreview.textContent = level.value;
        }
        const attributes = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        attributes.forEach(attr => {
            const fullAttr = {
                'str': 'strength',
                'dex': 'dexterity',
                'con': 'constitution',
                'int': 'intelligence',
                'wis': 'wisdom',
                'cha': 'charisma'
            }[attr];
            
            const attrPreview = document.getElementById(`preview-${attr}`);
            const attrInput = document.getElementById(fullAttr);
            
            if (attrPreview && attrInput) {
                const value = parseInt(attrInput.value) || 0;
                const modifier = Math.floor((value - 10) / 2);
                attrPreview.textContent = `${value} (${modifier >= 0 ? '+' : ''}${modifier})`;
            }
        });
    }

    showError(msg) {
        console.error(msg);
        alert(msg);
    }
    
    // Configura el selector de sistemas de atributos
    setupAttributeSystemSelector() {
        if (this.selects.attributeSystem) {
            const customConfig = document.getElementById('custom-attribute-config');
            
            // Manejo del cambio de sistema de atributos
            this.selects.attributeSystem.addEventListener('change', () => {
                this.currentAttributeSystem = this.selects.attributeSystem.value;
                
                // Mostrar/ocultar configuración personalizada
                if (this.currentAttributeSystem === 'custom') {
                    customConfig.style.display = 'block';
                } else {
                    customConfig.style.display = 'none';
                }
                
                // Actualizar límites de los atributos
                this.updateAttributeLimits();
                
                // Recalcular puntos restantes
                this.updateAttributePointsRemaining();
                
                // Actualizar estado de los botones
                this.updateAttributeButtonStates();
            });
            
            // Configuración personalizada
            const customMin = document.getElementById('custom-min');
            const customMax = document.getElementById('custom-max');
            
            if (customMin && customMax) {
                customMin.addEventListener('change', () => {
                    const minVal = parseInt(customMin.value);
                    const maxVal = parseInt(customMax.value);
                    
                    if (minVal >= 1 && minVal <= maxVal) {
                        this.attributeSystems.custom.minAttr = minVal;
                        this.updateAttributeLimits();
                        this.updateAttributePointsRemaining();
                        this.updateAttributeButtonStates();
                    } else {
                        customMin.value = this.attributeSystems.custom.minAttr;
                    }
                });
                
                customMax.addEventListener('change', () => {
                    const minVal = parseInt(customMin.value);
                    const maxVal = parseInt(customMax.value);
                    
                    if (maxVal >= minVal && maxVal <= 30) {
                        this.attributeSystems.custom.maxAttr = maxVal;
                        this.updateAttributeLimits();
                        this.updateAttributePointsRemaining();
                        this.updateAttributeButtonStates();
                    } else {
                        customMax.value = this.attributeSystems.custom.maxAttr;
                    }
                });
            }
        }
    }
    
    // Actualiza los límites de los atributos según el sistema seleccionado
    updateAttributeLimits() {
        const system = this.attributeSystems[this.currentAttributeSystem];
        const attrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        attrs.forEach(attr => {
            const input = document.getElementById(attr);
            if (input) {
                // Asegurar que los valores estén dentro de los nuevos límites
                const currentVal = parseInt(input.value);
                if (currentVal < system.minAttr) {
                    input.value = system.minAttr;
                    const modifierElement = document.getElementById(`${attr}-modifier`);
                    if (modifierElement) {
                        const modifier = Math.floor((system.minAttr - 10) / 2);
                        modifierElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                    }
                } else if (currentVal > system.maxAttr) {
                    input.value = system.maxAttr;
                    const modifierElement = document.getElementById(`${attr}-modifier`);
                    if (modifierElement) {
                        const modifier = Math.floor((system.maxAttr - 10) / 2);
                        modifierElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                    }
                }
            }
        });
    }
    
    // Actualiza el texto de los botones según el sistema seleccionado
    updateAttributeButtonLabels() {
        if (this.randomStatsBtn) {
            const systemName = this.attributeSystems[this.currentAttributeSystem].name;
            this.randomStatsBtn.innerHTML = `<i class="icon-dice"></i> ${systemName}`;
        }
        
        if (this.defaultStatsBtn) {
            const system = this.attributeSystems[this.currentAttributeSystem];
            this.defaultStatsBtn.innerHTML = `<i class="icon-reset"></i> ${system.minAttr}`;
        }
    }
}

// Inicializar el creador de personajes
const characterCreator = new CharacterCreator();
    