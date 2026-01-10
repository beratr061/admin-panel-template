import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { AuthModule, JwtAuthGuard } from './auth';
import { PermissionsModule, PermissionsGuard } from './permissions';
import { UsersModule } from './users';
import { RolesModule } from './roles';

@Module({
  imports: [
    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000, // Convert to milliseconds
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 1000, // 1000 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    PermissionsModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
