/**
 * Factory functions for creating mock user data in tests
 * These match the Prisma User, Session, and Account models with realistic data
 */

export const createMockUser = (overrides: Record<string, any> = {}) => ({
  id: '568DvL52siByrA1iEV8K7UmFleXAOc9w',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: true,
  image: null,
  createdAt: new Date('2025-11-30T18:40:21.309Z'),
  updatedAt: new Date('2025-11-30T18:56:05.703Z'),
  ...overrides,
})

export const createMockSession = (overrides: Record<string, any> = {}) => ({
  id: 'm1LKsN06KO10IVnoMY7R3c6KIcQlcEdD',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  token: 'f12XxZE8o155XZMPL4oqoeU7wknf8bfo',
  createdAt: new Date('2025-12-01T17:05:40.202Z'),
  updatedAt: new Date('2025-12-01T17:05:40.202Z'),
  ipAddress: '127.0.0.1',
  userAgent: 'better-auth',
  userId: '568DvL52siByrA1iEV8K7UmFleXAOc9w',
  ...overrides,
})

export const createMockAccount = (overrides: Record<string, any> = {}) => ({
  id: '6hl6Wz3676CW6z7vKe2bFTQtbvpvoAAx',
  accountId: 'a24Z0izKlu6NdaDUQFB8qLdh3ElmDXBt',
  providerId: 'credential',
  userId: 'a24Z0izKlu6NdaDUQFB8qLdh3ElmDXBt',
  accessToken: null,
  refreshToken: null,
  idToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  scope: null,
  password: '1d9dc668c6dc5fd2e8130cf6a20a4f43:abb652adaf852192627d6f8f7830135c633fa6f1a407e5d53b2bf249288d904aaddac1fe052f7ea3c6b49a4593ab88676ed237482e8268b6b46b7862c3208858',
  createdAt: new Date('2025-11-29T14:50:05.946Z'),
  updatedAt: new Date('2025-11-29T15:08:07.579Z'),
  ...overrides,
})