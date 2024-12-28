(()=>{class e extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}async connectedCallback(){const e=this.getAttribute("form-id");if(e)try{const t=await this.fetchFormConfig(e);this.renderForm(t)}catch(e){console.error("Error loading consent form:",e),this.shadowRoot.innerHTML="<p>Failed to load consent form. Please try again later.</p>"}else console.error('The "form-id" attribute is required.')}async fetchFormConfig(e){const t=await fetch(`https://consent-manager-backend.onrender.com/api/banners/${e}`);if(!t.ok)throw new Error("Failed to fetch form configuration.");return t.json()}renderForm(e){this.shadowRoot.innerHTML="";const t=document.createElement("style");t.textContent=`\n        .banner {\n          background-color: ${e.backgroundColor};\n          color: ${e.textColor};\n          padding: 1rem;\n          border: 1px solid #ddd;\n          border-radius: 5px;\n          width: 100%;\n          max-width: 600px;\n          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);\n        }\n        .banner p {\n          margin: 0 0 1rem 0;\n        }\n        .categories {\n          margin-bottom: 1rem;\n        }\n        .category {\n          margin-bottom: 0.5rem;\n        }\n        .buttons {\n          display: flex;\n          gap: 1rem;\n        }\n        .btn {\n          padding: 0.5rem 1rem;\n          color: #fff;\n          background-color: ${e.buttonColor};\n          border: none;\n          border-radius: 3px;\n          cursor: pointer;\n        }\n        .btn:hover {\n          opacity: 0.9;\n        }\n      `,this.shadowRoot.appendChild(t);const n=document.createElement("div");n.className="banner";const o=document.createElement("p");if(o.textContent=e.text,n.appendChild(o),e.granularity){const t=document.createElement("div");t.className="categories",e.consentCategories.forEach((e=>{const n=document.createElement("div");n.className="category";const o=document.createElement("label");o.textContent=`${e.title}: ${e.description}`;const r=document.createElement("input");r.type="checkbox",r.checked=e.yesOrNo,r.dataset.categoryId=e._id,n.appendChild(r),n.appendChild(o),t.appendChild(n)})),n.appendChild(t)}const r=document.createElement("p");r.innerHTML=`\n        <a href="${e.privacyPolicyLink}" target="_blank">Privacy Policy</a> | \n        <a href="${e.termsLink}" target="_blank">Terms of Service</a>\n      `,n.appendChild(r);const a=document.createElement("div");a.className="buttons";const c=document.createElement("button");c.className="btn",c.textContent=e.buttonText,c.addEventListener("click",(()=>this.handleSubmit(e,!0)));const d=document.createElement("button");d.className="btn",d.textContent="Reject",d.addEventListener("click",(()=>this.handleSubmit(e,!1))),a.appendChild(c),a.appendChild(d),n.appendChild(a),this.shadowRoot.appendChild(n)}handleSubmit(e,t){const n=Array.from(this.shadowRoot.querySelectorAll(".categories input:checked")).map((e=>({categoryId:e.dataset.categoryId,consentGiven:!0}))),o={formId:e._id,consent:t?"Accepted":"Rejected",categories:e.granularity?n:null,timestamp:(new Date).toISOString()};console.log("Consent Data:",o),this.shadowRoot.innerHTML="<p>Thank you for your response.</p>"}}customElements.define("custom-consent-form",e)})();