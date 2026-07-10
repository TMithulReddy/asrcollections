export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function validateCustomerDetails(
  name: string,
  phone: string
): {
  valid: boolean;
  nameError: string;
  phoneError: string;
  normalizedPhone: string;
} {
  const trimmedName = name.trim();
  const normalizedPhone = normalizePhone(phone);

  let nameError = "";
  let phoneError = "";

  if (!trimmedName) {
    nameError = "Name is required.";
  }

  if (normalizedPhone.length < 10) {
    phoneError = "Phone must be at least 10 digits.";
  }

  return {
    valid: !nameError && !phoneError,
    nameError,
    phoneError,
    normalizedPhone,
  };
}
