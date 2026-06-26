"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistSubmissionFields = persistSubmissionFields;
async function persistSubmissionFields(run, submissionId, formId, payload) {
    for (const [fieldKey, rawValue] of Object.entries(payload)) {
        if (rawValue == null) {
            continue;
        }
        if (Array.isArray(rawValue) || (typeof rawValue === 'object' && rawValue !== null)) {
            await run(`INSERT INTO contact_form_submission_fields
           (submission_id, form_id, field_key, field_type, value_text)
         VALUES (?, ?, ?, 'json', ?)`, [submissionId, formId, fieldKey, JSON.stringify(rawValue)]);
            continue;
        }
        const valueText = String(rawValue);
        const numeric = Number(valueText);
        const valueNumber = valueText !== '' && Number.isFinite(numeric) ? numeric : null;
        await run(`INSERT INTO contact_form_submission_fields
         (submission_id, form_id, field_key, field_type, value_text, value_number)
       VALUES (?, ?, ?, 'scalar', ?, ?)`, [submissionId, formId, fieldKey, valueText, valueNumber]);
    }
}
