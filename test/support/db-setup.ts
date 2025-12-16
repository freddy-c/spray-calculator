import { Client } from 'pg'
import { createId } from '@paralleldrive/cuid2'

const DATABASE_URL = process.env.DATABASE_URL!
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com'

/**
 * Get the test user's ID from the database.
 */
async function getTestUserId(client: Client): Promise<string | null> {
  const result = await client.query('SELECT id FROM "user" WHERE email = $1', [
    TEST_USER_EMAIL,
  ])
  return result.rows[0]?.id || null
}

/**
 * Reset the database by deleting all applications for the test user.
 * Used in global setup before all tests run.
 */
export async function resetDatabase() {
  const client = new Client({ connectionString: DATABASE_URL })

  try {
    await client.connect()

    const testUserId = await getTestUserId(client)

    if (!testUserId) {
      console.warn(`⚠ Test user not found: ${TEST_USER_EMAIL}`)
      return
    }

    // Delete all applications for the test user (cascades to child records)
    const result = await client.query(
      'DELETE FROM application WHERE "userId" = $1',
      [testUserId]
    )
  } catch (error) {
    console.error('Database cleanup failed:', error)
    throw error
  } finally {
    await client.end()
  }
}

/**
 * Seed a test application with areas.
 * Returns the created application ID.
 */
export async function seedApplication(config: {
  name: string
  status?: 'DRAFT' | 'SCHEDULED' | 'COMPLETED'
  areas: Array<{
    label: string
    type: string
    sizeHa: number
  }>
}): Promise<string> {
  const client = new Client({ connectionString: DATABASE_URL })

  try {
    await client.connect()

    const testUserId = await getTestUserId(client)

    if (!testUserId) {
      throw new Error(`Test user not found: ${TEST_USER_EMAIL}`)
    }

    // Generate IDs
    const applicationId = createId()

    // Insert application with default values for required fields
    await client.query(
      `INSERT INTO application
        (id, "userId", name, status, "nozzleId", "sprayVolumeLHa", "nozzleSpacingM",
         "nozzleCount", "tankSizeL", "speedKmH", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [
        applicationId,
        testUserId,
        config.name,
        config.status || 'DRAFT',
        'syngenta-025-xc', // Default nozzle
        200, // Default spray volume
        0.5, // Default nozzle spacing
        20, // Default nozzle count
        1000, // Default tank size
        8, // Default speed
      ]
    )

    // Insert areas
    for (let i = 0; i < config.areas.length; i++) {
      const area = config.areas[i]
      await client.query(
        `INSERT INTO application_area
          (id, "applicationId", label, type, "sizeHa", "order")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [createId(), applicationId, area.label, area.type, area.sizeHa, i]
      )
    }

    return applicationId
  } catch (error) {
    console.error('Database seed failed:', error)
    throw error
  } finally {
    await client.end()
  }
}