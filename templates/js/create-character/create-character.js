/**
 * Archivo principal para la creación de personajes.
 * Integra todos los módulos y coordina la funcionalidad.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    if (window.gameTypeSelector) {
        window.gameTypeSelector.init();
    }
    
    if (window.dataManager) {
        window.dataManager.init();
    }
    
    if (window.attributeManager) {
        window.attributeManager.init();
    }
    
    if (window.previewManager) {
        window.previewManager.init();
    }
    
    if (window.navigationManager) {
        window.navigationManager.init();
    }
    
    if (window.skillManager) {
        window.skillManager.init();
    }
    
    // Prevenir envío del formulario por defecto
    const form = document.getElementById('character-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    }
    
    // Guardar borrador
    const saveDraftBtn = document.getElementById('save-draft-btn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            saveDraft();
        });
    }
    
    // Manejo de eventos de nivel y experiencia
    setupLevelExperienceControls();
    
    // Cargar borrador si existe
    attemptLoadDraft();
});

function setupLevelExperienceControls() {
    // Inicializar modificadores para nivel y experiencia
    const levelInput = document.getElementById('level');
    if (levelInput) {
        // Establecer tipo de modificador
        levelInput.dataset.modifierType = 'proficiency';
        
        // Inicializar valor del modificador
        updateLevelModifier();
        
        // Añadir tooltip informativo
        addLevelTooltip(levelInput);
        
        // Sincronizar valores al cambiar
        levelInput.addEventListener('change', function() {
            updateLevelModifier();
            updateExperienceFromLevel();
            updateExperienceSlider();
            
            // Notificar cambio de nivel
            const level = parseInt(levelInput.value) || 1;
            document.dispatchEvent(new CustomEvent('attributeChanged', {
                detail: {
                    attribute: 'level',
                    value: level
                }
            }));
        });
    }
    
    // Configurar experiencia
    const expInput = document.getElementById('experience');
    if (expInput) {
        // Establecer tipo de modificador
        expInput.dataset.modifierType = 'level';
        
        // Inicializar valor del modificador
        updateExperienceModifier();
        
        // Añadir tooltip informativo
        addExperienceTooltip(expInput);
        
        // Sincronizar valores al cambiar
        expInput.addEventListener('change', function() {
            updateExperienceModifier();
            updateLevelFromExperience();
            updateExperienceSlider();
        });
    }
    
    // Configurar slider de experiencia
    setupExperienceSlider();
    
    // Escuchar cambios de tipo de juego para actualizar tooltips
    document.addEventListener('gameTypeSelected', function() {
        updateLevelModifier();
        updateExperienceModifier();
        updateTooltips();
        updateSystemInfo();
    });
    
    // Inicializar información del sistema
    updateSystemInfo();
    
    // Inicializar sincronización de valores
    initializeLevelExperienceSync();
    
    // Escuchar eventos de cambio de atributos para sincronización automática
    let isUpdating = false; // Flag para evitar bucles infinitos
    
    document.addEventListener('attributeChanged', function(event) {
        if (isUpdating) return; // Evitar bucles infinitos
        
        if (event.detail.attribute === 'level') {
            isUpdating = true;
            // Cuando cambia el nivel, actualizar experiencia automáticamente
            updateExperienceFromLevel();
            updateLevelModifier();
            updateExperienceSlider();
            isUpdating = false;
        } else if (event.detail.attribute === 'experience') {
            isUpdating = true;
            // Cuando cambia la experiencia, actualizar nivel automáticamente
            updateLevelFromExperience();
            updateExperienceModifier();
            updateExperienceSlider();
            isUpdating = false;
        }
    });
}

function updateLevelModifier() {
    const levelInput = document.getElementById('level');
    const levelModifier = document.getElementById('level-modifier');
    
    if (levelInput && levelModifier) {
        const level = parseInt(levelInput.value) || 1;
        const system = getCurrentLevelSystem();
        const profBonus = getProficiencyBonus(level);
        
        // Ajustar el máximo del input según el sistema
        levelInput.max = system.maxLevel;
        
        levelModifier.textContent = `+${profBonus}`;
        levelModifier.title = `Bono de competencia para ${system.name}: +${profBonus}`;
    }
}

function updateExperienceModifier() {
    const expInput = document.getElementById('experience');
    const expModifier = document.getElementById('experience-modifier');
    
    if (expInput && expModifier) {
        const exp = parseInt(expInput.value) || 0;
        const estimatedLevel = calculateLevelFromExp(exp);
        const system = getCurrentLevelSystem();
        
        expModifier.textContent = `Lvl ${estimatedLevel}`;
        
        // Información adicional sobre progreso
        const currentLevelExp = getExperienceForLevel(estimatedLevel);
        const nextLevelExp = getNextLevelExp(estimatedLevel);
        const expToNext = getExpToNextLevel(exp, estimatedLevel);
        
        let tooltipText = `Nivel estimado: ${estimatedLevel}\n`;
        tooltipText += `Sistema: ${system.name}\n`;
        tooltipText += `XP actual: ${exp.toLocaleString()}\n`;
        tooltipText += `XP para nivel ${estimatedLevel}: ${currentLevelExp.toLocaleString()}\n`;
        
        if (estimatedLevel < system.maxLevel) {
            tooltipText += `XP para nivel ${estimatedLevel + 1}: ${nextLevelExp.toLocaleString()}\n`;
            tooltipText += `XP restante: ${expToNext.toLocaleString()}`;
        } else {
            tooltipText += `¡Nivel máximo alcanzado!`;
        }
        
        expModifier.title = tooltipText;
        
        // Actualizar barra de progreso
        addExperienceProgressBar();
    }
}

function updateExperienceFromLevel() {
    const levelInput = document.getElementById('level');
    const expInput = document.getElementById('experience');
    
    if (levelInput && expInput) {
        const level = parseInt(levelInput.value) || 1;
        const system = getCurrentLevelSystem();
        
        // Validar que el nivel esté dentro del rango permitido
        const validLevel = Math.max(1, Math.min(system.maxLevel, level));
        if (validLevel !== level) {
            levelInput.value = validLevel;
        }
        
        const requiredExp = getExperienceForLevel(validLevel);
        
        // Solo actualizar si el valor es diferente para evitar bucles
        if (parseInt(expInput.value) !== requiredExp) {
            expInput.value = requiredExp;
            updateExperienceModifier();
        }
    }
}

function updateLevelFromExperience() {
    const expInput = document.getElementById('experience');
    const levelInput = document.getElementById('level');
    
    if (expInput && levelInput) {
        const exp = Math.max(0, parseInt(expInput.value) || 0);
        const estimatedLevel = calculateLevelFromExp(exp);
        const currentLevel = parseInt(levelInput.value) || 1;
        
        // Solo actualizar si el nivel calculado es diferente para evitar bucles
        if (estimatedLevel !== currentLevel) {
            levelInput.value = estimatedLevel;
            updateLevelModifier();
            
            // Notificar cambio de nivel solo si realmente cambió
            document.dispatchEvent(new CustomEvent('attributeChanged', {
                detail: {
                    attribute: 'level',
                    value: estimatedLevel
                }
            }));
        }
    }
}

function addLevelTooltip(levelInput) {
    const system = getCurrentLevelSystem();
    let tooltipText = `${system.description}\n\n`;
    tooltipText += `Rango de niveles: 1-${system.maxLevel}\n`;
    tooltipText += `El bono de competencia se calcula automáticamente según el sistema seleccionado.`;
    
    levelInput.title = tooltipText;
}

function addExperienceTooltip(expInput) {
    const system = getCurrentLevelSystem();
    let tooltipText = `${system.description}\n\n`;
    tooltipText += `Ejemplos de XP por nivel:\n`;
    
    // Mostrar algunos ejemplos de la tabla de experiencia
    const examples = [1, 5, 10, 15, system.maxLevel];
    examples.forEach(level => {
        if (level <= system.maxLevel) {
            const exp = getExperienceForLevel(level);
            tooltipText += `Nivel ${level}: ${exp.toLocaleString()} XP\n`;
        }
    });
    
    expInput.title = tooltipText;
}

function updateTooltips() {
    const levelInput = document.getElementById('level');
    const expInput = document.getElementById('experience');
    
    if (levelInput) addLevelTooltip(levelInput);
    if (expInput) addExperienceTooltip(expInput);
}

function updateSystemInfo() {
    const system = getCurrentLevelSystem();
    
    // Crear o actualizar indicador del sistema
    let systemInfo = document.querySelector('.level-system-info');
    if (!systemInfo) {
        systemInfo = document.createElement('div');
        systemInfo.className = 'level-system-info';
        
        // Buscar un lugar apropiado para insertar la información
        const levelSection = document.querySelector('.attribute-item input#level')?.closest('.attribute-item');
        if (levelSection) {
            levelSection.appendChild(systemInfo);
        }
    }
    
    if (systemInfo) {
        const isSpanish = document.documentElement.lang === 'es';
        systemInfo.textContent = isSpanish ? 
            `Sistema: ${system.name} (Niveles 1-${system.maxLevel})` :
            `System: ${system.name} (Levels 1-${system.maxLevel})`;
        systemInfo.title = system.description;
    }
}

function addExperienceProgressBar() {
    const expInput = document.getElementById('experience');
    if (!expInput) return;
    
    const expContainer = expInput.closest('.attribute-item');
    if (!expContainer) return;
    
    // Crear barra de progreso si no existe
    let progressBar = expContainer.querySelector('.exp-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'exp-progress';
        expInput.style.position = 'relative';
        expInput.parentNode.style.position = 'relative';
        expInput.parentNode.appendChild(progressBar);
    }
    
    // Actualizar progreso
    const exp = parseInt(expInput.value) || 0;
    const currentLevel = calculateLevelFromExp(exp);
    const system = getCurrentLevelSystem();
    
    if (currentLevel < system.maxLevel) {
        const currentLevelExp = getExperienceForLevel(currentLevel);
        const nextLevelExp = getExperienceForLevel(currentLevel + 1);
        const progress = ((exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    } else {
        progressBar.style.width = '100%';
    }
}

function initializeLevelExperienceSync() {
    const levelInput = document.getElementById('level');
    const expInput = document.getElementById('experience');
    
    if (!levelInput || !expInput) return;
    
    const currentLevel = parseInt(levelInput.value) || 1;
    const currentExp = parseInt(expInput.value) || 0;
    
    // Si el nivel es mayor que 1 pero la experiencia es 0, sincronizar experiencia
    if (currentLevel > 1 && currentExp === 0) {
        const requiredExp = getExperienceForLevel(currentLevel);
        expInput.value = requiredExp;
        updateExperienceModifier();
    }
    // Si la experiencia es mayor que 0 pero el nivel no coincide, sincronizar nivel
    else if (currentExp > 0) {
        const calculatedLevel = calculateLevelFromExp(currentExp);
        if (calculatedLevel !== currentLevel) {
            levelInput.value = calculatedLevel;
            updateLevelModifier();
        }
    }
    
    // Asegurar que ambos valores estén sincronizados
    updateLevelModifier();
    updateExperienceModifier();
    updateExperienceSlider();
}

function setupExperienceSlider() {
    const slider = document.getElementById('experience-slider');
    const decreaseBtn = document.getElementById('exp-decrease-btn');
    const increaseBtn = document.getElementById('exp-increase-btn');
    
    if (!slider) return;
    
    let isDragging = false;
    let isLevelingUp = false;
    
    // Inicializar slider
    updateExperienceSlider();
    
    // Manejar cambios del slider
    slider.addEventListener('input', function() {
        if (isLevelingUp) return; // Bloquear durante animación
        isDragging = true;
        handleSliderChange(parseInt(this.value));
    });
    
    slider.addEventListener('change', function() {
        if (isLevelingUp) return; // Bloquear durante animación
        isDragging = false;
        handleSliderChange(parseInt(this.value));
    });
    
    // Configurar botones de incremento/decremento
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            if (isLevelingUp) return;
            adjustSliderByPercentage(-25);
        });
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', function() {
            if (isLevelingUp) return;
            adjustSliderByPercentage(25);
        });
    }
    
    // Función para bloquear temporalmente el slider
    window.blockSliderForLevelUp = function() {
        isLevelingUp = true;
        slider.disabled = true;
        if (decreaseBtn) decreaseBtn.disabled = true;
        if (increaseBtn) increaseBtn.disabled = true;
        
        // Desbloquear después de 1 segundo
        setTimeout(() => {
            isLevelingUp = false;
            slider.disabled = false;
            if (decreaseBtn) decreaseBtn.disabled = false;
            if (increaseBtn) increaseBtn.disabled = false;
            updateSliderButtonStates();
        }, 1000);
    };
    
    // Actualizar etiquetas del slider
    updateSliderLabels();
    updateSliderButtonStates();
}

function handleSliderChange(sliderValue) {
    const levelInput = document.getElementById('level');
    const expInput = document.getElementById('experience');
    
    if (!levelInput || !expInput) return;
    
    const currentLevel = parseInt(levelInput.value) || 1;
    const system = getCurrentLevelSystem();
    
    // Si el slider llega al 100%, subir de nivel
    if (sliderValue >= 100 && currentLevel < system.maxLevel) {
        const newLevel = currentLevel + 1;
        levelInput.value = newLevel;
        
        // Bloquear slider temporalmente
        if (window.blockSliderForLevelUp) {
            window.blockSliderForLevelUp();
        }
        
        // Animación de reseteo del slider
        const slider = document.getElementById('experience-slider');
        if (slider) {
            // Animación suave de vuelta al 0%
            let currentValue = 100;
            const animationStep = () => {
                currentValue -= 5;
                if (currentValue <= 0) {
                    slider.value = 0;
                    return;
                }
                slider.value = currentValue;
                requestAnimationFrame(animationStep);
            };
            requestAnimationFrame(animationStep);
        }
        
        // Actualizar experiencia al mínimo del nuevo nivel
        const newLevelExp = getExperienceForLevel(newLevel);
        expInput.value = newLevelExp;
        
        // Actualizar todo
        updateLevelModifier();
        updateExperienceModifier();
        updateSliderLabels();
        updateSliderButtonStates();
        
        // Notificar cambio de nivel
        document.dispatchEvent(new CustomEvent('attributeChanged', {
            detail: {
                attribute: 'level',
                value: newLevel
            }
        }));
    } else {
        // Calcular experiencia basada en el porcentaje del slider
        const currentLevelExp = getExperienceForLevel(currentLevel);
        const nextLevelExp = getExperienceForLevel(currentLevel + 1);
        const expRange = nextLevelExp - currentLevelExp;
        const expProgress = Math.floor((sliderValue / 100) * expRange);
        const newExp = currentLevelExp + expProgress;
        
        // Actualizar experiencia
        expInput.value = newExp;
        updateExperienceModifier();
        updateSliderButtonStates();
    }
}

function updateExperienceSlider() {
    const slider = document.getElementById('experience-slider');
    const levelInput = document.getElementById('level');
    const expInput = document.getElementById('experience');
    
    if (!slider || !levelInput || !expInput) return;
    
    const currentLevel = parseInt(levelInput.value) || 1;
    const currentExp = parseInt(expInput.value) || 0;
    const system = getCurrentLevelSystem();
    
    // Si estamos en el nivel máximo, slider al 100%
    if (currentLevel >= system.maxLevel) {
        slider.value = 100;
        slider.disabled = true;
        updateSliderButtonStates();
        return;
    } else {
        slider.disabled = false;
    }
    
    // Calcular progreso dentro del nivel actual
    const currentLevelExp = getExperienceForLevel(currentLevel);
    const nextLevelExp = getExperienceForLevel(currentLevel + 1);
    const expRange = nextLevelExp - currentLevelExp;
    const expProgress = currentExp - currentLevelExp;
    const percentage = Math.max(0, Math.min(100, (expProgress / expRange) * 100));
    
    slider.value = percentage;
    updateSliderLabels();
    updateSliderButtonStates();
}

function updateSliderLabels() {
    const startLabel = document.querySelector('.slider-label-start');
    const endLabel = document.querySelector('.slider-label-end');
    const levelInput = document.getElementById('level');
    
    if (!startLabel || !endLabel || !levelInput) return;
    
    const currentLevel = parseInt(levelInput.value) || 1;
    const system = getCurrentLevelSystem();
    const isSpanish = document.documentElement.lang === 'es';
    
    if (currentLevel >= system.maxLevel) {
        startLabel.textContent = isSpanish ? 'Nivel máximo' : 'Max level';
        endLabel.textContent = isSpanish ? 'Completado' : 'Complete';
    } else {
        startLabel.textContent = isSpanish ? `Nivel ${currentLevel}` : `Level ${currentLevel}`;
        endLabel.textContent = isSpanish ? `Nivel ${currentLevel + 1}` : `Level ${currentLevel + 1}`;
    }
}

function adjustSliderByPercentage(percentageChange) {
    const slider = document.getElementById('experience-slider');
    if (!slider) return;
    
    const currentValue = parseInt(slider.value) || 0;
    let newValue = currentValue + percentageChange;
    
    // Mantener dentro del rango 0-100
    newValue = Math.max(0, Math.min(100, newValue));
    
    // Si el cambio llevaría a exactamente 25%, 50%, 75% o 100%, usar esos valores
    const snapValues = [0, 25, 50, 75, 100];
    const tolerance = 5; // Tolerancia para el snap
    
    for (const snapValue of snapValues) {
        if (Math.abs(newValue - snapValue) <= tolerance) {
            newValue = snapValue;
            break;
        }
    }
    
    slider.value = newValue;
    handleSliderChange(newValue);
}

function updateSliderButtonStates() {
    const slider = document.getElementById('experience-slider');
    const decreaseBtn = document.getElementById('exp-decrease-btn');
    const increaseBtn = document.getElementById('exp-increase-btn');
    const levelInput = document.getElementById('level');
    
    if (!slider || !decreaseBtn || !increaseBtn || !levelInput) return;
    
    const currentValue = parseInt(slider.value) || 0;
    const currentLevel = parseInt(levelInput.value) || 1;
    const system = getCurrentLevelSystem();
    
    // Deshabilitar botón de disminuir si estamos en 0%
    decreaseBtn.disabled = currentValue <= 0;
    
    // Deshabilitar botón de aumentar si estamos en nivel máximo o en 100%
    increaseBtn.disabled = (currentLevel >= system.maxLevel) || (currentValue >= 100);
}

// Configuración de sistemas de experiencia y niveles
const LEVEL_SYSTEMS = {
    dnd5e: {
        name: 'D&D 5e',
        maxLevel: 20,
        expTable: [
            0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
            85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
        ],
        proficiencyBonus: (level) => Math.ceil(level / 4) + 1,
        description: 'Sistema estándar de D&D 5e con progresión equilibrada hasta nivel 20'
    },
    pathfinder: {
        name: 'Pathfinder 2e',
        maxLevel: 20,
        // Pathfinder 2e usa 1000 XP por nivel de forma consistente
        expTable: Array.from({length: 21}, (_, i) => i === 0 ? 0 : i * 1000),
        proficiencyBonus: (level) => level + 1, // En PF2e el bono de competencia es nivel + 1
        description: 'Sistema de Pathfinder 2e con 1000 XP por nivel y progresión lineal'
    },
    wod: {
        name: 'World of Darkness',
        maxLevel: 10, // En WoD típicamente se usan generaciones o niveles más bajos
        // WoD usa un sistema diferente, pero adaptamos a XP
        expTable: [0, 3, 7, 13, 21, 31, 43, 57, 73, 91, 111],
        proficiencyBonus: (level) => Math.floor(level / 2) + 1,
        description: 'Sistema adaptado de World of Darkness con progresión más lenta'
    },
    custom: {
        name: 'Custom',
        maxLevel: 30, // Permitir niveles más altos para sistemas personalizados
        // Progresión exponencial personalizada
        expTable: [
            0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
            85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
            // Niveles 21-30 con progresión más alta
            420000, 500000, 600000, 720000, 860000, 1020000, 1200000, 1400000, 1620000, 1860000
        ],
        proficiencyBonus: (level) => Math.ceil(level / 4) + 1,
        description: 'Sistema personalizado con niveles extendidos hasta 30 y progresión flexible'
    }
};

function getCurrentGameType() {
    // Obtener el tipo de juego actual desde el selector
    const gameTypeInput = document.getElementById('selected-game-type');
    return gameTypeInput ? gameTypeInput.value || 'dnd5e' : 'dnd5e';
}

function getCurrentLevelSystem() {
    const gameType = getCurrentGameType();
    return LEVEL_SYSTEMS[gameType] || LEVEL_SYSTEMS.dnd5e;
}

function calculateLevelFromExp(exp) {
    const system = getCurrentLevelSystem();
    const expTable = system.expTable;
    
    let level = 1;
    for (let i = 0; i < expTable.length; i++) {
        if (exp >= expTable[i]) {
            level = i + 1;
        } else {
            break;
        }
    }
    
    return Math.min(system.maxLevel, level);
}

function getExperienceForLevel(level) {
    const system = getCurrentLevelSystem();
    const expTable = system.expTable;
    
    const adjustedLevel = Math.max(1, Math.min(system.maxLevel, level)) - 1;
    return expTable[adjustedLevel] || 0;
}

function getProficiencyBonus(level) {
    const system = getCurrentLevelSystem();
    return system.proficiencyBonus(level);
}

function getNextLevelExp(currentLevel) {
    const system = getCurrentLevelSystem();
    if (currentLevel >= system.maxLevel) {
        return system.expTable[system.expTable.length - 1];
    }
    return getExperienceForLevel(currentLevel + 1);
}

function getExpToNextLevel(currentExp, currentLevel) {
    const nextLevelExp = getNextLevelExp(currentLevel);
    return Math.max(0, nextLevelExp - currentExp);
}

function saveDraft() {
    // Obtener todos los datos del formulario
    const form = document.getElementById('character-form');
    if (!form) return;
    
    const formData = new FormData(form);
    
    // Obtener personaje de la vista previa
    const character = window.previewManager?.getCharacter();
    
    // Combinar datos
    const draftData = {
        ...Object.fromEntries(formData),
        skills: character?.skills || [],
        equipment: character?.equipment || [],
        spells: character?.spells || [],
        isDraft: true,
        savedAt: new Date().toISOString()
    };
    
    // Guardar en localStorage
    try {
    localStorage.setItem('characterDraft', JSON.stringify(draftData));
    console.info('[Toast]', 'Draft saved successfully.', { savedAt: draftData.savedAt });
    alert('Draft saved successfully.');
    } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('[Toast Error] Error saving draft', err);
    console.debug('Stack trace:', err.stack || new Error('Stack').stack);
    alert('Error saving draft. Your browser might have local storage disabled.');
    }
}

function loadDraft() {
    try {
        const draftData = localStorage.getItem('characterDraft');
        if (!draftData) return null;
        
        return JSON.parse(draftData);
    } catch (e) {
        console.error('Error loading draft:', e);
        return null;
    }
}

function attemptLoadDraft() {
    const draft = loadDraft();
    if (!draft) return;
    
    // Verificar si el borrador es reciente (menos de 7 días)
    const savedAt = new Date(draft.savedAt || 0);
    const now = new Date();
    const daysSinceSaved = (now - savedAt) / (1000 * 60 * 60 * 24);
    
    if (daysSinceSaved > 7) {
        // Borrador antiguo, preguntar antes de cargar
        if (!confirm('You have a draft from ' + savedAt.toLocaleDateString() + '. Would you like to load it?')) {
            return;
        }
    }
    
    // Seleccionar tipo de juego si está disponible
    if (draft.game_type && window.gameTypeSelector) {
        const gameTypeCard = document.querySelector(`.game-type-card[data-game-type="${draft.game_type}"]`);
        if (gameTypeCard) {
            // Simular clic en la tarjeta de tipo de juego
            gameTypeCard.click();
        }
    }
    
    // Hay que esperar a que los datos se carguen antes de continuar
    const dataLoadedListener = function() {
        // Eliminar listener para evitar duplicados
        document.removeEventListener('dataPopulated', dataLoadedListener);
        
        // Ahora podemos completar el resto del formulario
        completeFormWithDraftData(draft);
    };
    
    // Escuchar el evento de datos cargados
    document.addEventListener('dataPopulated', dataLoadedListener);
}

function completeFormWithDraftData(draft) {
    // Completar campos básicos
    const basicFields = ['character_name', 'player_name'];
    basicFields.forEach(field => {
        const input = document.getElementById(field.replace('_', '-'));
        if (input && draft[field]) {
            input.value = draft[field];
        }
    });
    
    // Seleccionar opciones en selects
    const selectFields = ['race_id', 'class_id', 'background_id', 'alignment_id'];
    selectFields.forEach(field => {
        const selectId = field.replace('_id', '').replace('class_id', 'character-class');
        const select = document.getElementById(selectId);
        if (select && draft[field]) {
            select.value = draft[field];
            // Disparar evento change para actualizar UI dependiente
            const event = new Event('change');
            select.dispatchEvent(event);
        }
    });
    
    // Establecer atributos
    const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    attributes.forEach(attr => {
        const input = document.getElementById(attr);
        if (input && draft[attr]) {
            input.value = draft[attr];
            // Actualizar modificador
            const modifierElement = document.getElementById(`${attr}-modifier`);
            if (modifierElement) {
                const value = parseInt(draft[attr]);
                const modifier = Math.floor((value - 10) / 2);
                modifierElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            }
            
            // Notificar cambio de atributo
            document.dispatchEvent(new CustomEvent('attributeChanged', {
                detail: { attribute: attr, value: parseInt(draft[attr]) }
            }));
        }
    });
    
    // Establecer nivel y experiencia
    if (draft.level) {
        const levelInput = document.getElementById('level');
        if (levelInput) {
            levelInput.value = draft.level;
            // Disparar evento change para actualizar experiencia
            const event = new Event('change');
            levelInput.dispatchEvent(event);
        }
    }
    
    // Actualizar previsualización
    if (window.previewManager) {
        window.previewManager.updatePreview();
    }
    
    // Notificar al usuario
    console.log('Draft loaded successfully.');
}
