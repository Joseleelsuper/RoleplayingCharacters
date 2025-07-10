// Constantes
const ATTRIBUTES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
const POINT_BUY_COSTS = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};
const TOTAL_ATTRIBUTE_POINTS = 27;

// Estado de la aplicación
const state = {
    remainingPoints: TOTAL_ATTRIBUTE_POINTS,
    attributes: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10, 
        wisdom: 10,
        charisma: 10
    },
    selectedRace: null,
    selectedBackground: null,
    selectedAlignment: null,
    selectedSkills: [],
    selectedLanguages: [],
    selectedProficiencies: [],
    selectedSpells: [],
    selectedItems: [],
    customOptions: {
        races: [],
        backgrounds: [],
        alignments: []
    }
};

// Funciones de inicialización
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar los controladores de eventos
    initAttributeHandlers();
    initNumberInputHandlers();
    initFormResetHandler();
    initFormSubmitHandler();
    initCustomSelectHandlers();
    initCheckboxItemHandlers();
    
    // Cargar datos iniciales
    await Promise.all([
        fetchRaces(),
        fetchBackgrounds(),
        fetchAlignments(),
        fetchSkills(),
        fetchLanguages(),
        fetchProficiencies(),
        fetchSpells(),
        fetchItems()
    ]);
    
    // Inicializar el estado de todos los controles numéricos
    initializeAllNumberControls();
});

// Inicializar los selectores personalizados
function initCustomSelectHandlers() {
    // Configurar los manejadores de eventos para las nuevas opciones tipo radio
    setupBasicOptionHandlers('race');
    setupBasicOptionHandlers('background');
    setupBasicOptionHandlers('alignment');
}

function setupBasicOptionHandlers(type) {
    const container = document.getElementById(`${type}-container`);
    
    if (container) {
        container.addEventListener('click', (e) => {
            const optionItem = e.target.closest('.basic-option-item');
            if (optionItem) {
                const radioInput = optionItem.querySelector('input[type="radio"]');
                const hiddenInput = document.getElementById(`selected-${type}`);
                
                if (radioInput && hiddenInput) {
                    // Seleccionar este radio button
                    radioInput.checked = true;
                    
                    // Actualizar el input oculto
                    hiddenInput.value = radioInput.value;
                    
                    // Actualizar las clases visuales
                    container.querySelectorAll('.basic-option-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    optionItem.classList.add('selected');
                    
                    // Actualizar el estado
                    const optionName = optionItem.querySelector('label').textContent;
                    state[`selected${type.charAt(0).toUpperCase() + type.slice(1)}`] = {
                        id: radioInput.value,
                        name: optionName
                    };
                }
            }
        });
    }
}

// Manejadores de eventos
function initAttributeHandlers() {
    ATTRIBUTES.forEach(attr => {
        const input = document.getElementById(`attribute-${attr}`);
        const modifier = document.getElementById(`modifier-${attr}`);
        
        // Inicializar estado de botones
        updateNumberButtonStates(input);
        
        // Manejar cambios directos en el input (aunque esté readonly)
        input.addEventListener('input', () => {
            const value = parseInt(input.value) || 10;
            
            // Validar el rango
            if (value < 3) input.value = 3;
            if (value > 20) input.value = 20;
            
            // Actualizar el estado y el modificador
            const newValue = parseInt(input.value);
            updateAttributeValue(attr, newValue);
            updateModifierDisplay(attr);
            updateNumberButtonStates(input);
        });
    });
    
    // Inicializar todos los estados
    updateAttributePointsDisplay();
}

function initNumberInputHandlers() {
    // Manejar todos los botones de número
    document.querySelectorAll('.number-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.dataset.target;
            const step = parseInt(button.dataset.step);
            const input = document.getElementById(targetId);
            
            if (input) {
                changeNumberValue(input, step);
                
                // Si es un atributo, actualizar el modificador
                if (targetId.startsWith('attribute-')) {
                    const attr = targetId.replace('attribute-', '');
                    updateModifierDisplay(attr);
                }
            }
        });
    });
}

function changeNumberValue(input, step) {
    const currentValue = parseInt(input.value) || 0;
    const min = parseInt(input.min) || 0;
    const max = parseInt(input.max) || 100;
    
    let newValue = currentValue + step;
    
    // Aplicar límites
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    
    // Actualizar el valor
    input.value = newValue;
    
    // Disparar evento de cambio para mantener compatibilidad
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Actualizar botones de estado
    updateNumberButtonStates(input);
    
    // Si es un atributo, manejar el sistema de puntos
    if (input.id.startsWith('attribute-')) {
        const attr = input.id.replace('attribute-', '');
        const oldValue = state.attributes[attr];
        updateAttributeValue(attr, newValue);
    }
}

function updateNumberButtonStates(input) {
    const container = input.closest('.number-input-container');
    if (!container) return;
    
    const currentValue = parseInt(input.value);
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    
    // Actualizar botones de decremento
    const decreaseButtons = container.querySelectorAll('.decrease-1, .decrease-5');
    decreaseButtons.forEach(btn => {
        const step = Math.abs(parseInt(btn.dataset.step));
        btn.disabled = (currentValue - step) < min;
    });
    
    // Actualizar botones de incremento
    const increaseButtons = container.querySelectorAll('.increase-1, .increase-5');
    increaseButtons.forEach(btn => {
        const step = parseInt(btn.dataset.step);
        btn.disabled = (currentValue + step) > max;
    });
}

function initFormResetHandler() {
    const resetButton = document.getElementById('reset-form');
    resetButton.addEventListener('click', () => {
        if (confirm(getTranslation('create.character.confirm.reset'))) {
            resetForm();
        }
    });
}

function initFormSubmitHandler() {
    const form = document.getElementById('character-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = collectFormData();
            
            // Validar datos del formulario
            if (!validateFormData(formData)) {
                return;
            }
            
            // Enviar datos al servidor
            await saveCharacter(formData);
            
            // Redireccionar o mostrar mensaje de éxito
            alert(getTranslation('create.character.success.message'));
            window.location.href = '/characters'; // Redireccionar a la lista de personajes
        } catch (error) {
            console.error('Error al guardar el personaje:', error);
            alert(getTranslation('create.character.error.message'));
        }
    });
}

// Funciones para cargar datos del servidor
async function fetchRaces() {
    try {
        const response = await fetch('/api/races');
        if (!response.ok) throw new Error('Failed to fetch races');
        
        const races = await response.json();
        populateCustomSelect('race', races);
    } catch (error) {
        console.error('Error loading races:', error);
        // Usar datos fallback para desarrollo
        const fallbackRaces = [
            { id: '1', name: 'Human' },
            { id: '2', name: 'Elf' },
            { id: '3', name: 'Dwarf' },
            { id: '4', name: 'Halfling' },
            { id: '5', name: 'Gnome' }
        ];
        populateCustomSelect('race', fallbackRaces);
    }
}

async function fetchBackgrounds() {
    try {
        const response = await fetch('/api/backgrounds');
        if (!response.ok) throw new Error('Failed to fetch backgrounds');
        
        const backgrounds = await response.json();
        populateCustomSelect('background', backgrounds);
    } catch (error) {
        console.error('Error loading backgrounds:', error);
        // Usar datos fallback para desarrollo
        const fallbackBackgrounds = [
            { id: '1', name: 'Noble' },
            { id: '2', name: 'Acolyte' },
            { id: '3', name: 'Criminal' },
            { id: '4', name: 'Soldier' },
            { id: '5', name: 'Sage' }
        ];
        populateCustomSelect('background', fallbackBackgrounds);
    }
}

async function fetchAlignments() {
    try {
        const response = await fetch('/api/alignments');
        if (!response.ok) throw new Error('Failed to fetch alignments');
        
        const alignments = await response.json();
        populateCustomSelect('alignment', alignments);
    } catch (error) {
        console.error('Error loading alignments:', error);
        // Usar datos fallback para desarrollo
        const fallbackAlignments = [
            { id: '1', name: 'Lawful Good' },
            { id: '2', name: 'Neutral Good' },
            { id: '3', name: 'Chaotic Good' },
            { id: '4', name: 'Lawful Neutral' },
            { id: '5', name: 'True Neutral' },
            { id: '6', name: 'Chaotic Neutral' },
            { id: '7', name: 'Lawful Evil' },
            { id: '8', name: 'Neutral Evil' },
            { id: '9', name: 'Chaotic Evil' }
        ];
        populateCustomSelect('alignment', fallbackAlignments);
        showErrorMessage('alignments-container', 'create.character.error.alignments');
    }
}

async function fetchSkills() {
    try {
        const response = await fetch('/api/skills');
        if (!response.ok) throw new Error('Failed to fetch skills');
        
        const skills = await response.json();
        populateCheckboxList('skills-container', skills, 'skill');
    } catch (error) {
        console.error('Error loading skills:', error);
        showErrorMessage('skills-container', 'create.character.error.skills');
    }
}

async function fetchLanguages() {
    try {
        const response = await fetch('/api/languages');
        if (!response.ok) throw new Error('Failed to fetch languages');
        
        const languages = await response.json();
        populateCheckboxList('languages-container', languages, 'language');
    } catch (error) {
        console.error('Error loading languages:', error);
        showErrorMessage('languages-container', 'create.character.error.languages');
    }
}

async function fetchProficiencies() {
    try {
        const response = await fetch('/api/proficiencies');
        if (!response.ok) throw new Error('Failed to fetch proficiencies');
        
        const proficiencies = await response.json();
        populateCheckboxList('proficiencies-container', proficiencies, 'proficiency');
    } catch (error) {
        console.error('Error loading proficiencies:', error);
        showErrorMessage('proficiencies-container', 'create.character.error.proficiencies');
    }
}

async function fetchSpells() {
    try {
        const response = await fetch('/api/spells');
        if (!response.ok) throw new Error('Failed to fetch spells');
        
        const spells = await response.json();
        populateCheckboxList('spells-container', spells, 'spell');
    } catch (error) {
        console.error('Error loading spells:', error);
        showErrorMessage('spells-container', 'create.character.error.spells');
    }
}

async function fetchItems() {
    try {
        const response = await fetch('/api/items');
        if (!response.ok) throw new Error('Failed to fetch items');
        
        const items = await response.json();
        populateCheckboxList('items-container', items, 'item');
    } catch (error) {
        console.error('Error loading items:', error);
        showErrorMessage('items-container', 'create.character.error.items');
    }
}

// Funciones de utilidad
function populateCustomSelect(type, items) {
    const container = document.getElementById(`${type}-container`);
    
    if (!container) {
        console.error(`Container ${type}-container not found`);
        return;
    }
    
    // Limpiar opciones existentes
    container.innerHTML = '';
    
    // Añadir nuevas opciones como radio buttons
    items.forEach((item, index) => {
        const optionElement = createBasicOptionElement(item.id, item.name, type, index === 0);
        container.appendChild(optionElement);
    });
}

function createBasicOptionElement(id, name, type, isDefault = false) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'basic-option-item';
    
    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.id = `${type}-${id}`;
    radioInput.name = `${type}`;
    radioInput.value = id;
    
    const label = document.createElement('label');
    label.htmlFor = `${type}-${id}`;
    label.textContent = name;
    
    itemDiv.appendChild(radioInput);
    itemDiv.appendChild(label);
    
    // Si es la primera opción (por defecto), seleccionarla
    if (isDefault) {
        radioInput.checked = true;
        itemDiv.classList.add('selected');
        const hiddenInput = document.getElementById(`selected-${type}`);
        if (hiddenInput) {
            hiddenInput.value = id;
        }
        // Actualizar el estado
        state[`selected${type.charAt(0).toUpperCase() + type.slice(1)}`] = {
            id: id,
            name: name
        };
    }
    
    return itemDiv;
}

function populateSelect(selectId, items) {
    const select = document.getElementById(selectId);
    const defaultOption = select.querySelector('option');
    
    // Limpiar opciones existentes excepto la primera (opción por defecto)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Añadir nuevas opciones
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
    });
    
    // Evento de cambio
    select.addEventListener('change', () => {
        const itemId = select.value;
        if (selectId === 'character-race') {
            state.selectedRace = items.find(r => r.id == itemId) || null;
            updateRacialBonuses();
        } else if (selectId === 'character-background') {
            state.selectedBackground = items.find(b => b.id == itemId) || null;
            updateBackgroundBonuses();
        }
    });
}

function populateCheckboxList(containerId, items, itemType) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Limpiar el contenedor
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `${itemType}-item`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${itemType}-${item.id}`;
        checkbox.name = `${itemType}s[${item.id}]`;
        checkbox.value = item.id;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = item.name;
        
        itemElement.appendChild(checkbox);
        itemElement.appendChild(label);
        container.appendChild(itemElement);
        
        // Evento de cambio
        checkbox.addEventListener('change', () => {
            const stateKey = `selected${capitalizeFirstLetter(itemType)}s`;
            if (checkbox.checked) {
                state[stateKey].push(item.id);
            } else {
                state[stateKey] = state[stateKey].filter(id => id !== item.id);
            }
        });
    });
}

// Función para manejar los clics en los elementos seleccionables tipo checkbox
function initCheckboxItemHandlers() {
    // Manejador para habilidades, idiomas, competencias, hechizos e items
    const containers = [
        'skills-container',
        'languages-container',
        'proficiencies-container',
        'spells-container',
        'items-container'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.addEventListener('click', (e) => {
                const itemElement = e.target.closest('.skill-item, .language-item, .proficiency-item, .spell-item, .item-item');
                if (!itemElement) return;
                
                const checkbox = itemElement.querySelector('input[type="checkbox"]');
                if (!checkbox) return;
                
                // Alternar el estado del checkbox
                checkbox.checked = !checkbox.checked;
                
                // Disparar el evento change para activar los listeners
                checkbox.dispatchEvent(new Event('change'));
                
                // Actualizar la clase visual
                if (checkbox.checked) {
                    itemElement.classList.add('selected');
                } else {
                    itemElement.classList.remove('selected');
                }
            });
        }
    });
}

function updateAttributeValue(attr, newValue) {
    const oldValue = state.attributes[attr];
    
    // Si es el mismo valor, no hacemos nada
    if (oldValue === newValue) return;
    
    // Calcular el costo en puntos del cambio
    let pointDiff = 0;
    
    // Si estamos usando el sistema de point buy para los atributos
    if (document.getElementById('attribute-points-container')) {
        // Solo aplicar el sistema de point buy para valores entre 8 y 15
        if (oldValue >= 8 && oldValue <= 15) {
            pointDiff -= POINT_BUY_COSTS[oldValue];
        }
        
        if (newValue >= 8 && newValue <= 15) {
            pointDiff += POINT_BUY_COSTS[newValue];
        }
        
        // Verificar si tenemos suficientes puntos
        if (state.remainingPoints - pointDiff < 0) {
            // No hay suficientes puntos, revertir al valor anterior
            document.getElementById(`attribute-${attr}`).value = oldValue;
            return;
        }
        
        // Actualizar los puntos restantes
        state.remainingPoints -= pointDiff;
        updateAttributePointsDisplay();
    }
    
    // Actualizar el estado
    state.attributes[attr] = newValue;
}

function updateModifierDisplay(attr) {
    const value = state.attributes[attr];
    const modifier = Math.floor((value - 10) / 2);
    const modifierDisplay = document.getElementById(`modifier-${attr}`);
    
    if (modifierDisplay) {
        modifierDisplay.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        
        // Añadir clases de color según el valor del modificador
        modifierDisplay.className = 'attribute-modifier';
        if (modifier > 0) {
            modifierDisplay.classList.add('positive');
        } else if (modifier < 0) {
            modifierDisplay.classList.add('negative');
        }
    }
}

function getPointCost(attributeValue) {
    if (attributeValue < 8) return 0;
    if (attributeValue > 15) return POINT_BUY_COSTS[15] + (attributeValue - 15) * 2;
    return POINT_BUY_COSTS[attributeValue] || 0;
}

function updateRacialBonuses() {
    // Implementar lógica para aplicar bonificaciones raciales a los atributos
    if (state.selectedRace && state.selectedRace.attributeBonuses) {
        // Aquí se aplicarían los bonus raciales a los atributos
    }
}

function updateBackgroundBonuses() {
    // Implementar lógica para aplicar bonificaciones de trasfondo
    if (state.selectedBackground && state.selectedBackground.proficiencies) {
        // Aquí se seleccionarían automáticamente las competencias del trasfondo
    }
}

function resetForm() {
    // Resetear el formulario y el estado
    document.getElementById('character-form').reset();
    
    // Resetear los atributos a 10
    ATTRIBUTES.forEach(attr => {
        document.getElementById(`attribute-${attr}`).value = 10;
        state.attributes[attr] = 10;
        updateModifierDisplay(attr);
    });
    
    // Resetear puntos restantes
    state.remainingPoints = TOTAL_ATTRIBUTE_POINTS;
    document.getElementById('points-remaining').textContent = state.remainingPoints;
    
    // Desmarcar todas las casillas
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Resetear el resto del estado
    state.selectedRace = null;
    state.selectedBackground = null;
    state.selectedSkills = [];
    state.selectedLanguages = [];
    state.selectedProficiencies = [];
    state.selectedSpells = [];
    state.selectedItems = [];
}

function collectFormData() {
    const form = document.getElementById('character-form');
    const formData = new FormData(form);
    
    // Construir el objeto de datos
    const character = {
        name: formData.get('name'),
        race_id: parseInt(formData.get('race_id')),
        background_id: parseInt(formData.get('background_id')),
        alignment_id: parseInt(formData.get('alignment_id')),
        level: parseInt(formData.get('level')),
        description: formData.get('description'),
        attributes: {},
        skills: state.selectedSkills,
        languages: state.selectedLanguages,
        proficiencies: state.selectedProficiencies,
        spells: state.selectedSpells,
        items: state.selectedItems
    };
    
    // Añadir atributos
    ATTRIBUTES.forEach(attr => {
        character.attributes[attr] = state.attributes[attr];
    });
    
    return character;
}

function validateFormData(formData) {
    // Validar campos obligatorios
    if (!formData.name) {
        alert(getTranslation('create.character.validation.name.required'));
        return false;
    }
    
    if (!formData.race_id) {
        alert(getTranslation('create.character.validation.race.required'));
        return false;
    }
    
    if (!formData.background_id) {
        alert(getTranslation('create.character.validation.background.required'));
        return false;
    }
    
    if (!formData.alignment_id) {
        alert(getTranslation('create.character.validation.alignment.required'));
        return false;
    }
    
    return true;
}

async function saveCharacter(characterData) {
    const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al guardar el personaje');
    }
    
    return await response.json();
}

function showErrorMessage(containerId, messageKey) {
    const container = document.getElementById(containerId);
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    errorMessage.textContent = getTranslation(messageKey);
    container.appendChild(errorMessage);
}

function getTranslation(key) {
    // Esta función simula la obtención de traducciones
    // En una implementación real, estas traducciones vendrían del servidor
    // o de un archivo de traducciones cargado en el cliente
    return key; // Devolver la clave como fallback
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Inicializar el estado de todos los controles numéricos
function initializeAllNumberControls() {
    // Inicializar nivel
    const levelInput = document.getElementById('character-level');
    if (levelInput) {
        updateNumberButtonStates(levelInput);
    }
    
    // Inicializar atributos
    ATTRIBUTES.forEach(attr => {
        const input = document.getElementById(`attribute-${attr}`);
        if (input) {
            updateNumberButtonStates(input);
            updateModifierDisplay(attr);
        }
    });
    
    // Actualizar display de puntos disponibles
    updateAttributePointsDisplay();
}

// Función para actualizar la visualización de puntos de atributos restantes
function updateAttributePointsDisplay() {
    const pointsDisplay = document.getElementById('points-remaining');
    if (pointsDisplay) {
        pointsDisplay.textContent = state.remainingPoints;
        
        const container = document.getElementById('attribute-points-container');
        if (container) {
            // Aplicar clases según la cantidad de puntos restantes
            container.className = 'attribute-points-display';
            
            if (state.remainingPoints <= 5) {
                container.classList.add('low-points');
            } else if (state.remainingPoints >= 20) {
                container.classList.add('high-points');
            }
        }
    }
}
