import { registerUser } from './helpers/server-talker';
import {
  UserData,
//  ^?
  RegistResult,
//  ^?
  usernameExists,
} from './helpers/server-talker';

import { validateUsername,validateEmail,validatePassword, validateField, showNotification } from './helpers/helpers';

// On document load
$(function () {
  const userForm = document.getElementById('registerForm') as HTMLFormElement;

  // All fields
  const userField = $('#username') as JQuery<HTMLInputElement>;
  const emailField = $('#email') as JQuery<HTMLInputElement>;
  const passwordField = $('#password') as JQuery<HTMLInputElement>;
  const confirmField = $('#confirmPassword') as JQuery<HTMLInputElement>;

  // Password must contain X textbox
  const passwordData = $('#password-data') as JQuery<HTMLDivElement>;
  passwordField.on('input', () => {
    passwordData.removeClass('hidden');
  });
  passwordField.on('blur', () => {
    passwordData.addClass('hidden');
  });

  // Is username in use button
  const checkButton = $('#check-user') as JQuery<HTMLButtonElement>;
  const takenLabel = $('#username-taken-label') as JQuery<HTMLLabelElement>;

  // Hide label when username updates
  userField.on('input', () => {
    takenLabel.addClass('hidden');
  });

  const updateLabel = (text: string, className: string) => {
    takenLabel
      .removeClass('hidden valid invalid')
      .addClass(className)
      .text(text);
  };

  checkButton.on('click', async () => {
    const username = userField.val() as string;

    if (!validateUsername(username)) {
      updateLabel('Invalid username', 'invalid');
      return;
    }

    try {
      const result = await usernameExists(username);
      if (!result) {
        updateLabel('Username available', 'valid');
      } else {
        updateLabel('Username already in use', 'invalid');
      }
    }
    catch (e: any) {
      showNotification(e.message, 'ERROR');
    }
  });

  // Updates fields as user is typing
  validateField(userField, validateUsername);
  validateField(emailField, validateEmail);
  validateField(passwordField, validatePassword);
  validateField(confirmField, () => passwordField.val() === confirmField.val());

  // Send form to server
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clientside validation
    if (!validateUsername(userField.val() as string)) {
      alert('Invalid Username');
      return;
    }
    if (!validateEmail(emailField.val() as string)) {
      alert('Invalid Email');
      return;
    }
    if (!validatePassword(passwordField.val() as string)) {
      alert('Invalid Password');
      return;
    }

    // Assemble data and send
    const data: UserData = {
      username: userField.val() as string,
      email: emailField.val() as string,
      password: passwordField.val() as string,
    };

    // Handle possible results

    try {
      const result = await registerUser(data);

      switch (result) {
        case 'EXISTS':
          alert('Username already taken!');
          break;
        case 'INVALID':
          alert('Invalid Data');
          break;
        case 'SUCCESS':
          alert('Registration Successful');
          window.location.href = '/login';
          break;
      }
    }
    catch (e:any) {
      showNotification(e.message, 'ERROR');
    }
  });
});
