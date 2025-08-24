/**
 * Módulo de autenticación para manejo seguro de login.
 * 
 * Este módulo maneja el formulario de login de forma segura usando POST requests
 * y validación del lado del cliente antes de enviar al servidor.
 */

(function() {
    'use strict';

    // Elementos del DOM
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitButton = loginForm?.querySelector('button[type="submit"]');
    const feedbackDiv = document.getElementById('login-feedback');

    // Elementos de error
    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');

    /**
     * Obtiene cadenas i18n desde el DOM.
     */
    function t() {
        // Carga perezosa del util para no romper si falla import
        try {
            // eslint-disable-next-line no-undef
            if (window.__getI18n) return window.__getI18n('login-i18n', {});
        } catch {}
        const el = document.getElementById('login-i18n');
        return {
            emailRequired: el?.dataset.emailRequired || 'El email es requerido',
            emailInvalid: el?.dataset.emailInvalid || 'Formato de email inválido',
            passwordMinLength: el?.dataset.passwordMinLength || 'La contraseña debe tener al menos 8 caracteres',
            feedbackSuccess: el?.dataset.feedbackSuccess || 'Login exitoso',
            feedbackFailed: el?.dataset.feedbackFailed || 'Error al iniciar sesión',
            connectionError: el?.dataset.feedbackConnection || 'Error de conexión. Por favor, inténtalo de nuevo.',
            buttonLoading: el?.dataset.buttonLoading || 'Iniciando sesión...',
            invalidCredentials: el?.dataset.invalidCredentials || 'Email o contraseña incorrectos',
            buttonSubmit: document.querySelector('#login-form button[type="submit"]').textContent || 'Entrar'
        };
    }

    /**
     * Limpia todos los mensajes de error del formulario.
     */
    function clearErrors() {
        if (emailError) emailError.textContent = '';
        if (passwordError) passwordError.textContent = '';
        if (feedbackDiv) {
            feedbackDiv.textContent = '';
            feedbackDiv.className = 'form-feedback';
        }
    }

    /**
     * Muestra errores específicos en los campos correspondientes.
     * @param {Object} errors - Objeto con errores por campo
     */
    function showFieldErrors(errors) {
        if (errors.email && emailError) {
            emailError.textContent = errors.email[0];
        }
        if (errors.password && passwordError) {
            passwordError.textContent = errors.password[0];
        }
    }

    /**
     * Muestra un mensaje de feedback general al usuario.
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje ('success', 'error')
     */
    function showFeedback(message, type = 'error') {
        if (!feedbackDiv) return;
        
        feedbackDiv.textContent = message;
        feedbackDiv.className = `form-feedback ${type === 'success' ? 'success' : 'error'}`;
    }

    /**
     * Valida el formulario en el lado del cliente.
     * @param {FormData} formData - Datos del formulario
     * @returns {boolean} - True si el formulario es válido
     */
    function validateForm(formData) {
        const email = formData.get('email');
        const password = formData.get('password');
        let isValid = true;

        clearErrors();

        // Validar email
        const i18n = t();
        if (!email || email.trim() === '') {
            if (emailError) emailError.textContent = i18n.emailRequired;
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            if (emailError) emailError.textContent = i18n.emailInvalid;
            isValid = false;
        }

        // Validar contraseña
        if (!password || password.length < 8) {
            if (passwordError) passwordError.textContent = i18n.passwordMinLength;
            isValid = false;
        }

        return isValid;
    }

    /**
     * Cambia el estado de carga del botón de envío.
     * @param {boolean} loading - Estado de carga
     */
    function setLoading(loading) {
        if (!submitButton) return;
        
        const i18n = t();
        if (loading) {
            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.textContent;
            submitButton.textContent = i18n.buttonLoading;
        } else {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.dataset.originalText || i18n.buttonSubmit || 'Entrar';
        }
    }

    /**
     * Envía los datos de login al servidor de forma segura.
     * @param {FormData} formData - Datos del formulario
     */
    async function submitLogin(formData) {
        try {
            setLoading(true);
            clearErrors();

            // Preparar datos para envío seguro
            const loginData = {
                email: formData.get('email').trim(),
                password: formData.get('password')
            };

            // Enviar POST request con JSON
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin', // Incluir cookies
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            const i18n = t();
            if (response.ok && result.success) {
                // Login exitoso
                showFeedback(result.message || i18n.feedbackSuccess, 'success');
                
                // Redirigir después de un breve delay
                setTimeout(() => {
                    // Respetar parámetro ?next= si es una ruta local segura
                    const params = new URLSearchParams(window.location.search);
                    const next = params.get('next');
                    const isSafeLocalPath = (p) => typeof p === 'string' && p.startsWith('/') && !p.startsWith('//');
                    const target = isSafeLocalPath(next) ? next : (result.redirect_url || '/');
                    window.location.assign(target);
                }, 1500);
            } else {
                // Manejar errores del servidor
                if (result.message === 'Credenciales inválidas' && passwordError) {
                    passwordError.textContent = i18n.invalidCredentials;
                }
                if (result.errors) {
                    showFieldErrors(result.errors);
                }
                showFeedback(result.message || i18n.feedbackFailed);
            }
        } catch (error) {
            console.error('Error en login:', error);
            showFeedback(t().connectionError);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Maneja el envío del formulario de login.
     * @param {Event} event - Evento de envío del formulario
     */
    async function handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(loginForm);
        
        // Validar formulario en el cliente
        if (!validateForm(formData)) {
            return;
        }

        // Enviar datos al servidor
        await submitLogin(formData);
    }

    /**
     * Inicializa el módulo de login.
     */
    function init() {
        if (!loginForm) {
            console.warn('Formulario de login no encontrado');
            return;
        }

        // Configurar evento de envío
        loginForm.addEventListener('submit', handleSubmit);

        // Limpiar errores al escribir en los campos
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                if (emailError) emailError.textContent = '';
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                if (passwordError) passwordError.textContent = '';
            });
        }

        console.log('Módulo de login inicializado');
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
