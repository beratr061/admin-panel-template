import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Get } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as request from 'supertest';
import * as fc from 'fast-check';

// Test controller for rate limiting
@Controller('test')
class TestController {
  @Get()
  getTest() {
    return { message: 'ok' };
  }
}

/**
 * Feature: admin-panel-template, Property 28: Rate Limiting Triggers on Excessive Requests
 * *For any* IP address exceeding rate limit threshold, subsequent requests should receive 429 Too Many Requests.
 * **Validates: Requirements 14.3**
 */
describe('Property 28: Rate limiting triggers on excessive requests', () => {
  it('should return 429 when request count exceeds limit', async () => {
    // Property: For any number of requests exceeding the limit,
    // all requests after the limit should receive 429
    await fc.assert(
      fc.asyncProperty(
        // Generate a number of requests between limit+1 and limit+10
        fc.integer({ min: 6, max: 15 }),
        async (totalRequests) => {
          // Create a fresh app instance for each test to reset rate limits
          const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
              ThrottlerModule.forRoot([
                {
                  name: 'test',
                  ttl: 60000,
                  limit: 5,
                },
              ]),
            ],
            controllers: [TestController],
            providers: [
              {
                provide: APP_GUARD,
                useClass: ThrottlerGuard,
              },
            ],
          }).compile();

          const testApp = moduleFixture.createNestApplication();
          await testApp.init();

          let successCount = 0;
          let rateLimitedCount = 0;

          // Make requests sequentially
          for (let i = 0; i < totalRequests; i++) {
            const response = await request(testApp.getHttpServer()).get('/test');
            
            if (response.status === 200) {
              successCount++;
            } else if (response.status === 429) {
              rateLimitedCount++;
            }
          }

          await testApp.close();

          // Property assertion: 
          // - First 5 requests should succeed (status 200)
          // - All requests after limit should be rate limited (status 429)
          expect(successCount).toBe(5);
          expect(rateLimitedCount).toBe(totalRequests - 5);
          
          return true;
        },
      ),
      { numRuns: 5 }, // Reduced runs due to app creation overhead
    );
  });

  it('should allow requests within the limit', async () => {
    // Property: For any number of requests within the limit,
    // all requests should succeed
    await fc.assert(
      fc.asyncProperty(
        // Generate a number of requests between 1 and limit
        fc.integer({ min: 1, max: 5 }),
        async (totalRequests) => {
          // Create a fresh app instance for each test
          const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
              ThrottlerModule.forRoot([
                {
                  name: 'test',
                  ttl: 60000,
                  limit: 5,
                },
              ]),
            ],
            controllers: [TestController],
            providers: [
              {
                provide: APP_GUARD,
                useClass: ThrottlerGuard,
              },
            ],
          }).compile();

          const testApp = moduleFixture.createNestApplication();
          await testApp.init();

          let successCount = 0;

          // Make requests sequentially
          for (let i = 0; i < totalRequests; i++) {
            const response = await request(testApp.getHttpServer()).get('/test');
            
            if (response.status === 200) {
              successCount++;
            }
          }

          await testApp.close();

          // Property assertion: All requests within limit should succeed
          expect(successCount).toBe(totalRequests);
          
          return true;
        },
      ),
      { numRuns: 5 },
    );
  });

  it('should return proper 429 response format', async () => {
    // Create a fresh app instance
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'test',
            ttl: 60000,
            limit: 2, // Very low limit for quick testing
          },
        ]),
      ],
      controllers: [TestController],
      providers: [
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    }).compile();

    const testApp = moduleFixture.createNestApplication();
    await testApp.init();

    // Exhaust the limit
    await request(testApp.getHttpServer()).get('/test');
    await request(testApp.getHttpServer()).get('/test');

    // This request should be rate limited
    const response = await request(testApp.getHttpServer()).get('/test');

    expect(response.status).toBe(429);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('statusCode', 429);

    await testApp.close();
  });
});
