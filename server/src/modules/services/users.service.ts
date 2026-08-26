import bcrypt from "bcryptjs";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js";
import type { AccessTokenPayload } from "../../utils/jwt.util.js";
import type { CreateUserDto, UpdateOwnProfileDto, UpdateUserDto } from "../dto/users.dto.js";
import type { AuthRepository } from "../repository/auth.repository.js";
import type { UserRepository } from "../repository/users.repository.js";
import { db } from "../../db/client.js";

const BCRYPT_COST_FACTOR = 12;

function toPublicUser(user: {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  const { id, fullName, email, role, isActive, createdAt, updatedAt } = user;
  return { id, fullName, email, role, isActive, createdAt, updatedAt };
}

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
  ) { }
  
  async list() {
    const all = await this.userRepository.findAll();
    return all.map(toPublicUser);
  }

  async getById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return toPublicUser(user);
  }

  async create(dto: CreateUserDto, requester: AccessTokenPayload) {
    // Role-creation ceiling: a Manager can only create Cashiers. An Admin
    // can create anyone. A Cashier can never reach this method at all —
    // that's enforced one layer up by `authorize('admin', 'manager')` on
    // the route itself, so this check only needs to handle the
    // Manager-vs-Admin distinction.
    if (requester.role === "manager" && dto.role !== "cashier") {
      throw new ForbiddenError("Manaers can only create cashier accounts");
    }
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST_FACTOR);
    const user = await this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      role: dto.role
    });
    return toPublicUser(user);
  }

  async updateOwnProfile(userId: string, dto: UpdateOwnProfileDto) {
    const updates: { fullName?: string; passwordHash?: string } = {};
    if (dto.fullName !== undefined) updates.fullName = dto.fullName;
    if (dto.password !== undefined) {
      updates.passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST_FACTOR);
    }

    const user = await this.userRepository.update(userId, updates);
    if (!user) throw new NotFoundError("User not found");
    return toPublicUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const target = await this.userRepository.findById(id);
    if (!target) throw new NotFoundError("User not found");

    if (dto.role && dto.role !== "admin" && target.role === "admin") {
      const activeAdmin = await this.userRepository.countActiveAdmins();
      if (activeAdmin <= 1) {
        throw new BadRequestError("Cannot demote the last active admin")
      }
    }

    const patch: { fullName?: string; role?: UpdateUserDto["role"]; isActive?: boolean } = {};
    if (dto.fullName !== undefined) patch.fullName = dto.fullName;
    if (dto.role !== undefined) patch.role = dto.role;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;

    const user = await this.userRepository.update(id, patch);
    if (!user) throw new NotFoundError("User not found");
    return toPublicUser(user)
  }

  async deactivate(id: string, requester: AccessTokenPayload) {
    if (id === requester.sub) {
      throw new BadRequestError("You cannot deactivate your own account")
    }
    const target = await this.userRepository.findById(id);
    if (!target) throw new NotFoundError("User not found");

    if (target.role === "admin") {
      const activeAdmins = await this.userRepository.countActiveAdmins();
      if (activeAdmins <= 1) {
        throw new BadRequestError("Cannot deactivate the last active admin");
      }
    }

    const user = await db.transaction(async (tx) => {
      const updated = await this.userRepository.update(id, { isActive: false }, tx);
      await this.authRepository.revokeAllUserTokens(id, tx);
      return updated;
    });
    if (!user) throw new NotFoundError("User not found");
    return toPublicUser(user);
  }
}