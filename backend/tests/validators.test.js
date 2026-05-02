const { isValidEmail, isValidPassword } = require("../src/utils/validators");

describe("Auth validators", () => {
  describe("isValidEmail", () => {
    test("should return true for a valid email", () => {
      expect(isValidEmail("usuario@email.com")).toBe(true);
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
  });

  describe("isValidPassword", () => {
    test("should return true for password with minimum length and uppercase letter", () => {
      expect(isValidPassword("Teste")).toBe(true);
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
  });
});