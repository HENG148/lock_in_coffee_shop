import bcrypt from "bcryptjs";
import { ConflictError } from "../shared/errors/app-error.js";
import { AuthRepository } from "../modules/repository/auth.repository.js";
import { AuthService } from "../modules/services/auth.service.js";
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';

vi.mock("../modules/repository/auth.repository.js");

const MockedAuthRepository = AuthRepository as unknown as ReturnType<typeof vi.fn>

describe("AuthService", () => {
  let repository: Mocked<AuthRepository>;
  let service: AuthService;

  beforeEach(() => {
    MockedAuthRepository.mockClear();
    repository = new MockedAuthRepository() as Mocked<AuthRepository>;
    service = new AuthService(repository);
  });

  describe("register", () => {
    it("throws ConflictError when email is already taken", async () => {
      repository.findUserByEmail.mockResolvedValue({
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

    it("hashes the password and default role to cashier", async () => {
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