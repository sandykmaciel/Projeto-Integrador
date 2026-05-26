const { isValidEmail, isValidPassword } = require("../src/utils/validators");

describe("Auth validators", () => {
  describe("isValidEmail", () => {
    test("should return true for a valid email", () => {
      expect(isValidEmail("usuario@email.com")).toBe(true);
    });

    test("should return true for a valid email with subdomain", () => {
      expect(isValidEmail("usuario@aluno.ufla.br")).toBe(true);
    });

    test("should return false for email without domain separator", () => {
      expect(isValidEmail("usuarioemail.com")).toBe(false);
    });

    test("should return false for email without domain", () => {
      expect(isValidEmail("usuario@")).toBe(false);
    });

    test("should return false for email without username", () => {
      expect(isValidEmail("@email.com")).toBe(false);
    });

    test("should return false for empty email", () => {
      expect(isValidEmail("")).toBe(false);
    });

    test("should return false for null email", () => {
      expect(isValidEmail(null)).toBe(false);
    });

    test("should return false for undefined email", () => {
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    test("should return true for password with minimum length and uppercase letter", () => {
      expect(isValidPassword("Teste")).toBe(true);
    });

    test("should return true for password with more than 4 characters and uppercase letter", () => {
      expect(isValidPassword("SenhaForte")).toBe(true);
    });

    test("should return false for password with less than 4 characters", () => {
      expect(isValidPassword("Tes")).toBe(false);
    });

    test("should return false for password without uppercase letter", () => {
      expect(isValidPassword("teste")).toBe(false);
    });

    test("should return false for empty password", () => {
      expect(isValidPassword("")).toBe(false);
    });

    test("should return false for null password", () => {
      expect(isValidPassword(null)).toBe(false);
    });

    test("should return false for undefined password", () => {
      expect(isValidPassword(undefined)).toBe(false);
    });
  });
});