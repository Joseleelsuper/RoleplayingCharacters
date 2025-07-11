/**
 * Script para la página de creación de personajes
 * Este script maneja la lógica de la interfaz de usuario para crear un personaje
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Elementos del DOM
    const form = document.getElementById('character-form');
    const resetButton = document.getElementById('reset-form');
    const saveButton = document.getElementById('save-character');
    
    // Contenedores para opciones
    const raceContainer = document.getElementById('race-container');
    const backgroundContainer = document.getElementById('background-container');
    const alignmentContainer = document.getElementById('alignment-container');
    const skillsContainer = document.getElementById('skills-container');
    const languagesContainer = document.getElementById('languages-container');
    const proficienciesContainer = document.getElementById('proficiencies-container');
    const spellsContainer = document.getElementById('spells-container');
    const itemsContainer = document.getElementById('items-container');
    
    // Campos ocultos para valores seleccionados
    const selectedRace = document.getElementById('selected-race');
    const selectedBackground = document.getElementById('selected-background');
    const selectedAlignment = document.getElementById('selected-alignment');
    
    // Inputs de atributos
    const strengthInput = document.getElementById('attribute-strength');
    const dexterityInput = document.getElementById('attribute-dexterity');
    const constitutionInput = document.getElementById('attribute-constitution');
    const intelligenceInput = document.getElementById('attribute-intelligence');
    const wisdomInput = document.getElementById('attribute-wisdom');
    const charismaInput = document.getElementById('attribute-charisma');
    
    // Modificadores de atributos
    const strengthModifier = document.getElementById('modifier-strength');
    const dexterityModifier = document.getElementById('modifier-dexterity');
    const constitutionModifier = document.getElementById('modifier-constitution');
    const intelligenceModifier = document.getElementById('modifier-intelligence');
    const wisdomModifier = document.getElementById('modifier-wisdom');
    const charismaModifier = document.getElementById('modifier-charisma');
    
    // Función para cargar datos de la API
    async function fetchData(endpoint) {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Error al cargar datos de ${endpoint}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    
    // Función para crear elementos de selección
    function createSelectionItems(container, items, type, selectedInput = null) {
        container.innerHTML = '';
        
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('selection-option');
            
            switch (type) {
                case 'radio':
                    itemDiv.innerHTML = `
                        <input type="radio" id="${type}-${item.id}" name="${type}" value="${item.id}">
                        <label for="${type}-${item.id}">
                            <span class="option-name">${item.name}</span>
                            <span class="option-description">${item.description || ''}</span>
                        </label>
                    `;
                    
                    const radioInput = itemDiv.querySelector('input');
                    radioInput.addEventListener('change', function() {
                        if (selectedInput) {
                            selectedInput.value = this.value;
                        }
                    });
                    break;
                    
                case 'checkbox':
                    itemDiv.innerHTML = `
                        <div class="selection-item">
                            <input type="checkbox" id="${type}-${item.id}" name="${type}[]" value="${item.id}">
                            <label for="${type}-${item.id}" class="item-name">${item.name}</label>
                        </div>
                    `;
                    break;
                    
                default:
                    itemDiv.innerHTML = `
                        <div class="selection-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-description">${item.description || ''}</span>
                        </div>
                    `;
            }
            
            container.appendChild(itemDiv);
        });
    }
    
    // Función para calcular el modificador de atributo
    function calculateModifier(attributeValue) {
        return Math.floor((attributeValue - 10) / 2);
    }
    
    // Función para actualizar los modificadores de atributos
    function updateModifiers() {
        const attributes = [
            { input: strengthInput, display: strengthModifier },
            { input: dexterityInput, display: dexterityModifier },
            { input: constitutionInput, display: constitutionModifier },
            { input: intelligenceInput, display: intelligenceModifier },
            { input: wisdomInput, display: wisdomModifier },
            { input: charismaInput, display: charismaModifier }
        ];
        
        attributes.forEach(attr => {
            if (attr.input && attr.display) {
                const value = parseInt(attr.input.value) || 10;
                const modifier = calculateModifier(value);
                attr.display.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            }
        });
    }
    
    // Manejar botones de incremento/decremento de atributos
    document.querySelectorAll('.number-btn').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const step = parseInt(this.dataset.step);
            const targetInput = document.getElementById(targetId);
            
            if (targetInput) {
                const currentValue = parseInt(targetInput.value) || 0;
                const min = parseInt(targetInput.min) || 0;
                const max = parseInt(targetInput.max) || 30;
                
                const newValue = Math.max(min, Math.min(max, currentValue + step));
                targetInput.value = newValue;
                
                // Si es un atributo, actualizar modificadores
                if (targetId.startsWith('attribute-')) {
                    updateModifiers();
                }
            }
        });
    });
    
    // Cargar datos iniciales
    async function loadInitialData() {
        try {
            // Cargar datos en paralelo
            const [races, backgrounds, alignments, skills, languages, proficiencies, spells, items] = await Promise.all([
                fetchData('/api/races'),
                fetchData('/api/backgrounds'),
                fetchData('/api/alignments'),
                fetchData('/api/skills'),
                fetchData('/api/languages'),
                fetchData('/api/proficiencies'),
                fetchData('/api/spells'),
                fetchData('/api/items')
            ]);
            
            // Crear opciones para cada sección
            createSelectionItems(raceContainer, races, 'radio', selectedRace);
            createSelectionItems(backgroundContainer, backgrounds, 'radio', selectedBackground);
            createSelectionItems(alignmentContainer, alignments, 'radio', selectedAlignment);
            createSelectionItems(skillsContainer, skills, 'checkbox');
            createSelectionItems(languagesContainer, languages, 'checkbox');
            createSelectionItems(proficienciesContainer, proficiencies, 'checkbox');
            
            // Para hechizos, agrupar por nivel
            const spellsByLevel = {};
            spells.forEach(spell => {
                const level = spell.level;
                if (!spellsByLevel[level]) {
                    spellsByLevel[level] = [];
                }
                spellsByLevel[level].push(spell);
            });
            
            const spellsContainerHTML = Object.keys(spellsByLevel).sort((a, b) => a - b).map(level => {
                const levelName = level === "0" ? "Cantrips" : `Level ${level}`;
                
                const spellsHTML = spellsByLevel[level].map(spell => `
                    <div class="selection-item">
                        <input type="checkbox" id="spell-${spell.id}" name="spells[]" value="${spell.id}">
                        <label for="spell-${spell.id}" class="item-name">${spell.name} (${spell.school})</label>
                    </div>
                `).join('');
                
                return `
                    <div class="spell-level-group">
                        <h4 class="spell-level-title">${levelName}</h4>
                        <div class="spells-list">${spellsHTML}</div>
                    </div>
                `;
            }).join('');
            
            spellsContainer.innerHTML = spellsContainerHTML;
            
            // Para items, agrupar por tipo
            const itemsByType = {};
            items.forEach(item => {
                const type = item.type.charAt(0).toUpperCase() + item.type.slice(1);
                if (!itemsByType[type]) {
                    itemsByType[type] = [];
                }
                itemsByType[type].push(item);
            });
            
            const itemsContainerHTML = Object.keys(itemsByType).sort().map(type => {
                const itemsHTML = itemsByType[type].map(item => `
                    <div class="selection-item">
                        <input type="checkbox" id="item-${item.id}" name="items[]" value="${item.id}">
                        <label for="item-${item.id}" class="item-name">${item.name} (${item.rarity})</label>
                    </div>
                `).join('');
                
                return `
                    <div class="item-type-group">
                        <h4 class="item-type-title">${type}</h4>
                        <div class="items-list">${itemsHTML}</div>
                    </div>
                `;
            }).join('');
            
            itemsContainer.innerHTML = itemsContainerHTML;
            
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
        }
    }
    
    // Inicializar modificadores de atributos
    updateModifiers();
    
    // Manejar envío del formulario
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        try {
            // Recoger datos del formulario
            const formData = new FormData(form);
            const characterData = {
                name: formData.get('name'),
                race_id: parseInt(formData.get('race_id')),
                background_id: parseInt(formData.get('background_id')),
                alignment_id: parseInt(formData.get('alignment_id')),
                level: parseInt(formData.get('level')),
                description: formData.get('description') || '',
                attributes: {
                    strength: parseInt(formData.get('attributes[strength]')),
                    dexterity: parseInt(formData.get('attributes[dexterity]')),
                    constitution: parseInt(formData.get('attributes[constitution]')),
                    intelligence: parseInt(formData.get('attributes[intelligence]')),
                    wisdom: parseInt(formData.get('attributes[wisdom]')),
                    charisma: parseInt(formData.get('attributes[charisma]'))
                }
            };
            
            // Recoger arrays de valores (habilidades, idiomas, etc.)
            const skills = Array.from(form.querySelectorAll('input[name="skills[]"]:checked')).map(el => parseInt(el.value));
            const languages = Array.from(form.querySelectorAll('input[name="languages[]"]:checked')).map(el => parseInt(el.value));
            const proficiencies = Array.from(form.querySelectorAll('input[name="proficiencies[]"]:checked')).map(el => parseInt(el.value));
            const spells = Array.from(form.querySelectorAll('input[name="spells[]"]:checked')).map(el => parseInt(el.value));
            const items = Array.from(form.querySelectorAll('input[name="items[]"]:checked')).map(el => parseInt(el.value));
            
            characterData.skills = skills;
            characterData.languages = languages;
            characterData.proficiencies = proficiencies;
            characterData.spells = spells;
            characterData.items = items;
            
            // Enviar datos al servidor
            const response = await fetch('/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(characterData)
            });
            
            if (!response.ok) {
                throw new Error('Error al crear el personaje');
            }
            
            const result = await response.json();
            alert('¡Personaje creado con éxito!');
            
            // Redirigir a la página de inicio
            window.location.href = '/';
            
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            alert('Error al crear el personaje: ' + error.message);
        }
    });
    
    // Resetear formulario
    resetButton.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres reiniciar el formulario? Todos los datos ingresados se perderán.')) {
            form.reset();
            updateModifiers();
        }
    });
    
    // Cargar datos iniciales
    loadInitialData();
});
