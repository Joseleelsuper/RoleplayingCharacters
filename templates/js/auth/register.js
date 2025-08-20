/**
 * Módulo de autenticación para manejo seguro de registro.
 * 
 * Este módulo maneja el formulario de registro de forma segura usando POST requests
 * y validación del lado del cliente antes de enviar al servidor.
 */

(function() {
    'use strict';

    // Elementos del DOM
    const registerForm = document.getElementById('register-form');
    const usernameInput = document.getElementById('reg-username');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const password2Input = document.getElementById('reg-password2');
    const submitButton = registerForm?.querySelector('button[type="submit"]');
    const feedbackDiv = document.getElementById('register-feedback');

    // Elementos de error
    const usernameError = document.getElementById('reg-username-error');
    const emailError = document.getElementById('reg-email-error');
    const passwordError = document.getElementById('reg-password-error');
    const password2Error = document.getElementById('reg-password2-error');

    /**
     * Obtiene cadenas i18n desde el DOM.
     */
    function t() {
        try {
            // eslint-disable-next-line no-undef
            if (window.__getI18n) return window.__getI18n('register-i18n', {});
        } catch {}
        const el = document.getElementById('register-i18n');
        return {
            usernameMin: el?.dataset.usernameMin || 'El nombre de usuario debe tener al menos 3 caracteres',
            usernameFormat: el?.dataset.usernameFormat || 'Solo se permiten letras, números, guiones y guiones bajos',
            emailRequired: el?.dataset.emailRequired || 'El email es requerido',
            emailInvalid: el?.dataset.emailInvalid || 'Formato de email inválido',
            passwordMinLength: el?.dataset.passwordMinLength || 'La contraseña debe tener al menos 8 caracteres',
            passwordLetter: el?.dataset.passwordLetter || 'La contraseña debe contener al menos una letra',
            passwordNumber: el?.dataset.passwordNumber || 'La contraseña debe contener al menos un número',
            passwordMismatch: el?.dataset.passwordMismatch || 'Las contraseñas no coinciden',
            feedbackSuccess: el?.dataset.feedbackSuccess || 'Cuenta creada exitosamente',
            feedbackFailed: el?.dataset.feedbackFailed || 'Error al crear la cuenta',
            connectionError: el?.dataset.feedbackConnection || 'Error de conexión. Por favor, inténtalo de nuevo.',
            buttonLoading: el?.dataset.buttonLoading || 'Creando cuenta...',
            buttonSubmit: document.querySelector('#register-form button[type="submit"]').textContent || 'Crear cuenta'
        };
    }

    /**
     * Limpia todos los mensajes de error del formulario.
     */
    function clearErrors() {
        if (usernameError) usernameError.textContent = '';
        if (emailError) emailError.textContent = '';
        if (passwordError) passwordError.textContent = '';
        if (password2Error) password2Error.textContent = '';
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
        if (errors.username && usernameError) {
            usernameError.textContent = errors.username[0];
        }
        if (errors.email && emailError) {
            emailError.textContent = errors.email[0];
        }
        if (errors.password && passwordError) {
            passwordError.textContent = errors.password[0];
        }
        if (errors.password2 && password2Error) {
            password2Error.textContent = errors.password2[0];
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
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const password2 = formData.get('password2');
        let isValid = true;

        clearErrors();

        // Validar username
        const i18n = t();
        if (!username || username.trim().length < 3) {
            if (usernameError) usernameError.textContent = i18n.usernameMin;
            isValid = false;
        } else if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
            if (usernameError) usernameError.textContent = i18n.usernameFormat;
            isValid = false;
        }

        // Validar email
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
        } else {
            // Validar fortaleza de contraseña
            if (!/[A-Za-z]/.test(password)) {
                if (passwordError) passwordError.textContent = i18n.passwordLetter;
                isValid = false;
            } else if (!/\d/.test(password)) {
                if (passwordError) passwordError.textContent = i18n.passwordNumber;
                isValid = false;
            }
        }

        // Validar confirmación de contraseña
        if (!password2 || password2 !== password) {
            if (password2Error) password2Error.textContent = i18n.passwordMismatch;
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
            submitButton.textContent = submitButton.dataset.originalText || i18n.buttonSubmit || 'Crear cuenta';
        }
    }

    /**
     * Envía los datos de registro al servidor de forma segura.
     * @param {FormData} formData - Datos del formulario
     */
    async function submitRegister(formData) {
        try {
            setLoading(true);
            clearErrors();

            // Preparar datos para envío seguro
            const registerData = {
                username: formData.get('username').trim(),
                email: formData.get('email').trim(),
                password: formData.get('password'),
                password2: formData.get('password2')
            };

            // Enviar POST request con JSON
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin', // Incluir cookies
                body: JSON.stringify(registerData)
            });

            const result = await response.json();

            const i18n = t();
            if (response.ok && result.success) {
                // Registro exitoso
                showFeedback(result.message || i18n.feedbackSuccess, 'success');
                
                // Redirigir después de un breve delay
                setTimeout(() => {
                    window.location.href = result.redirect_url || '/';
                }, 1500);
            } else {
                // Manejar errores del servidor
                if (result.errors) {
                    showFieldErrors(result.errors);
                }
                showFeedback(result.message || i18n.feedbackFailed);
            }
        } catch (error) {
            console.error('Error en registro:', error);
            showFeedback(t().connectionError);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Maneja el envío del formulario de registro.
     * @param {Event} event - Evento de envío del formulario
     */
    async function handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(registerForm);
        
        // Validar formulario en el cliente
        if (!validateForm(formData)) {
            return;
        }

        // Enviar datos al servidor
        await submitRegister(formData);
    }

    /**
     * Valida las contraseñas en tiempo real.
     */
    function validatePasswordMatch() {
        if (!passwordInput || !password2Input) return;
        
        const password = passwordInput.value;
        const password2 = password2Input.value;
        
        if (password2 && password !== password2) {
            if (password2Error) password2Error.textContent = 'Las contraseñas no coinciden';
        } else {
            if (password2Error) password2Error.textContent = '';
        }
    }

    /**
     * Inicializa el módulo de registro.
     */
    function init() {
        if (!registerForm) {
            console.warn('Formulario de registro no encontrado');
            return;
        }

        // Configurar evento de envío
        registerForm.addEventListener('submit', handleSubmit);

        // Limpiar errores al escribir en los campos
        if (usernameInput) {
            usernameInput.addEventListener('input', () => {
                if (usernameError) usernameError.textContent = '';
            });
        }

        if (emailInput) {
            emailInput.addEventListener('input', () => {
                if (emailError) emailError.textContent = '';
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                if (passwordError) passwordError.textContent = '';
                validatePasswordMatch(); // Revalidar coincidencia
            });
        }

        if (password2Input) {
            password2Input.addEventListener('input', () => {
                validatePasswordMatch();
            });
        }

        console.log('Módulo de registro inicializado');
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
