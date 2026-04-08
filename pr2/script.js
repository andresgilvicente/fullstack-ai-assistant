// Espera a que todo el HTML se haya cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorsDiv = document.getElementById('errors');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = loginForm.querySelector('#username').value;
            const password = loginForm.querySelector('#password').value;
            errorsDiv.innerHTML = '';

            try {

                const response = await fetch('http://localhost:8000/api/auth/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                if (!response.ok) {

                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Usuario o contraseña incorrectos.');
                }

                const data = await response.json();
                const token = data.access;

                localStorage.setItem('authToken', token);

                console.log('Token guardado:', token);
                alert('Inicio de sesión exitoso. Redirigiendo...');


            } catch (error) {

                errorsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
                console.error('Error en el login:', error);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = registerForm.querySelector('#username').value;
            const email = registerForm.querySelector('#email').value;
            const password = registerForm.querySelector('#password').value;
            const password2 = registerForm.querySelector('#password2').value;
            errorsDiv.innerHTML = '';

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errorsDiv.innerHTML = '<p>Error: El formato del email no es válido.</p>';
                return;
            }

            if (password !== password2) {
                errorsDiv.innerHTML = '<p>Error: Las contraseñas no coinciden.</p>';
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/api/users/register/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password, password2 }),
                });

                if (!response.ok) {

                    const errorData = await response.json();

                    let errorMessage = 'No se pudo completar el registro.';
                    if (errorData.username) errorMessage += ` Usuario: ${errorData.username.join(' ')}`;
                    if (errorData.email) errorMessage += ` Email: ${errorData.email.join(' ')}`;
                    if (errorData.password) errorMessage += ` Contraseña: ${errorData.password.join(' ')}`;
                    throw new Error(errorMessage);
                }

                alert('¡Registro completado con éxito! Ahora puedes iniciar sesión.');

                window.location.href = 'login.html';

            } catch (error) {
                errorsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
                console.error('Error en el registro:', error);
            }
        });
    }
});
