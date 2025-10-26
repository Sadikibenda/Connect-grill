/**
* PHP Email Form Validation - v3.11
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: {'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => {
      if( response.ok ) {
        return response.text();
      } else {
        throw new Error(`${response.status} ${response.statusText} ${response.url}`); 
      }
    })
    .then(data => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      
      // Try to parse as JSON first
      let responseData;
      try {
        responseData = JSON.parse(data);
      } catch (e) {
        responseData = null;
      }
      
      // Check for JSON success response
      if (responseData && responseData.success === true) {
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset(); 
      }
      // Check for traditional 'OK' response
      else if (data.trim() == 'OK') {
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset(); 
      } else {
        // Handle error cases
        let errorMessage = 'Form submission failed';
        if (responseData && responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData && responseData.error) {
          errorMessage = responseData.error;
        } else if (data) {
          errorMessage = data;
        }
        throw new Error(errorMessage + ' (from: ' + action + ')'); 
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    
    let errorMessage = error;
    
    // If error is an Error object, get the message
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // Try to parse JSON error messages and make them user-friendly
    try {
      const jsonError = JSON.parse(errorMessage);
      if (jsonError.message) {
        errorMessage = jsonError.message;
      } else if (jsonError.error) {
        errorMessage = jsonError.error;
      }
    } catch (e) {
      // Not JSON, use as is
    }
    
    // Make sure we don't show raw JSON to users
    if (errorMessage.includes('{"success"') && errorMessage.includes('"data"')) {
      errorMessage = 'There was an issue processing your request. Please try again.';
    }
    
    thisForm.querySelector('.error-message').innerHTML = errorMessage;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
