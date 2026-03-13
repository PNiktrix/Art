// ============================================================
// validator.js — FormValidator
// ============================================================
// Validates form fields inside the Tally modal.
// Marks fields with error styling when invalid.
// ============================================================

class FormValidator {

  // Returns true if value is not blank
  isPresent(value) {
    return value.trim().length > 0;
  }

  // Returns true for valid Indian mobile number (10 digits, starts 6-9)
  isPhone(value) {
    return /^[6-9]\d{9}$/.test(value.trim());
  }

  // Marks a field group as error or valid
  // groupId = the wrapping div id (e.g. "tf-name")
  markField(groupId, valid) {
    const group = document.getElementById(groupId);
    if (!group) return valid;
    group.classList.toggle("err", !valid);
    return valid;
  }

  // Run a list of checks — returns true only if ALL pass
  // checks = [{ id: "tf-name", ok: true/false }, ...]
  run(checks) {
    return checks
      .map(c => this.markField(c.id, c.ok))
      .every(Boolean);
  }
}
