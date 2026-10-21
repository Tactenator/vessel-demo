import type { CollectionBeforeValidateHook } from 'payload'

import { ValidationError } from 'payload'

const PASSWORD_MIN_LENGTH = 10

const PASSWORD_REQUIREMENTS: Array<{ label: string; test: RegExp }> = [
  { label: 'an uppercase letter', test: /[A-Z]/ },
  { label: 'a lowercase letter', test: /[a-z]/ },
  { label: 'a number', test: /[0-9]/ },
  { label: 'a special character', test: /[^A-Za-z0-9]/ },
]

// Payload's password field has no built-in complexity option (only a 3-char
// minLength), so complexity is enforced here before the password is hashed.
export const validatePasswordComplexity: CollectionBeforeValidateHook = ({ data, req }) => {
  const password = data?.password

  if (!password) {
    return data
  }

  const missing = PASSWORD_REQUIREMENTS.filter(({ test }) => !test.test(password)).map(
    ({ label }) => label,
  )

  if (password.length < PASSWORD_MIN_LENGTH) {
    missing.unshift(`at least ${PASSWORD_MIN_LENGTH} characters`)
  }

  if (missing.length > 0) {
    throw new ValidationError({
      errors: [
        {
          path: 'password',
          message: `Password must contain ${missing.join(', ')}.`,
        },
      ],
      req,
    })
  }

  return data
}
