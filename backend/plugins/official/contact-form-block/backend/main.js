'use strict';

const FIELD_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  NUMBER: 'number',
  NAME: 'name',
  EMAIL: 'email',
  URL: 'url',
  FILE: 'file',
};

module.exports = {
  meta: {
    name: 'contact-form-block',
    version: '1.0.0',
    type: 'block',
  },
  block: {
    id: 'contact-form',
    title: 'Contact Form',
    description: 'Dynamic contact form builder with submission management.',
    supports: {
      editableFields: true,
      fieldReorder: true,
      fileUpload: true,
      submissionStorage: true,
    },
    fieldTypes: Object.values(FIELD_TYPES),
    defaultFields: [
      {
        id: 'name',
        type: FIELD_TYPES.NAME,
        label: 'Full name',
        placeholder: 'Enter your full name',
        defaultValue: '',
        required: true,
        maxLength: 120,
      },
      {
        id: 'email',
        type: FIELD_TYPES.EMAIL,
        label: 'Email',
        placeholder: 'you@example.com',
        defaultValue: '',
        required: true,
        maxLength: 160,
      },
      {
        id: 'message',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Message',
        placeholder: 'Write your message',
        defaultValue: '',
        required: true,
        maxLength: 500,
      },
    ],
  },
  api: {
    forms: '/contact-forms',
    submit: '/contact-forms/:id/submit',
    submissions: '/contact-forms/:id/submissions',
  },
};
