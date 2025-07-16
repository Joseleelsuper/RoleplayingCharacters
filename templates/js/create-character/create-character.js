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
        const levelModifier = document.getElementById('level-modifier');
        if (levelModifier) {
            const level = parseInt(levelInput.value) || 1;
            const profBonus = Math.ceil(level / 4) + 1;
            levelModifier.textContent = `+${profBonus}`;
        }
        
        // Sincronizar valores al cambiar
        levelInput.addEventListener('change', function() {
            const level = parseInt(levelInput.value) || 1;
            const profBonus = Math.ceil(level / 4) + 1;
            
            if (levelModifier) {
                levelModifier.textContent = `+${profBonus}`;
            }
            
            // Actualizar experiencia necesaria para el nivel
            const expInput = document.getElementById('experience');
            if (expInput) {
                expInput.value = getExperienceForLevel(level);
                
                // Actualizar modificador de experiencia
                const expModifier = document.getElementById('experience-modifier');
                if (expModifier) {
                    expModifier.textContent = `Lvl ${level}`;
                }
            }
            
            // Notificar cambio de nivel
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
        const expModifier = document.getElementById('experience-modifier');
        if (expModifier) {
            const exp = parseInt(expInput.value) || 0;
            const estimatedLevel = calculateLevelFromExp(exp);
            expModifier.textContent = `Lvl ${estimatedLevel}`;
        }
        
        // Sincronizar valores al cambiar
        expInput.addEventListener('change', function() {
            const exp = parseInt(expInput.value) || 0;
            const estimatedLevel = calculateLevelFromExp(exp);
            
            if (expModifier) {
                expModifier.textContent = `Lvl ${estimatedLevel}`;
            }
            
            // Actualizar nivel basado en experiencia
            const levelInput = document.getElementById('level');
            if (levelInput) {
                levelInput.value = estimatedLevel;
                
                // Actualizar modificador de nivel
                const levelModifier = document.getElementById('level-modifier');
                if (levelModifier) {
                    const profBonus = Math.ceil(estimatedLevel / 4) + 1;
                    levelModifier.textContent = `+${profBonus}`;
                }
                
                // Notificar cambio de nivel
                document.dispatchEvent(new CustomEvent('attributeChanged', {
                    detail: {
                        attribute: 'level',
                        value: estimatedLevel
                    }
                }));
            }
        });
    }
}

function calculateLevelFromExp(exp) {
    // Tabla de experiencia de D&D 5e
    const expTable = [
        0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
        85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
    ];
    
    let level = 1;
    for (let i = 0; i < expTable.length; i++) {
        if (exp >= expTable[i]) {
            level = i + 1;
        } else {
            break;
        }
    }
    
    return Math.min(20, level);
}

function getExperienceForLevel(level) {
    // Tabla de experiencia de D&D 5e
    const expTable = [
        0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
        85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
    ];
    
    const adjustedLevel = Math.max(1, Math.min(20, level)) - 1;
    return expTable[adjustedLevel];
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
        alert('Draft saved successfully.');
    } catch (e) {
        console.error('Error saving draft:', e);
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
