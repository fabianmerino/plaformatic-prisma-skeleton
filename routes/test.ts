import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'

export default async function (app: FastifyInstance) {
  const prisma = new PrismaClient()
  app.get('/url', async (req, reply) => {
    const data = await prisma.movie.findMany()
    console.log(data)
    return reply.send('Hello world')
  })
}
