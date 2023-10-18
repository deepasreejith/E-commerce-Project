function validateForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const telephone = document.getElementById('telephone').value;
    const comment = document.getElementById('comment').value;
  
    if (!name || !email || !telephone || !comment) {
      alert('All fields must be filled out');
      return false;
    }
  
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }
  
    // Simple telephone validation (10 digits)
    const telephoneRegex = /^\d{10}$/;
    if (!telephoneRegex.test(telephone)) {
      alert('Please enter a valid telephone number (10 digits)');
      return false;
    }
  
    return true;
  }