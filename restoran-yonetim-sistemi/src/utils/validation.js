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
      // Remove spaces and check if it matches Turkish phone format
      const cleanPhone = formData.phone.replace(/\s/g, '');
      const phoneRegex = /^05[0-9]{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        errors.push("Geçerli bir telefon numarası giriniz (0 5xx xxx xx xx)");
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

    // Password validation removed: password will be set via email reset flow

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
    const cleanPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^05[0-9]{9}$/;
    return phoneRegex.test(cleanPhone);
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
