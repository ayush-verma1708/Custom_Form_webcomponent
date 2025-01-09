class CustomConsentForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentLanguage = 'en'; // Default language set to English
    this.languageMapping = {}; // To store mappings of language data
  }

  async connectedCallback() {
    const formId = this.getAttribute('form-id');
    if (!formId) {
      console.error('The "form-id" attribute is required.');
      return;
    }

    try {
      // Fetch the form configuration from the API
      const formConfig = await this.fetchFormConfig(formId);
      this.languageMapping = this.processFormConfig(formConfig);
      this.renderForm(formConfig);

      // Set the default language after rendering the form
      this.setLanguage(this.currentLanguage);
    } catch (error) {
      console.error('Error loading consent form:', error);
      this.shadowRoot.innerHTML = `<p>Failed to load consent form. Please try again later.</p>`;
    }
  }

  async fetchFormConfig(formId) {
    const response = await fetch(`http://localhost:5000/api/banners/${formId}`);
    if (!response.ok) throw new Error('Failed to fetch form configuration.');
    return response.json();
  }

  processFormConfig(formConfig) {
    const languageMapping = {
      text: {},
      buttonText: {},
      consentCategories: [],
    };

    // Process 'text' and 'buttonText' values
    if (formConfig.text && Array.isArray(formConfig.text)) {
      formConfig.text.forEach((textItem) => {
        languageMapping.text[textItem.language] = textItem.value;
      });
    }

    if (formConfig.buttonText && Array.isArray(formConfig.buttonText)) {
      formConfig.buttonText.forEach((buttonItem) => {
        languageMapping.buttonText[buttonItem.language] = buttonItem.value;
      });
    }

    // Process 'consentCategories' values
    if (
      formConfig.consentCategories &&
      Array.isArray(formConfig.consentCategories)
    ) {
      formConfig.consentCategories.forEach((category) => {
        const categoryData = {
          title: {},
          description: {},
          reason: {},
          consentType: category.consentType,
          yesOrNo: category.yesOrNo,
        };

        if (category.title && Array.isArray(category.title)) {
          category.title.forEach((item) => {
            categoryData.title[item.language] = item.value;
          });
        }

        if (category.description && Array.isArray(category.description)) {
          category.description.forEach((item) => {
            categoryData.description[item.language] = item.value;
          });
        }

        if (category.reason && Array.isArray(category.reason)) {
          category.reason.forEach((item) => {
            categoryData.reason[item.language] = item.value;
          });
        }

        languageMapping.consentCategories.push(categoryData);
      });
    }

    return languageMapping;
  }

  renderForm(config) {
    this.shadowRoot.innerHTML = `
      <style>
        /* Animation */
        @keyframes slideIn {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        /* Banner Styles */
        .banner {
          animation: slideIn 0.5s ease-out forwards;
          position: fixed;
          bottom: 0;
          width: 100%;
          background-color: ${config.backgroundColor || '#f9f9f9'};
          color: ${config.textColor || '#000'};
          padding: 1rem;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
        }

        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .btn.accept {
          background-color: ${config.acceptButtonColor || '#4caf50'};
          color: #fff;
        }

        .btn.reject {
          background-color: ${config.rejectButtonColor || '#f44336'};
          color: #fff;
        }

        .btn.settings {
          background-color: ${config.settingsButtonColor || '#007bff'};
          color: #fff;
        }

        .settings-dialog {
          display: none;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 600px;
          background-color: #fff;
          padding: 1rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          border-radius: 5px;
          z-index: 1010;
        }

        .settings-dialog.active {
          display: block;
          animation: fadeIn 0.3s ease-out forwards;
        }
      </style>

      <div class="banner">
        <div class="content">
          <p>${
            this.languageMapping.text[this.currentLanguage] ||
            'We use cookies to enhance your experience.'
          }</p>
          <div class="actions">
            <button class="btn accept">Accept</button>
            <button class="btn reject">Reject</button>

            <button class="btn settings">manage</button>
          
            </div>
        </div>
      </div>

      <div class="settings-dialog">
        <h3>Cookie Settings</h3>
        <p>Customize your cookie preferences below:</p>
        <ul>
          ${config.consentCategories
            .map(
              (category) => `
            <li>
              <label>
                <input type="checkbox" data-category="${
                  category.title[this.currentLanguage] || ''
                }" />
                ${category.title[this.currentLanguage] || 'Category Name'}
              </label>
            </li>
          `
            )
            .join('')}
        </ul>
        <button class="btn accept">Save Preferences</button>
      </div>
    `;

    this.shadowRoot
      .querySelector('.btn.settings')
      .addEventListener('click', () => this.toggleSettingsDialog(true));
    this.shadowRoot
      .querySelector('.settings-dialog .btn.accept')
      .addEventListener('click', () => this.toggleSettingsDialog(false));
    this.shadowRoot
      .querySelector('.btn.accept')
      .addEventListener('click', () => this.handleConsent(true));
    this.shadowRoot
      .querySelector('.btn.reject')
      .addEventListener('click', () => this.handleConsent(false));
  }

  toggleSettingsDialog(show) {
    const dialog = this.shadowRoot.querySelector('.settings-dialog');
    if (show) {
      dialog.classList.add('active');
    } else {
      dialog.classList.remove('active');
    }
  }

  handleConsent(accepted) {
    console.log(`User consent ${accepted ? 'accepted' : 'rejected'}`);
    this.shadowRoot.querySelector('.banner').style.animation =
      'fadeOut 0.5s forwards';
    setTimeout(
      () => (this.shadowRoot.innerHTML = '<p>Thank you for your response.</p>'),
      500
    );
  }

  displayError(message) {
    this.shadowRoot.innerHTML = `<p style="color: red;">${message}</p>`;
  }

  setLanguage(language) {
    this.currentLanguage = language;

    // Update only the text content based on the selected language
    this.shadowRoot.querySelector('.banner p').textContent =
      this.languageMapping.text[this.currentLanguage] || 'Text not available';

    // Update categories and button text without resetting the entire form
    const categories = this.shadowRoot.querySelectorAll('.category');
    categories.forEach((category, index) => {
      const categoryData = this.languageMapping.consentCategories[index];
      category.querySelector('label').textContent = `${
        categoryData.title[this.currentLanguage] || 'Title not available'
      }: ${
        categoryData.description[this.currentLanguage] ||
        'Description not available'
      }`;
    });

    this.shadowRoot.querySelectorAll('.btn').forEach((button) => {
      if (button.textContent === 'Reject') return;
      button.textContent =
        this.languageMapping.buttonText[this.currentLanguage] || 'Accept';
    });
  }

  handleSubmit(config, accepted) {
    const selectedCategories = Array.from(
      this.shadowRoot.querySelectorAll('.categories input:checked')
    ).map((input) => ({
      categoryId: input.dataset.categoryId,
      consentGiven: true,
    }));

    const data = {
      formId: config._id,
      consent: accepted ? 'Accepted' : 'Rejected',
      categories: config.granularity ? selectedCategories : null,
      timestamp: new Date().toISOString(),
    };

    // Simulate storing the consent data
    console.log('Consent Data:', data);

    // Clear the banner after submission
    this.shadowRoot.innerHTML = `<p>Thank you for your response.</p>`;
  }
}

// Define the web component
customElements.define('custom-consent-form', CustomConsentForm);
