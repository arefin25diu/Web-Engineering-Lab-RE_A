document.getElementById('biodataForm').addEventListener('submit', function (event) {
    event.preventDefault();

    let errorMessage = '';
    let isValid = true;

    const name = document.getElementById('name').value;
    const gender = document.getElementById('gender').value;
    const dob = document.getElementById('dob').value;
    const contact = document.getElementById('contact').value;
    const email = document.getElementById('email').value;
    const height = document.getElementById('height').value;
    const education = document.getElementById('education').value;
    const occupation = document.getElementById('occupation').value;
    const location = document.getElementById('location').value;
    const religion = document.getElementById('religion').value;

    
    if (!name || !gender || !dob || !contact || !email || !height || !education || !occupation || !location || !religion) {
        errorMessage += 'All fields must be filled out.<br>';
        isValid = false;
    }

 
    const contactPattern = /^[0-9]{10}$/;
    if (!contactPattern.test(contact)) {
        errorMessage += 'Please enter a valid 10-digit contact number.<br>';
        isValid = false;
    }

    
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        errorMessage += 'Please enter a valid email address.<br>';
        isValid = false;
    }

    if (isValid) {
        alert('Form submitted successfully!');
        document.getElementById('biodataForm').reset();  
        document.getElementById('error-message').innerHTML = errorMessage;
    }
});
