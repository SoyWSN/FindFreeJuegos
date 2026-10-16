// Pantalla de Registro: validación en vivo (cliente) + envío al servidor.
(function () {
  'use strict';

  var form = document.getElementById('registerForm');
  var statusEl = document.getElementById('formStatus');
  var FIELDS = ['nombre', 'usuario', 'email', 'password', 'confirmPassword', 'fechaNacimiento', 'terminos'];

  function setStatus(type, message) {
    if (!message) {
      statusEl.hidden = true;
      statusEl.textContent = '';
      return;
    }
    statusEl.hidden = false;
    statusEl.className = 'status status--' + type;
    statusEl.textContent = message;
  }

  function setFieldError(name, message) {
    var errorEl = document.querySelector('[data-error-for="' + name + '"]');
    var input = form.elements[name];
    if (errorEl) errorEl.textContent = message || '';
    if (input && input.closest) {
      var field = input.closest('.field');
      if (field) field.classList.toggle('has-error', Boolean(message));
    }
  }

  function clearErrors() {
    FIELDS.forEach(function (name) { setFieldError(name, ''); });
  }

  function collect() {
    return {
      nombre: form.elements.nombre.value,
      usuario: form.elements.usuario.value,
      email: form.elements.email.value,
      password: form.elements.password.value,
      confirmPassword: form.elements.confirmPassword.value,
      fechaNacimiento: form.elements.fechaNacimiento.value,
      terminos: form.elements.terminos.checked,
    };
  }

  function showErrors(errors) {
    Object.keys(errors).forEach(function (name) { setFieldError(name, errors[name]); });
    var first = Object.keys(errors)[0];
    if (first && form.elements[first] && form.elements[first].focus) form.elements[first].focus();
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors();
    setStatus('', '');

    var data = collect();

    // 1) Validación en el cliente (rápida, sin viajar al servidor)
    var clientResult = window.Validation.validateRegistration(data, { existingUsers: [] });
    if (!clientResult.valid) {
      showErrors(clientResult.errors);
      setStatus('error', 'Revisa los campos marcados en rojo.');
      return;
    }

    // 2) Envío al servidor (que vuelve a validar)
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creando cuenta...';

    try {
      var res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      var result = await res.json();

      if (!res.ok || !result.ok) {
        if (result.errors) showErrors(result.errors);
        throw new Error(result.error || 'No se pudo completar el registro.');
      }

      setStatus('success', result.message || 'Cuenta creada correctamente.');
      form.reset();
    } catch (err) {
      setStatus('error', err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Registrarme';
    }
  });

  // Limpia el error del campo en cuanto el usuario lo corrige
  FIELDS.forEach(function (name) {
    var input = form.elements[name];
    if (!input) return;
    var evt = input.type === 'checkbox' ? 'change' : 'input';
    input.addEventListener(evt, function () {
      var errorEl = document.querySelector('[data-error-for="' + name + '"]');
      if (errorEl && errorEl.textContent) setFieldError(name, '');
    });
  });
})();
