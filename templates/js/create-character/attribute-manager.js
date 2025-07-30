/**
 * Clase para gestionar los atributos del personaje
 */
class AttributeManager {
    constructor() {
        // Configuración de los diferentes sistemas de atributos
        this.attributeSystems = {
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
                    // Para valores hasta 15, usar la tabla estándar de D&D 5e
                    if (val < 8) return 0;
                    if (val === 8) return 0;
                    if (val === 9) return 1;
                    if (val === 10) return 2;
                    if (val === 11) return 3;
                    if (val === 12) return 4;
                    if (val === 13) return 5;
                    if (val === 14) return 7;
                    if (val === 15) return 9;
                    
                    // Para valores más allá de 15, usar una progresión más agresiva
                    // Cada +1 cuesta 2 más que el anterior
                    if (val === 16) return 11; // 9 + 2
                    if (val === 17) return 14; // 11 + 3
                    if (val === 18) return 18; // 14 + 4
                    if (val === 19) return 23; // 18 + 5
                    if (val === 20) return 29; // 23 + 6
                    
                    // Para valores aún más altos, crecimiento exponencial
                    // Esto permitirá valores muy altos, pero a un costo prohibitivo
                    const baseVal = 29;
                    const extraVal = val - 20;
                    if (extraVal > 0) {
                        // Cada punto más allá de 20 cuesta exponencialmente más
                        return baseVal + Math.pow(2, extraVal + 1);
                    }
                    
                    return baseVal;
                },
                name: 'Custom'
            }
        };
        
        // Sistema de atributos actualmente seleccionado
        this.currentAttributeSystem = 'dnd5e';
    }
    
    init() {
        this.attributeSystemSelect = document.getElementById('attribute-system');
        this.customConfig = document.getElementById('custom-attribute-config');
        this.attributeButtons = document.querySelectorAll('.attribute-btn:not(.decrease-5):not(.increase-5)');
        this.attributeButtons5 = document.querySelectorAll('.attribute-btn.decrease-5, .attribute-btn.increase-5');
        this.attributePointsRemaining = document.getElementById('points-remaining');
        this.randomStatsBtn = document.getElementById('random-attributes-btn');
        this.defaultStatsBtn = document.getElementById('default-attributes-btn');
        
        this.setupAttributeControls();
        this.setupAttributeControls5();
        this.setupAttributeSystemSelector();
        this.setupRandomButtons();
        this.updateAttributePointsRemaining();
        this.updateAttributeButtonStates();
    }
    
    setupAttributeControls() {
        this.attributeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const attribute = button.dataset.attribute;
                const isIncrease = button.classList.contains('increase');
                this.modifyAttribute(attribute, isIncrease ? 1 : -1);
            });
        });
    }
    
    updateModifier(attribute, value) {
        const modifierElement = document.getElementById(`${attribute}-modifier`);
        if (!modifierElement) return;
        
        // Determinar tipo de modificador
        const input = document.getElementById(attribute);
        if (!input) return;
        
        const modifierType = input.dataset.modifierType || 'attribute';
        
        switch (modifierType) {
            case 'attribute':
                const modifier = Math.floor((value - 10) / 2);
                modifierElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                break;
            case 'proficiency':
                const profBonus = Math.ceil(value / 4) + 1;
                modifierElement.textContent = `+${profBonus}`;
                break;
            case 'level':
                const estimatedLevel = Math.min(20, Math.max(1, Math.floor(Math.sqrt(value / 100))));
                modifierElement.textContent = `Lvl ${estimatedLevel}`;
                break;
        }
    }
    
    pointBuyCost(val) {
        return this.attributeSystems[this.currentAttributeSystem].pointBuyCostFunction(val);
    }
    
    getTotalAttributePoints() {
        const attrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        let total = 0;
        
        attrs.forEach(attr => {
            const input = document.getElementById(attr);
            if (input) {
                total += this.pointBuyCost(parseInt(input.value));
            }
        });
        
        return total;
    }
    
    updateAttributePointsRemaining() {
        const pointsLimit = this.attributeSystems[this.currentAttributeSystem].pointsLimit;
        const used = this.getTotalAttributePoints();
        
        if (this.attributePointsRemaining) {
            this.attributePointsRemaining.textContent = pointsLimit - used;
        }
    }
    
    setupRandomButtons() {
        // Botón de estadísticas aleatorias (point buy legal)
        if (this.randomStatsBtn) {
            this.randomStatsBtn.addEventListener('click', () => {
                const attrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                const system = this.attributeSystems[this.currentAttributeSystem];
                const minAttr = system.minAttr;
                const maxAttr = system.maxAttr;
                const pointsLimit = system.pointsLimit;
                
                let values = Array(6).fill(minAttr);
                
                // Usar un algoritmo de distribución mejorado
                values = this.generateRandomAttributeDistribution(attrs.length, minAttr, maxAttr, pointsLimit);
                
                // Aplicar los valores generados a los inputs y actualizar modificadores
                attrs.forEach((attr, i) => {
                    const input = document.getElementById(attr);
                    if (input) {
                        input.value = values[i];
                        this.updateModifier(attr, values[i]);
                    }
                });
                
                // Actualizar interfaz
                this.updateAttributePointsRemaining();
                this.updateAttributeButtonStates();
                
                // Opcionalmente, mostrar qué tipo de build se generó
                console.log('Generated attribute distribution');
                
                // Notificar cambio en todos los atributos
                document.dispatchEvent(new CustomEvent('attributesReset'));
            });
        }

        // Botón de restaurar por defecto (valores +0 según el sistema, normalmente 10)
        if (this.defaultStatsBtn) {
            this.defaultStatsBtn.addEventListener('click', () => {
                const attrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                const system = this.attributeSystems[this.currentAttributeSystem];
                
                // Encontrar el valor que da modificador +0 en este sistema
                // Por defecto, usamos 10 si no encontramos un valor que dé +0
                let defaultValue = 10;
                
                // Buscar valor que da modificador +0
                for (let i = system.minAttr; i <= system.maxAttr; i++) {
                    const modifier = Math.floor((i - 10) / 2);
                    if (modifier === 0) {
                        defaultValue = i;
                        break;
                    }
                }
                
                attrs.forEach(attr => {
                    const input = document.getElementById(attr);
                    if (input) {
                        input.value = defaultValue;
                        this.updateModifier(attr, defaultValue);
                    }
                });
                
                this.updateAttributePointsRemaining();
                this.updateAttributeButtonStates();
                
                // Notificar cambio en todos los atributos
                document.dispatchEvent(new CustomEvent('attributesReset'));
            });
        }
    }
    
    setupAttributeSystemSelector() {
        if (this.attributeSystemSelect) {
            // Manejo del cambio de sistema de atributos
            this.attributeSystemSelect.addEventListener('change', () => {
                this.setAttributeSystem(this.attributeSystemSelect.value);
            });
            
            // Configuración personalizada
            const customMin = document.getElementById('custom-min');
            const customMax = document.getElementById('custom-max');
            const customPoints = document.getElementById('custom-points');
            
            if (customMin && customMax && customPoints) {
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
                    
                    if (maxVal >= minVal) {
                        this.attributeSystems.custom.maxAttr = maxVal;
                        this.updateAttributeLimits();
                        this.updateAttributePointsRemaining();
                        this.updateAttributeButtonStates();
                    } else {
                        customMax.value = this.attributeSystems.custom.maxAttr;
                    }
                });
                
                customPoints.addEventListener('change', () => {
                    const pointsVal = parseInt(customPoints.value);
                    
                    if (pointsVal >= 1) {
                        this.attributeSystems.custom.pointsLimit = pointsVal;
                        this.updateAttributePointsRemaining();
                    } else {
                        customPoints.value = this.attributeSystems.custom.pointsLimit;
                    }
                });
            }
        }
    }
    
    setupAttributeControls() {
        this.attributeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const attribute = button.dataset.attribute;
                const isIncrease = button.classList.contains('increase');
                const input = document.getElementById(attribute);
                if (!input) return;

                // Usar los límites del sistema actual
                const system = this.attributeSystems[this.currentAttributeSystem];
                const min = system.minAttr;
                const max = system.maxAttr;

                // Verificar si es un atributo principal o secundario
                if (["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].includes(attribute)) {
                    // Calcular puntos usados antes del cambio
                    let oldValue = parseInt(input.value);
                    let newValue = oldValue;

                    if (isIncrease && oldValue < max) {
                        newValue = oldValue + 1;
                    } else if (!isIncrease && oldValue > min) {
                        newValue = oldValue - 1;
                    }

                    // Verificar si hay suficientes puntos
                    let currentCost = this.pointBuyCost(oldValue);
                    let newCost = this.pointBuyCost(newValue);
                    let costDifference = newCost - currentCost;

                    let totalPointsUsed = this.getTotalAttributePoints();
                    let availablePoints = this.attributeSystems[this.currentAttributeSystem].pointsLimit - totalPointsUsed;

                    if (availablePoints >= costDifference) {
                        input.value = newValue;
                        this.updateModifier(attribute, newValue);
                        this.updateAttributePointsRemaining();
                    }
                } else {
                    // Para atributos secundarios como level o experience
                    let value = parseInt(input.value);
                    if (isNaN(value)) value = 0;
                    
                    if (isIncrease) {
                        input.value = value + 1;
                    } else {
                        // Evitar valores negativos
                        input.value = Math.max(0, value - 1);
                    }
                    this.updateModifier(attribute, parseInt(input.value));
                }

                this.updateAttributeButtonStates();

                // Notificar cambio de atributo
                document.dispatchEvent(new CustomEvent('attributeChanged', {
                    detail: {
                        attribute: attribute,
                        value: parseInt(input.value)
                    }
                }));
            });
        });
    }

    setupAttributeControls5() {
        this.attributeButtons5.forEach(button => {
            button.addEventListener('click', () => {
                const attribute = button.dataset.attribute;
                const isIncrease = button.classList.contains('increase-5');
                const step = isIncrease ? 5 : -5;
                
                // Usamos modifyAttribute directamente para evitar lógica duplicada
                // El evento attributeChanged ya se dispara dentro de modifyAttribute
                this.modifyAttribute(attribute, step);
            });
        });
    }

    /**
     * Modifica el atributo indicado en el paso dado (+1, -1, +5, -5), gestionando puntos y límites.
     */
    modifyAttribute(attribute, step) {
        const input = document.getElementById(attribute);
        if (!input) return;
        const system = this.attributeSystems[this.currentAttributeSystem];
        const min = system.minAttr;
        const max = system.maxAttr;

        if (["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].includes(attribute)) {
            let oldValue = parseInt(input.value);
            let newValue = oldValue;
            let pointsUsed = this.getTotalAttributePoints();
            let pointsLimit = system.pointsLimit;

            if (step !== 0) {
                let direction = step > 0 ? 1 : -1;
                let absStep = Math.abs(step);
                for (let i = 0; i < absStep; i++) {
                    let candidate = newValue + direction;
                    if (candidate < min || candidate > max) break;
                    let currentCost = this.pointBuyCost(newValue);
                    let nextCost = this.pointBuyCost(candidate);
                    let diff = nextCost - currentCost;
                    if (direction > 0) {
                        if ((pointsLimit - pointsUsed) < diff) break;
                        newValue = candidate;
                        pointsUsed += diff;
                    } else {
                        newValue = candidate;
                        pointsUsed += diff;
                    }
                }
            }

            if (newValue !== oldValue) {
                input.value = newValue;
                this.updateModifier(attribute, newValue);
                this.updateAttributePointsRemaining();
            }
        } else {
            // Para atributos secundarios como level o experience
            let value = parseInt(input.value);
            if (isNaN(value)) value = 0;
            
            // Aplicar el incremento completo para atributos secundarios
            let newValue = value + step;
            if (newValue < 0) newValue = 0;
            
            input.value = newValue;
            
            this.updateModifier(attribute, newValue);
        }

        this.updateAttributeButtonStates();

        document.dispatchEvent(new CustomEvent('attributeChanged', {
            detail: {
                attribute: attribute,
                value: parseInt(input.value)
            }
        }));
    }
    
    updateCustomSystem(minAttr, maxAttr, pointsLimit) {
        if (!this.attributeSystems.custom) return;
        
        // Actualizar configuración del sistema personalizado
        this.attributeSystems.custom.minAttr = minAttr;
        this.attributeSystems.custom.maxAttr = maxAttr;
        this.attributeSystems.custom.pointsLimit = pointsLimit;
        
        // Si el sistema actual es "custom", aplicar los cambios inmediatamente
        if (this.currentAttributeSystem === 'custom') {
            this.updateAttributeLimits();
            this.updateAttributePointsRemaining();
            this.updateAttributeButtonStates();
        }
    }
    
    setAttributeSystem(systemName) {
        if (this.attributeSystems[systemName]) {
            this.currentAttributeSystem = systemName;
            
            // Si es personalizado, actualizar con los valores actuales de la configuración
            if (systemName === 'custom') {
                const customMin = document.getElementById('custom-min');
                const customMax = document.getElementById('custom-max');
                const customPoints = document.getElementById('custom-points');
                
                if (customMin && customMax && customPoints) {
                    this.updateCustomSystem(
                        parseInt(customMin.value),
                        parseInt(customMax.value),
                        parseInt(customPoints.value)
                    );
                }
            }
            
            // Actualizar límites de los atributos
            this.updateAttributeLimits();
            
            // Recalcular puntos restantes
            this.updateAttributePointsRemaining();
            
            // Actualizar estado de los botones
            this.updateAttributeButtonStates();
            
            // Actualizar etiquetas de los botones
            this.updateAttributeButtonLabels();
        }
    }
    
    updateAttributeLimits() {
        const system = this.attributeSystems[this.currentAttributeSystem];
        const attrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        attrs.forEach(attr => {
            const input = document.getElementById(attr);
            if (input) {
                // Actualizar límites en el elemento input
                input.min = system.minAttr;
                input.max = system.maxAttr;
                
                // Asegurar que los valores estén dentro de los nuevos límites
                const currentVal = parseInt(input.value);
                if (currentVal < system.minAttr) {
                    input.value = system.minAttr;
                    this.updateModifier(attr, system.minAttr);
                } else if (currentVal > system.maxAttr) {
                    input.value = system.maxAttr;
                    this.updateModifier(attr, system.maxAttr);
                }
            }
        });
    }
    
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
                // Deshabilitar botón de incremento si se alcanzó el máximo
                // o si no hay suficientes puntos para aumentar
                const newCost = this.pointBuyCost(value + 1) - this.pointBuyCost(value);
                const pointsRemaining = parseInt(this.attributePointsRemaining?.textContent || 0);
                
                btnInc.disabled = (value >= maxAttr || pointsRemaining < newCost);
            }
            
            if (btnDec) {
                // Deshabilitar botón de decremento si se alcanzó el mínimo
                btnDec.disabled = value <= minAttr;
            }
        });
    }
    
    updateAttributeButtonLabels() {
        // Obtener los elementos de botón
        const randomBtnText = document.getElementById('random-attributes-btn');
        const defaultBtnText = document.getElementById('default-attributes-btn');
        
        if (randomBtnText) {
            // Usar el texto de traducción para "Aleatorio" con emoji de dados
            randomBtnText.innerHTML = `🎲 ${randomBtnText.dataset.text || 'Random'}`;
        }
        
        if (defaultBtnText) {
            // Usar el texto de traducción para "Por Defecto" con emoji de reinicio
            defaultBtnText.innerHTML = `🔄 ${defaultBtnText.dataset.text || 'Default'}`;
        }
    }
    
    generateRandomAttributeDistribution(attributeCount, minAttr, maxAttr, pointsLimit) {
        // Inicializar todos los atributos al mínimo
        let values = Array(attributeCount).fill(minAttr);
        let remainingPoints = pointsLimit;
        let attempts = 0;
        const maxAttempts = 5000; // Límite para evitar bucles infinitos
        
        // Función para calcular cuántos puntos quedan disponibles
        const calculateRemainingPoints = () => {
            let used = 0;
            for (let i = 0; i < values.length; i++) {
                used += this.pointBuyCost(values[i]);
            }
            return pointsLimit - used;
        };

        // Paso 1: Determinar una distribución primaria (para qué queremos optimizar este personaje)
        // Opciones: Equilibrado, Físico (STR/DEX/CON), Mental (INT/WIS/CHA), Especialista (1-2 atributos altos)
        const buildTypes = ['balanced', 'physical', 'mental', 'specialist'];
        const selectedType = buildTypes[Math.floor(Math.random() * buildTypes.length)];
        
        // Crear pesos para cada atributo según el tipo de build
        let weights;
        switch (selectedType) {
            case 'physical':
                weights = [0.25, 0.25, 0.25, 0.08, 0.08, 0.09]; // STR, DEX, CON prioritarios
                break;
            case 'mental':
                weights = [0.08, 0.08, 0.09, 0.25, 0.25, 0.25]; // INT, WIS, CHA prioritarios
                break;
            case 'specialist':
                // Elegir 1-2 atributos para especializar
                weights = [0.05, 0.05, 0.05, 0.05, 0.05, 0.05];
                const primaryAttr = Math.floor(Math.random() * 6);
                weights[primaryAttr] = 0.5;
                
                // 50% de probabilidad de tener un segundo atributo prioritario
                if (Math.random() > 0.5) {
                    let secondaryAttr;
                    do {
                        secondaryAttr = Math.floor(Math.random() * 6);
                    } while (secondaryAttr === primaryAttr);
                    weights[secondaryAttr] = 0.25;
                }
                break;
            default: // balanced
                weights = [0.17, 0.17, 0.17, 0.16, 0.16, 0.17]; // Todos relativamente equilibrados
        }
        
        // Normalizar pesos (asegurarse que sumen 1)
        const weightSum = weights.reduce((sum, w) => sum + w, 0);
        weights = weights.map(w => w / weightSum);
        
        // Paso 2: Asignar puntos disponibles de manera ponderada por prioridades
        // Iteramos y aumentamos los atributos según sus pesos hasta que no podamos añadir más
        while (remainingPoints > 0 && attempts < maxAttempts) {
            attempts++;
            
            // Identificar atributos que podemos seguir aumentando
            const eligibleIndices = [];
            for (let i = 0; i < attributeCount; i++) {
                if (values[i] < maxAttr) {
                    const costToIncrease = this.pointBuyCost(values[i] + 1) - this.pointBuyCost(values[i]);
                    if (costToIncrease <= remainingPoints) {
                        eligibleIndices.push(i);
                    }
                }
            }
            
            if (eligibleIndices.length === 0) break;
            
            // Elegir un atributo para aumentar según los pesos
            const weightedSelection = Math.random();
            let accumulatedWeight = 0;
            let selectedIndex = eligibleIndices[0]; // valor predeterminado
            
            for (const idx of eligibleIndices) {
                accumulatedWeight += weights[idx];
                if (weightedSelection <= accumulatedWeight) {
                    selectedIndex = idx;
                    break;
                }
            }
            
            // Aumentar el atributo seleccionado y actualizar puntos restantes
            const oldValue = values[selectedIndex];
            values[selectedIndex]++;
            
            // Recalcular los puntos restantes (para manejar costos no lineales)
            remainingPoints = calculateRemainingPoints();
            
            // Si gastamos todos los puntos o no podemos aumentar ningún atributo más, terminamos
            if (remainingPoints <= 0) break;
            
            // Evitar bucles infinitos si no podemos gastar más puntos
            if (values.every(v => v === maxAttr)) break;
        }
        
        // Paso 3: Si aún nos quedan puntos, intentamos un enfoque greedy para optimizar
        if (remainingPoints > 0 && attempts < maxAttempts) {
            // Ordenar atributos por prioridad
            const indices = Array.from({ length: attributeCount }, (_, i) => i);
            indices.sort((a, b) => weights[b] - weights[a]);
            
            // Intentar aumentar los atributos en orden de prioridad hasta que no podamos más
            let madeChange = true;
            while (madeChange && remainingPoints > 0 && attempts < maxAttempts) {
                attempts++;
                madeChange = false;
                
                for (const i of indices) {
                    if (values[i] < maxAttr) {
                        const costToIncrease = this.pointBuyCost(values[i] + 1) - this.pointBuyCost(values[i]);
                        if (costToIncrease <= remainingPoints) {
                            values[i]++;
                            remainingPoints = calculateRemainingPoints();
                            madeChange = true;
                            break;
                        }
                    }
                }
            }
        }
        
        return values;
    }
}

// Exportar para uso global
window.attributeManager = new AttributeManager();