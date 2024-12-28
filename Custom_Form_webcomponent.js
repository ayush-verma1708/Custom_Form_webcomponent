class CustomConsentForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
      this.renderForm(formConfig);
    } catch (error) {
      console.error('Error loading consent form:', error);
      this.shadowRoot.innerHTML = `<p>Failed to load consent form. Please try again later.</p>`;
    }
  }

  async fetchFormConfig(formId) {
    const response = await fetch(
      `https://consent-manager-backend.onrender.com/api/banners/${formId}`
    );
    if (!response.ok) throw new Error('Failed to fetch form configuration.');
    return response.json();
  }

  renderForm(config) {
    // Clear previous content
    this.shadowRoot.innerHTML = '';

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .banner {
          background-color: ${config.backgroundColor};
          color: ${config.textColor};
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          width: 100%;
          max-width: 600px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .banner p {
          margin: 0 0 1rem 0;
        }
        .categories {
          margin-bottom: 1rem;
        }
        .category {
          margin-bottom: 0.5rem;
        }
        .buttons {
          display: flex;
          gap: 1rem;
        }
        .btn {
          padding: 0.5rem 1rem;
          color: #fff;
          background-color: ${config.buttonColor};
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }
        .btn:hover {
          opacity: 0.9;
        }
      `;
    this.shadowRoot.appendChild(style);

    // Create banner container
    const banner = document.createElement('div');
    banner.className = 'banner';

    // Add banner text
    const bannerText = document.createElement('p');
    bannerText.textContent = config.text;
    banner.appendChild(bannerText);

    // Add categories if granularity is enabled
    if (config.granularity) {
      const categoriesContainer = document.createElement('div');
      categoriesContainer.className = 'categories';

      config.consentCategories.forEach((category) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';

        const label = document.createElement('label');
        label.textContent = `${category.title}: ${category.description}`;

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = category.yesOrNo;
        input.dataset.categoryId = category._id;

        categoryDiv.appendChild(input);
        categoryDiv.appendChild(label);
        categoriesContainer.appendChild(categoryDiv);
      });

      banner.appendChild(categoriesContainer);
    }

    // Add Privacy Policy and Terms links
    const policyLinks = document.createElement('p');
    policyLinks.innerHTML = `
        <a href="${config.privacyPolicyLink}" target="_blank">Privacy Policy</a> | 
        <a href="${config.termsLink}" target="_blank">Terms of Service</a>
      `;
    banner.appendChild(policyLinks);

    // Add action buttons
    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const acceptButton = document.createElement('button');
    acceptButton.className = 'btn';
    acceptButton.textContent = config.buttonText;
    acceptButton.addEventListener('click', () =>
      this.handleSubmit(config, true)
    );

    const rejectButton = document.createElement('button');
    rejectButton.className = 'btn';
    rejectButton.textContent = 'Reject';
    rejectButton.addEventListener('click', () =>
      this.handleSubmit(config, false)
    );

    buttons.appendChild(acceptButton);
    buttons.appendChild(rejectButton);
    banner.appendChild(buttons);

    // Append banner to shadow DOM
    this.shadowRoot.appendChild(banner);
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
