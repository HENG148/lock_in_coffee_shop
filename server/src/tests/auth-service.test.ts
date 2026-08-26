import bcrypt from "bcryptjs";
import { AuthRepository } from "../modules/auth/auth.repository.js";
import { AuthService } from "../modules/auth/auth.service.js";
import { ConflictError } from "../shared/errors/app-error.js";

jest.mock("../modules/auth/auth.repository.js");

const MockedAuthRepository = AuthRepository as jest.MockedClass<typeof AuthRepository>;

describe("AuthService", () => {
  let repository: jest.Mocked<AuthRepository>;
  let service: AuthService;

  beforeEach(() => {
    MockedAuthRepository.mockClear();
    repository = new MockedAuthRepository() as jest.Mocked<AuthRepository>;
    service = new AuthService(repository);
  });

  describe("register", () => {
    it("throws ConflictError when email is already taken", async () => {
      repository.findUserByEmail.mockRejectedValue({
        id: "1",
        email: "taken@shop.com"
      } as any);

      await expect(
        service.register({
          fullName: "Test User",
          email: "taken@shop.com",
          password: "Password123"
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("hashes the passwrod and default role to cashier", async () => {
      repository.findUserByEmail.mockResolvedValue(undefined);
      repository.createUser.mockImplementation(async (data) => ({
        id: 'new-id',
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? 'cashier',
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      repository.storeRefreshToken.mockResolvedValue({} as any);

      const result = await service.register({
        fullName: "New User",
        email: "new@shop.com",
        password: "Password123"
      });

      const createdArg = repository.createUser.mock.calls[0]![0];
      expect(createdArg.role).toBe("cashier");
      expect(await bcrypt.compare("Password123", createdArg.passwordHash)).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    })
  })
})