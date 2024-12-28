import path from 'path';

export default {
  entry: './Custom_Form_webcomponent.js',
  output: {
    filename: 'custom-consent-form.bundle.js',
    path: path.resolve('./dist'),
  },
  mode: 'production',
};
