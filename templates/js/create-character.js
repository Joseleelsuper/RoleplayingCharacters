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
    initFormResetHandler();
    initFormSubmitHandler();
    initCustomSelectHandlers();
    
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
});

// Inicializar los selectores personalizados
function initCustomSelectHandlers() {
    // Configurar los selectores para Raza, Background y Alignment
    setupCustomSelect('race');
    setupCustomSelect('background');
    setupCustomSelect('alignment');

    // Configurar los botones para añadir opciones personalizadas
    setupCustomOptionAdders();
}

function setupCustomSelect(type) {
    const container = document.getElementById(`${type}-container`);
    const display = document.getElementById(`${type}-display`);
    const options = document.getElementById(`${type}-options`);
    const search = document.getElementById(`${type}-search`);
    const hiddenInput = document.getElementById(`character-${type}`);
    
    // Abrir/cerrar al hacer clic en el display
    display.addEventListener('click', () => {
        container.classList.toggle('active');
        if (container.classList.contains('active')) {
            search.focus();
        }
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            container.classList.remove('active');
        }
    });
    
    // Filtrar opciones al escribir en el buscador
    search.addEventListener('input', () => {
        const filter = search.value.toLowerCase();
        const optionElements = options.querySelectorAll('.select-option');
        
        optionElements.forEach(option => {
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(filter) ? 'flex' : 'none';
        });
    });
}

function setupCustomOptionAdders() {
    setupCustomOptionAdder('race');
    setupCustomOptionAdder('background');
    setupCustomOptionAdder('alignment');
}

function setupCustomOptionAdder(type) {
    const addButton = document.getElementById(`add-custom-${type}`);
    const customInput = document.getElementById(`custom-${type}`);
    const optionsContainer = document.getElementById(`${type}-options`);
    
    addButton.addEventListener('click', () => {
        const customValue = customInput.value.trim();
        if (customValue) {
            // Generar un ID único para esta opción personalizada
            const customId = `custom_${type}_${Date.now()}`;
            
            // Añadir a la lista de opciones personalizadas
            state.customOptions[type + 's'].push({
                id: customId,
                name: customValue
            });
            
            // Crear y añadir elemento de opción
            const optionElement = createOptionElement(customId, customValue, type);
            optionsContainer.appendChild(optionElement);
            
            // Limpiar el campo de entrada
            customInput.value = '';
            
            // Seleccionar automáticamente la opción recién creada
            optionElement.click();
        }
    });
}

function createOptionElement(id, name, type) {
    const option = document.createElement('div');
    option.className = 'select-option';
    option.dataset.id = id;
    option.textContent = name;
    
    // Añadir evento de clic para seleccionar esta opción
    option.addEventListener('click', () => {
        selectOption(type, id, name);
    });
    
    return option;
}

function selectOption(type, id, name) {
    // Actualizar el valor mostrado
    const display = document.getElementById(`${type}-display`);
    display.querySelector('span').textContent = name;
    
    // Actualizar el input oculto con el valor seleccionado
    const hiddenInput = document.getElementById(`character-${type}`);
    hiddenInput.value = id;
    
    // Actualizar el estado
    state[`selected${type.charAt(0).toUpperCase() + type.slice(1)}`] = {
        id: id,
        name: name
    };
    
    // Marcar esta opción como seleccionada
    const container = document.getElementById(`${type}-container`);
    const options = container.querySelectorAll('.select-option');
    
    options.forEach(opt => {
        opt.classList.remove('selected');
    });
    
    container.querySelector(`.select-option[data-id="${id}"]`).classList.add('selected');
    
    // Cerrar el menú
    container.classList.remove('active');
}

// Manejadores de eventos
function initAttributeHandlers() {
    ATTRIBUTES.forEach(attr => {
        const input = document.getElementById(`attribute-${attr}`);
        const modifier = document.getElementById(`modifier-${attr}`);
        
        input.addEventListener('input', () => {
            const value = parseInt(input.value) || 10;
            
            // Validar el rango
            if (value < 3) input.value = 3;
            if (value > 20) input.value = 20;
            
            // Actualizar el estado y el modificador
            const newValue = parseInt(input.value);
            updateAttributeValue(attr, newValue);
            updateModifierDisplay(attr);
        });
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
    const optionsContainer = document.getElementById(`${type}-options`);
    
    // Limpiar opciones existentes
    optionsContainer.innerHTML = '';
    
    // Añadir nuevas opciones
    items.forEach(item => {
        const optionElement = createOptionElement(item.id, item.name, type);
        optionsContainer.appendChild(optionElement);
    });
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

function updateAttributeValue(attribute, newValue) {
    const oldValue = state.attributes[attribute];
    const oldCost = getPointCost(oldValue);
    const newCost = getPointCost(newValue);
    const pointDifference = newCost - oldCost;
    
    // Verificar si hay suficientes puntos
    if (state.remainingPoints - pointDifference < 0 && newValue > oldValue) {
        // Restaurar el valor anterior si no hay suficientes puntos
        document.getElementById(`attribute-${attribute}`).value = oldValue;
        alert(getTranslation('create.character.error.not.enough.points'));
        return;
    }
    
    // Actualizar el estado
    state.attributes[attribute] = newValue;
    state.remainingPoints -= pointDifference;
    
    // Actualizar la UI
    document.getElementById('points-remaining').textContent = state.remainingPoints;
}

function updateModifierDisplay(attribute) {
    const value = state.attributes[attribute];
    const modifier = Math.floor((value - 10) / 2);
    const modifierElement = document.getElementById(`modifier-${attribute}`);
    
    modifierElement.textContent = modifier >= 0 ? `+${modifier}` : modifier;
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
