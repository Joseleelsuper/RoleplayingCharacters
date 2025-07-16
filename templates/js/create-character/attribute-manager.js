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
        this.currentAttributeSystem = 'dnd5e';
    }
    
    init() {
        this.attributeSystemSelect = document.getElementById('attribute-system');
        this.customConfig = document.getElementById('custom-attribute-config');
        this.attributeButtons = document.querySelectorAll('.attribute-btn');
        this.attributePointsRemaining = document.getElementById('points-remaining');
        this.randomStatsBtn = document.getElementById('random-attributes-btn');
        this.defaultStatsBtn = document.getElementById('default-attributes-btn');
        
        this.setupAttributeControls();
        this.setupAttributeSystemSelector();
        this.setupRandomButtons();
        this.setupCustomConfigInputs();
        this.updateAttributePointsRemaining();
        this.updateAttributeButtonStates();
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
                if (['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].includes(attribute)) {
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
                    
                    if (isIncrease) {
                        input.value = Math.min(value + 1, parseInt(input.max));
                    } else if (!isIncrease) {
                        input.value = Math.max(value - 1, parseInt(input.min));
                    }
                    
                    // Actualizar modificador si existe
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
                        this.updateModifier(attr, values[i]);
                    }
                });
                
                this.updateAttributePointsRemaining();
                this.updateAttributeButtonStates();
                
                // Notificar cambio en todos los atributos
                document.dispatchEvent(new CustomEvent('attributesReset'));
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
                    
                    if (maxVal >= minVal && maxVal <= 30) {
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
                    
                    if (pointsVal >= 1 && pointsVal <= 100) {
                        this.attributeSystems.custom.pointsLimit = pointsVal;
                        this.updateAttributePointsRemaining();
                    } else {
                        customPoints.value = this.attributeSystems.custom.pointsLimit;
                    }
                });
            }
        }
    }
    
    setupCustomConfigInputs() {
        const customMin = document.getElementById('custom-min');
        const customMax = document.getElementById('custom-max');
        const customPoints = document.getElementById('custom-points');
        
        if (customMin && customMax && customPoints) {
            // Inicializar con los valores actuales
            this.updateCustomSystem(
                parseInt(customMin.value),
                parseInt(customMax.value),
                parseInt(customPoints.value)
            );
            
            // Configurar eventos de cambio
            customMin.addEventListener('change', () => {
                this.updateCustomFromInputs();
            });
            
            customMax.addEventListener('change', () => {
                this.updateCustomFromInputs();
            });
            
            customPoints.addEventListener('change', () => {
                this.updateCustomFromInputs();
            });
            
            // Asegurar que los eventos de input también actualicen los valores inmediatamente
            customMin.addEventListener('input', () => {
                this.updateCustomFromInputs();
            });
            
            customMax.addEventListener('input', () => {
                this.updateCustomFromInputs();
            });
            
            customPoints.addEventListener('input', () => {
                this.updateCustomFromInputs();
            });
        }
    }
    
    updateCustomFromInputs() {
        const customMin = document.getElementById('custom-min');
        const customMax = document.getElementById('custom-max');
        const customPoints = document.getElementById('custom-points');
        
        if (customMin && customMax && customPoints) {
            const minVal = parseInt(customMin.value) || 1;
            const maxVal = parseInt(customMax.value) || 15;
            const pointsVal = parseInt(customPoints.value) || 27;
            
            // Validar valores
            if (minVal < 1) customMin.value = 1;
            if (maxVal > 30) customMax.value = 30;
            if (minVal > maxVal) customMin.value = maxVal;
            if (pointsVal < 1) customPoints.value = 1;
            if (pointsVal > 100) customPoints.value = 100;
            
            // Actualizar sistema con valores validados
            this.updateCustomSystem(
                parseInt(customMin.value),
                parseInt(customMax.value),
                parseInt(customPoints.value)
            );
            
            // Si el sistema actual es custom, actualizar inmediatamente todos los campos
            if (this.currentAttributeSystem === 'custom') {
                this.updateAttributeLimits();
                this.updateAttributePointsRemaining();
                this.updateAttributeButtonStates();
            }
        }
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
            // Usar el texto de traducción para "Aleatorio"
            randomBtnText.innerHTML = `<i class="icon-dice"></i> ${randomBtnText.dataset.text || 'Random'}`;
        }
        
        if (defaultBtnText) {
            // Usar el texto de traducción para "Por Defecto"
            defaultBtnText.innerHTML = `<i class="icon-reset"></i> ${defaultBtnText.dataset.text || 'Default'}`;
        }
    }
}

// Exportar para uso global
window.attributeManager = new AttributeManager();
// Exportar para uso global
window.attributeManager = new AttributeManager();
