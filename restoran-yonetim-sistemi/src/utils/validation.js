// Validation utilities for form validation
export const validationUtils = {
  // Validate personnel form
  validatePersonnelForm(formData) {
    const errors = [];

    // Name validation
    if (!formData.name.trim()) {
      errors.push("Ad Soyad alanı zorunludur");
    }

    // Phone validation (Turkish format)
    if (!formData.phone.trim()) {
      errors.push("Telefon alanı zorunludur");
    } else {
      const phoneRegex = /^05[0-9]{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.push("Geçerli bir telefon numarası giriniz (05xxxxxxxxx)");
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.push("E-posta alanı zorunludur");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push("Geçerli bir e-posta adresi giriniz");
      }
    }

    // Password validation
    if (!formData.password.trim()) {
      errors.push("Şifre alanı zorunludur");
    } else if (formData.password.length < 6) {
      errors.push("Şifre en az 6 karakter olmalıdır");
    } else {
      // Password complexity validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(formData.password)) {
        errors.push("Şifre en az bir küçük harf, bir büyük harf, bir rakam ve bir özel karakter içermelidir");
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone format (Turkish)
  validatePhone(phone) {
    const phoneRegex = /^05[0-9]{9}$/;
    return phoneRegex.test(phone);
  },

  // Validate password strength
  validatePassword(password) {
    const minLength = 6;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Şifre en az ${minLength} karakter olmalıdır`);
    }
    if (!hasLower) {
      errors.push("En az bir küçük harf içermelidir");
    }
    if (!hasUpper) {
      errors.push("En az bir büyük harf içermelidir");
    }
    if (!hasNumber) {
      errors.push("En az bir rakam içermelidir");
    }
    if (!hasSpecial) {
      errors.push("En az bir özel karakter içermelidir (@$!%*?&)");
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // Sanitize form data
  sanitizeFormData(formData) {
    return {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      role: formData.role
    };
  }
};
