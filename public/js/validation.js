/*
 * Reglas de validación del registro.
 * Este archivo se comparte entre el NAVEGADOR (window.Validation)
 * y el SERVIDOR (module.exports), así las reglas son idénticas en ambos lados.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Validation = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
  var USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

  function computeAge(dateString) {
    var dob = new Date(dateString);
    if (isNaN(dob.getTime())) return null;
    var today = new Date();
    var age = today.getFullYear() - dob.getFullYear();
    var m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  function validateRegistration(data, options) {
    data = data || {};
    options = options || {};
    var existingUsers = options.existingUsers || [];

    var errors = {};
    var nombre = String(data.nombre || '').trim();
    var usuario = String(data.usuario || '').trim();
    var email = String(data.email || '').trim().toLowerCase();
    var password = String(data.password || '');
    var confirmPassword = String(data.confirmPassword || '');
    var fechaNacimiento = String(data.fechaNacimiento || '');
    var terminos = !!data.terminos;

    // Nombre completo
    if (nombre.length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres.';
    } else if (!NAME_RE.test(nombre)) {
      errors.nombre = 'El nombre solo puede contener letras y espacios.';
    }

    // Usuario (único)
    if (!USERNAME_RE.test(usuario)) {
      errors.usuario = 'El usuario debe tener entre 3 y 20 caracteres (letras, números o _).';
    } else if (
      existingUsers.some(function (u) {
        return String(u.usuario || '').toLowerCase() === usuario.toLowerCase();
      })
    ) {
      errors.usuario = 'Ese nombre de usuario ya está en uso.';
    }

    // Email (formato + único)
    if (!EMAIL_RE.test(email)) {
      errors.email = 'Ingresa un correo electrónico válido.';
    } else if (
      existingUsers.some(function (u) {
        return String(u.email || '').toLowerCase() === email;
      })
    ) {
      errors.email = 'Ese correo ya está registrado.';
    }

    // Contraseña
    if (password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = 'La contraseña debe incluir al menos una letra y un número.';
    }

    // Confirmación
    if (confirmPassword !== password) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    // Fecha de nacimiento (edad >= 13)
    if (!fechaNacimiento) {
      errors.fechaNacimiento = 'Ingresa tu fecha de nacimiento.';
    } else {
      var age = computeAge(fechaNacimiento);
      if (age === null) {
        errors.fechaNacimiento = 'La fecha no es válida.';
      } else if (age < 13) {
        errors.fechaNacimiento = 'Debes tener al menos 13 años para registrarte.';
      } else if (age > 120) {
        errors.fechaNacimiento = 'La fecha no es válida.';
      }
    }

    // Términos
    if (!terminos) {
      errors.terminos = 'Debes aceptar los términos y condiciones.';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors: errors,
      values: {
        nombre: nombre,
        usuario: usuario,
        email: email,
        password: password,
        fechaNacimiento: fechaNacimiento,
      },
    };
  }

  return {
    validateRegistration: validateRegistration,
    computeAge: computeAge,
  };
});
