import bcrypt from "bcryptjs";
import { ConflictError, UnauthorizedError } from "../../shared/errors/app-error.js";
import type { LoginDto, RegisterDto } from "./auth.dto.js";
import type { AuthRepository } from "./auth.repository.js";
import { generateRefreshToken, hashToken, refreshTokenExpiryDate, signAccessToken, verifyAccessToken } from "../../utils/jwt.util.js";

const BCRYPT_COST_FACTOR = 12;

interface AuthResult{
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) { }
  async register(dto: RegisterDto): Promise<AuthResult>{
    const existing = await this.authRepository.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST_FACTOR);
    const user = await this.authRepository.createUser({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      role: "cashier"
    });
    return this.issueTokens(user.id, user.role, user);
  }

  async login(dto: LoginDto): Promise<AuthResult>{
    const user = await this.authRepository.findUserByEmail(dto.email);
    const genericError = () => new UnauthorizedError("Invalid email or password");

    if (!user || !user.isActive) throw genericError();
    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) throw genericError();
    return this.issueTokens(user.id, user.role, user);
  }

  async refresh(rawRefreshToken: string): Promise<AuthResult>{
    const tokenHash = hashToken(rawRefreshToken);
    const stored = await this.authRepository.findActiveRefreshtoken(tokenHash);
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token is invalid or expired");
    }
    const user = await this.authRepository.findUserById(stored.userId);
    if (!user || !user.isActive) throw new UnauthorizedError("Account is no longer active");
    await this.authRepository.revokeRefreshToken(tokenHash);
    return this.issueTokens(user.id, user.role, user);
  }

  async logout(rawRefreshToken: string): Promise<void>{
    await this.authRepository.revokeRefreshToken(hashToken(rawRefreshToken));
  }

  private async issueTokens(
    userId: string,
    role: "admin" | "manager" | "cashier" | "barista",
    user: {
      id: string; 
      fullName: string;
      email: string;
      role: string;
    }
  ): Promise<AuthResult>{
    const accessToken = signAccessToken({ sub: userId, role });
    const refreshTokenRaw = generateRefreshToken();

    await this.authRepository.storeRefreshToken(
      userId,
      hashToken(refreshTokenRaw),
      refreshTokenExpiryDate(),
    );
    return {
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
      accessToken,
      refreshToken: refreshTokenRaw,
    }
  }
}

export { verifyAccessToken };