import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Standard format we expect from an Mbox -> JSON parser
interface ImportThread {
    title: string
    createdAt: string // ISO Date
    posts: {
        authorEmail: string
        content: string
        createdAt: string // ISO Date
    }[]
}

async function main() {
    // Look for forum-export.json in the same directory as this script
    const importFilePath = path.join(__dirname, 'forum-export.json')

    if (!fs.existsSync(importFilePath)) {
        console.error(`Kunne ikke finde eksport-filen: ${importFilePath}`)
        console.log(`Lav en fil med navnet 'forum-export.json' der følger dette format:`)
        console.log(`[
  {
    "title": "Gamle Generalforsamling referater",
    "createdAt": "2020-01-01T12:00:00Z",
    "posts": [
      {
        "authorEmail": "formand@enehoje.com",
        "content": "Her er referatet...",
        "createdAt": "2020-01-01T12:00:00Z"
      }
    ]
  }
]`)
        process.exit(1)
    }

    console.log(`Læser ${importFilePath}...`)
    const rawData = fs.readFileSync(importFilePath, 'utf-8')
    const threads: ImportThread[] = JSON.parse(rawData)

    console.log(`Fandt ${threads.length} emner klar til import.`)

    // Pre-fetch al users from DB to map old emails to actual system IDs safely
    const users = await prisma.user.findMany({ select: { id: true, email: true } })
    const userMap = new Map<string, string>()
    users.forEach(u => {
        if (u.email) userMap.set(u.email.toLowerCase(), u.id)
    })

    let importedThreads = 0
    let skippedThreads = 0

    // Process each thread transactionally
    for (const threadData of threads) {
        if (!threadData.posts || threadData.posts.length === 0) {
            console.warn(`Springer emne over "${threadData.title}" - ingen posts.`)
            skippedThreads++
            continue
        }

        // We assume the first post dictates the thread creator
        const firstPost = threadData.posts[0]
        const creatorId = userMap.get(firstPost.authorEmail.toLowerCase())

        if (!creatorId) {
            console.warn(`Springer emne over "${threadData.title}" - ukendt forfatter e-mail: ${firstPost.authorEmail}`)
            skippedThreads++
            continue
        }

        // Build valid posts mapping
        const validPosts = []
        for (const post of threadData.posts) {
            const authorId = userMap.get(post.authorEmail.toLowerCase())
            if (!authorId) {
                console.warn(`  ↳ Springer et svar over i "${threadData.title}" - ukendt e-mail: ${post.authorEmail}`)
                continue
            }

            validPosts.push({
                authorUserId: authorId,
                content: post.content,
                createdAt: new Date(post.createdAt),
                updatedAt: new Date(post.createdAt),
                sourceType: 'IMPORT'
            })
        }

        if (validPosts.length === 0) {
            console.warn(`Springer emne over "${threadData.title}" - ingen bruger-genkendte e-mails.`)
            skippedThreads++
            continue
        }

        // Determine thread dates to match historical exact times
        const threadCreatedAt = new Date(threadData.createdAt || validPosts[0].createdAt)
        const lastPostAt = new Date(validPosts[validPosts.length - 1].createdAt)

        try {
            await prisma.forumThread.create({
                data: {
                    title: threadData.title,
                    createdByUserId: creatorId,
                    createdAt: threadCreatedAt,
                    updatedAt: threadCreatedAt,
                    lastPostAt: lastPostAt,
                    sourceType: 'IMPORT', // Flags it heavily as historical/imported
                    posts: {
                        create: validPosts
                    }
                }
            })
            importedThreads++
            console.log(`✅ Importeret: "${threadData.title}" (${validPosts.length} beskeder)`)
        } catch (error) {
            console.error(`Misteppet under database indsættelse for "${threadData.title}":`, error)
        }
    }

    console.log(`\nImport fuldført! 🚀`)
    console.log(`- Indsat: ${importedThreads} tråde med fuld gyldig bruger-match.`)
    console.log(`- Sprunget over: ${skippedThreads} tråde.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
