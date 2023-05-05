import { execaCommand } from 'execa'
import fs from 'fs/promises'
import path from 'path'

type MigrationKind = 'up' | 'down'

async function createMigrationDirectoryIfNotExists(migrationDir: string) {
  try {
    await fs.stat(migrationDir)
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Creating your migration folder in ${migrationDir}`)
      fs.mkdir(migrationDir, { recursive: true })
    }
  }
}

async function getNextMigrationId(files, migrationKind: MigrationKind) {
  const migrations = await fs.readdir(files)

  if (migrationKind === 'up') {
    const sortedUpMigrations = migrations
      .filter((migration) => migration.includes('.do.sql'))
      .sort((a, b) => +a - +b)

    return Number(sortedUpMigrations.length) + 1
  }
  if (migrationKind === 'down') {
    const sortedDownMigrations = migrations
      .filter((migration) => migration.includes('.undo.sql'))
      .sort((a, b) => +a - +b)

    return Number(sortedDownMigrations.length) + 1
  }
}

async function generateMigrations(migrationDir, schemaPath, migrationKind: MigrationKind) {
  const nextMigrationId = await getNextMigrationId(migrationDir, migrationKind).then((value) =>
    value?.toString().padStart(3, '0')
  )

  switch (migrationKind) {
    case 'up': {
      try {
        await execaCommand(
          `npx prisma migrate diff \
            --from-schema-datasource ${schemaPath} \
            --to-schema-datamodel ${schemaPath} \
            --script \
            --exit-code`
        )

        console.log('📭 No up migration was generated.')
      } catch (error) {
        if (error.exitCode === 2) {
          await fs
            .writeFile(`${migrationDir}/${nextMigrationId}.do.sql`, error.stdout)
            .then(() => console.log(`🗳 Generated ${nextMigrationId}.do.sql up migration`))
        } else {
          console.log(`Oops, something went wrong: \n${error}`)
        }
      }
      break
    }

    case 'down': {
      try {
        await execaCommand(
          `npx prisma migrate diff \
          --from-schema-datamodel ${schemaPath} \
          --to-schema-datasource ${schemaPath} \
           --script \
           --exit-code`
        )

        console.log('📭 No down migration was generated.')
      } catch (error) {
        if (error.exitCode === 2) {
          await fs
            .appendFile(`${migrationDir}/${nextMigrationId}.undo.sql`, error.stdout)
            .then(() => console.log(`🗳 Generated ${nextMigrationId}.undo.sql down migration`))
        } else {
          console.log(`Oops, something went wrong: ${error}
          `)
        }
      }

      break
    }
    default:
      break
  }
}

async function main() {
  const { migrationsDir, schema, up, down } = {
    migrationsDir: 'migrations',
    schema: './prisma/schema.prisma',
    up: false,
    down: false,
  }

  const normalizedMigrationsDirPath = path.join(process.cwd(), migrationsDir)
  const normalizedSchemaPath = path.join(process.cwd(), schema)

  await createMigrationDirectoryIfNotExists(normalizedMigrationsDirPath)
  if (up) {
    await generateMigrations(normalizedMigrationsDirPath, normalizedSchemaPath, 'up')
  } else if (down) {
    await generateMigrations(normalizedMigrationsDirPath, normalizedSchemaPath, 'down')
  } else {
    await Promise.all([
      generateMigrations(normalizedMigrationsDirPath, normalizedSchemaPath, 'up'),
      generateMigrations(normalizedMigrationsDirPath, normalizedSchemaPath, 'down'),
    ])
  }
}

main().catch((e) => {
  if (e instanceof Error) {
    console.error(e.name)
    console.error(e.message)
  } else {
    console.error('Oops, something went wrong...')
    console.error(e)
  }
})

export default main
