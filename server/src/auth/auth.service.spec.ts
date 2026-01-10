import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import * as fc from 'fast-check';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma';

// Mock PrismaService
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

// Mock JwtService
const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    /**
     * Feature: admin-panel-template, Property 23: JWT Tokens Issued on Valid Login
     * *For any* valid login credentials, the backend should issue both access token and refresh token.
     * **Validates: Requirements 8.5**
     */
    it('Property 23: JWT tokens issued on valid login', async () => {
      // Pre-hash a password for consistent testing
      const testPassword = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(testPassword, 10);

      await fc.assert(
        fc.asyncProperty(
          // Generate valid email
          fc.emailAddress(),
          // Generate user name
          fc.string({ minLength: 2, maxLength: 50 }).filter((s) => s.trim().length >= 2),
          async (email, name) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();

            // Mock user with roles and permissions
            const mockUser = {
              id: 'user-123',
              email,
              password: hashedPassword,
              name,
              avatar: null,
              isActive: true,
              roles: [
                {
                  role: {
                    name: 'VIEWER',
                    permissions: [
                      {
                        permission: {
                          resource: 'dashboard',
                          action: 'read',
                        },
                      },
                    ],
                  },
                },
              ],
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockJwtService.signAsync
              .mockResolvedValueOnce('mock-access-token')
              .mockResolvedValueOnce('mock-refresh-token');
            mockPrismaService.refreshToken.create.mockResolvedValue({});

            // Execute login with the known password
            const result = await service.login({ email, password: testPassword });

            // Verify: Both tokens should be issued
            expect(result.tokens.accessToken).toBe('mock-access-token');
            expect(result.tokens.expiresIn).toBeGreaterThan(0);

            // Verify JWT service was called twice (access + refresh)
            expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);

            // Verify refresh token was saved
            expect(mockPrismaService.refreshToken.create).toHaveBeenCalled();

            // Verify user data is returned
            expect(result.user.id).toBe(mockUser.id);
            expect(result.user.email).toBe(email);
            expect(result.user.roles).toContain('VIEWER');
          },
        ),
        { numRuns: 100 },
      );
    }, 60000);

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: await bcrypt.hash('correctpassword', 10),
        name: 'Test User',
        isActive: true,
        roles: [],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
        isActive: false,
        roles: [],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should throw BadRequestException when passwords do not match', async () => {
      await expect(
        service.register({
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123',
          passwordConfirm: 'DifferentPassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          email: 'existing@example.com',
          name: 'Test User',
          password: 'Password123',
          passwordConfirm: 'Password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
