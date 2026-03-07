import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { simpleParser } from "mailparser"
import crypto from "crypto"

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Helper to extract email address from a "Name <email@domain.com>" string
function extractEmail(fromHeader: string): string | null {
    const match = fromHeader.match(/<([^>]+)>/)
    return match ? match[1].toLowerCase() : fromHeader.trim().toLowerCase()
}

export async function POST(req: Request) {
    try {
        // AWS SNS sends requests with content-type text/plain even containing JSON
        const rawBody = await req.text()
        if (!rawBody) return new NextResponse("Empty body", { status: 400 })

        const payload = JSON.parse(rawBody)

        // 1. Handle AWS SNS Subscription Confirmation
        if (payload.Type === "SubscriptionConfirmation" && payload.SubscribeURL) {
            console.log("SNS Subscription confirmation received. Auto-confirming...")
            await fetch(payload.SubscribeURL)
            return new NextResponse("Confirmed", { status: 200 })
        }

        // 2. Process actual SES Notification
        if (payload.Type === "Notification" && payload.Message) {
            const sesMessage = JSON.parse(payload.Message)

            if (sesMessage.notificationType !== "Received") {
                return new NextResponse("Not an inbound email", { status: 200 })
            }

            const mail = sesMessage.mail
            const fromAddress = extractEmail(mail.source)
            if (!fromAddress) {
                console.warn("SES Webhook: No sender found")
                return new NextResponse("No sender", { status: 400 })
            }

            // 3. Authenticate User based on incoming email (Do this early to map attachments)
            const user = await prisma.user.findFirst({
                where: { email: fromAddress }
            })

            if (!user) {
                console.warn(`SES Webhook: Unauthorized inbound email from ${fromAddress}. Ignored.`)
                return new NextResponse("Unauthorized sender", { status: 200 }) // Return 200 to prevent SNS retries
            }

            // 4. Idempotency check via MessageId
            const existingPost = await prisma.forumPost.findUnique({
                where: { emailMessageId: mail.messageId }
            })

            if (existingPost) {
                return new NextResponse("Already processed", { status: 200 })
            }

            // Extract basic routing headers
            const toAddresses = mail.destination || []
            const subjectHeader = mail.headers.find((h: any) => h.name.toLowerCase() === "subject")
            let subject = subjectHeader ? subjectHeader.value : "Ingen titel"

            // Look for the threadId in the To address via sub-addressing (reply+<id>@...)
            let threadId: string | null = null
            for (const addr of toAddresses) {
                const match = addr.match(/reply\+([a-zA-Z0-9_-]+)@/i)
                if (match) {
                    threadId = match[1]
                    break
                }
            }

            // 5. Extract content and attachments from Raw S3 Email if available
            let content = sesMessage.content || "Besked modtaget via e-mail."
            const parsedAttachments: any[] = []

            if (sesMessage.receipt?.action?.type === 'S3') {
                const bucket = sesMessage.receipt.action.bucketName
                const key = sesMessage.receipt.action.objectKey

                try {
                    const getObj = new GetObjectCommand({ Bucket: bucket, Key: key })
                    const s3Res = await s3Client.send(getObj)
                    if (s3Res.Body) {
                        const rawEmailString = await s3Res.Body.transformToString()
                        const parsed = await simpleParser(rawEmailString)

                        // Use parsed text if available, stripping out history
                        if (parsed.text) {
                            content = parsed.text.split(/(?:^On\s.*wrote:|^>)/m)[0].trim() || parsed.text
                        }

                        // Process Attachments
                        if (parsed.attachments && parsed.attachments.length > 0) {
                            const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
                            const BLOCKED_MIME_TYPES = [
                                'application/x-msdownload', 'application/x-sh', 'application/javascript',
                                'application/x-bat', 'application/x-executable', 'text/html'
                            ];

                            for (const att of parsed.attachments) {
                                try {
                                    // 1. Validate size and mime type
                                    if (att.size > MAX_FILE_SIZE) {
                                        console.warn(`SES Webhook: Skipped attachment '${att.filename}' (Too large: ${att.size} bytes)`);
                                        continue;
                                    }
                                    if (BLOCKED_MIME_TYPES.includes(att.contentType)) {
                                        console.warn(`SES Webhook: Skipped attachment '${att.filename}' (Blocked MIME: ${att.contentType})`);
                                        continue;
                                    }

                                    // 2. Ignore inline signature images / decorative assets
                                    const isSmall = att.size < 50 * 1024; // < 50 KB
                                    const isImage = att.contentType.startsWith('image/');
                                    const isInline = att.contentDisposition === 'inline' || att.related === true;

                                    if (isSmall && isImage && isInline) {
                                        console.log(`SES Webhook: Skipped likely signature image '${att.filename}'`);
                                        continue;
                                    }

                                    const fileExt = att.filename ? att.filename.split('.').pop() : 'bin'
                                    const uniqueId = crypto.randomUUID()
                                    const newKey = `attachments/${uniqueId}.${fileExt}`

                                    await s3Client.send(new PutObjectCommand({
                                        Bucket: process.env.AWS_BUCKET_NAME!,
                                        Key: newKey,
                                        Body: att.content,
                                        ContentType: att.contentType,
                                    }))

                                    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${newKey}`

                                    parsedAttachments.push({
                                        filename: att.filename || 'vedhæftet_fil',
                                        fileKey: newKey,
                                        mimeType: att.contentType,
                                        size: att.size || att.content.length,
                                        url,
                                        uploadedByUserId: user.id
                                    })
                                } catch (attError) {
                                    // 3. Safe failover: Log error but continue processing post
                                    console.error(`SES Webhook: Failed to process attachment '${att.filename}':`, attError);
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error("Failed to parse raw email from S3:", err)
                }
            }

            // 6. Create Reply OR New Thread in DB
            if (threadId) {
                // It's a reply
                const thread = await prisma.forumThread.findUnique({ where: { id: threadId } })
                if (thread && thread.status !== 'ARCHIVED') {
                    const post = await prisma.forumPost.create({
                        data: {
                            threadId,
                            content,
                            authorUserId: user.id,
                            sourceType: 'EMAIL',
                            emailMessageId: mail.messageId,
                            attachments: {
                                create: parsedAttachments.map(att => ({ ...att, forumThreadId: threadId }))
                            }
                        }
                    })

                    await prisma.forumThread.update({
                        where: { id: threadId },
                        data: { lastPostAt: new Date() }
                    })
                    console.log(`SES Webhook: Created reply with ${parsedAttachments.length} attachments for thread ${threadId}`)
                }
            } else {
                // It's a new thread sent to forum@...
                if (subject.toLowerCase().startsWith("re:")) {
                    subject = subject.substring(3).trim()
                }

                const thread = await prisma.forumThread.create({
                    data: {
                        title: subject,
                        createdByUserId: user.id,
                        sourceType: 'EMAIL',
                        posts: {
                            create: {
                                content,
                                authorUserId: user.id,
                                sourceType: 'EMAIL',
                                emailMessageId: mail.messageId,
                                attachments: {
                                    create: parsedAttachments
                                }
                            }
                        }
                    }
                })

                // Attachments created via nested write above are linked to the post.
                // We also link them to the thread explicitly.
                if (parsedAttachments.length > 0) {
                    await prisma.attachment.updateMany({
                        where: { uploadedByUserId: user.id, forumPost: { threadId: thread.id } },
                        data: { forumThreadId: thread.id }
                    })
                }

                console.log(`SES Webhook: Created new thread "${subject}" with ${parsedAttachments.length} attachments`)
            }
        }

        return new NextResponse("OK", { status: 200 })
    } catch (error) {
        console.error("SES Webhook Error:", error)
        return new NextResponse("Webhook Processing Error", { status: 500 })
    }
}
