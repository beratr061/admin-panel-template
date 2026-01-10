import { PrismaClient, Permission } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Define all available permissions
const PERMISSIONS = [
  // Users resource
  { resource: 'users', action: 'create', description: 'Create new users' },
  { resource: 'users', action: 'read', description: 'View users' },
  { resource: 'users', action: 'update', description: 'Update users' },
  { resource: 'users', action: 'delete', description: 'Delete users' },
  // Roles resource
  { resource: 'roles', action: 'create', description: 'Create new roles' },
  { resource: 'roles', action: 'read', description: 'View roles' },
  { resource: 'roles', action: 'update', description: 'Update roles' },
  { resource: 'roles', action: 'delete', description: 'Delete roles' },
  // Dashboard resource
  { resource: 'dashboard', action: 'read', description: 'View dashboard' },
  // Settings resource
  { resource: 'settings', action: 'read', description: 'View settings' },
  { resource: 'settings', action: 'update', description: 'Update settings' },
  // Activities resource
  { resource: 'activities', action: 'read', description: 'View activity logs' },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Create permissions
  console.log('Creating permissions...');
  const createdPermissions = await Promise.all(
    PERMISSIONS.map((permission: { resource: string; action: string; description: string }) =>
      prisma.permission.upsert({
        where: {
          resource_action: {
            resource: permission.resource,
            action: permission.action,
          },
        },
        update: {},
        create: permission,
      }),
    ),
  );
  console.log(`✅ Created ${createdPermissions.length} permissions`);

  // Create SUPER_ADMIN role with all permissions
  console.log('Creating SUPER_ADMIN role...');
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrator with full access to all resources',
      isSystem: true,
    },
  });

  // Assign all permissions to SUPER_ADMIN
  await Promise.all(
    createdPermissions.map((permission: Permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      }),
    ),
  );
  console.log('✅ Created SUPER_ADMIN role with all permissions');

  // Create ADMIN role with limited permissions
  console.log('Creating ADMIN role...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator with user management access',
      isSystem: true,
    },
  });

  // Assign user and dashboard permissions to ADMIN
  const adminPermissions = createdPermissions.filter(
    (p: Permission) =>
      p.resource === 'users' ||
      p.resource === 'dashboard' ||
      p.resource === 'activities',
  );
  await Promise.all(
    adminPermissions.map((permission: Permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      }),
    ),
  );
  console.log('✅ Created ADMIN role');

  // Create VIEWER role with read-only permissions
  console.log('Creating VIEWER role...');
  const viewerRole = await prisma.role.upsert({
    where: { name: 'VIEWER' },
    update: {},
    create: {
      name: 'VIEWER',
      description: 'Read-only access to dashboard',
      isSystem: true,
    },
  });

  // Assign only read permissions to VIEWER
  const viewerPermissions = createdPermissions.filter(
    (p: Permission) => p.action === 'read' && p.resource === 'dashboard',
  );
  await Promise.all(
    viewerPermissions.map((permission: Permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: viewerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: viewerRole.id,
          permissionId: permission.id,
        },
      }),
    ),
  );
  console.log('✅ Created VIEWER role');

  // Create Super Admin user
  console.log('Creating Super Admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      isActive: true,
    },
  });

  // Assign SUPER_ADMIN role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  });
  console.log('✅ Created Super Admin user (admin@example.com / admin123)');

  // Create test users with Faker.js
  console.log('Creating test users...');
  const testUsers = [];
  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: await bcrypt.hash('password123', 10),
        name: `${firstName} ${lastName}`,
        avatar: faker.image.avatar(),
        isActive: faker.datatype.boolean({ probability: 0.9 }),
      },
    });
    testUsers.push(user);

    // Randomly assign roles to test users
    const roles = [adminRole, viewerRole];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: randomRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: randomRole.id,
      },
    });
  }
  console.log(`✅ Created ${testUsers.length} test users`);

  // Create some activity logs
  console.log('Creating activity logs...');
  const actions = ['login', 'logout', 'create', 'update', 'delete', 'view'];
  const targets = ['user', 'role', 'settings', 'dashboard'];

  for (let i = 0; i < 20; i++) {
    const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
    await prisma.activity.create({
      data: {
        userId: randomUser.id,
        action: actions[Math.floor(Math.random() * actions.length)],
        target: targets[Math.floor(Math.random() * targets.length)],
        metadata: {
          ip: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
        createdAt: faker.date.recent({ days: 7 }),
      },
    });
  }
  console.log('✅ Created activity logs');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
