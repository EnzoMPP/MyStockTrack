export const formatBirthDate = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    if (cleaned.length > 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5);
    }
    return cleaned.slice(0, 10); // Limita a string a 10 caracteres
  };
  
  export const formatCep = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5, 8);
    } else {
      cleaned = cleaned.slice(0, 8);
    }
    return cleaned;
  };
  
  export const formatPhone = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    let formatted = '';
  
    if (cleaned.length > 0) {
      formatted += '(' + cleaned.slice(0, 2);
    }
    if (cleaned.length >= 3) {
      formatted += ') ' + cleaned.slice(2, 7);
    }
    if (cleaned.length >= 8) {
      formatted += '-' + cleaned.slice(7, 11);
    }
  
    return formatted;
  };
  
  export const formatCpf = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    let formatted = '';
  
    if (cleaned.length > 0) {
      formatted += cleaned.slice(0, 3);
    }
    if (cleaned.length >= 4) {
      formatted += '.' + cleaned.slice(3, 6);
    }
    if (cleaned.length >= 7) {
      formatted += '.' + cleaned.slice(6, 9);
    }
    if (cleaned.length >= 10) {
      formatted += '-' + cleaned.slice(9, 11);
    }
  
    return formatted;
  };