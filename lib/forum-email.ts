import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { prisma } from "./db";

const ses = new SESClient({
    region: process.env.AWS_REGION || "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function sendForumNotification(threadId: string, postId: string) {
    try {
        // 1. Fetch thread, post, and author
        const thread = await prisma.forumThread.findUnique({
            where: { id: threadId },
            include: { posts: { orderBy: { createdAt: 'asc' }, take: 3 } } // Get latest context
        });

        const post = await prisma.forumPost.findUnique({
            where: { id: postId },
            include: { author: true, attachments: true }
        });

        if (!thread || !post) return;

        // 2. Fetch all active members to notify
        // In this v1 we notify all active users with an email
        const users = await prisma.user.findMany({
            where: { email: { not: '' } }
        });

        const emails = users.map(u => u.email).filter(Boolean) as string[];
        if (emails.length === 0) return;

        // 3. Construct Email Content
        const subject = `[Enehøje] ${thread.title}`;

        // Dynamic Reply-To mapping back to our inbound SES webhook
        const replyToAddress = `reply+${thread.id}@forum.enehoje.com`;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.enehoje.com';

        let attachmentsHtml = '';
        if (post.attachments.length > 0) {
            attachmentsHtml = `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: bold; color: #6b7280;">Vedhæftede filer (${post.attachments.length}):</p>
                    <ul style="margin:0; padding-left: 20px; font-size: 14px;">
                        ${post.attachments.map(a => `<li><a href="${a.url}">${a.filename}</a></li>`).join('')}
                    </ul>
                </div>
            `;
        }

        const htmlBody = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <p style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Ny besked vedr. Enehøje Forum</p>
                <h2 style="color: #1e3a8a; margin-top: 0;">${thread.title}</h2>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: bold;">Fra: ${post.author.name || 'Ukendt'}</p>
                    <div style="white-space: pre-wrap; margin: 0; font-size: 15px; line-height: 1.5;">${post.content}</div>
                    ${attachmentsHtml}
                </div>

                <div style="margin-top: 30px;">
                    <a href="${appUrl}/forum/${thread.id}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Læs og svar i forum
                    </a>
                </div>
                
                <p style="margin-top: 30px; font-size: 13px; color: #6b7280; line-height: 1.5;">
                    Du modtager denne besked fordi du er medlem af Enehøje.<br/>
                    Du kan også svare direkte på denne e-mail for at skrive et svar i tråden.
                </p>
            </div>
        `;

        // 4. Send via AWS SES
        const command = new SendEmailCommand({
            Source: "Forum Enehøje <forum@enehoje.com>",
            Destination: {
                BccAddresses: emails,
            },
            ReplyToAddresses: [replyToAddress],
            Message: {
                Subject: { Data: subject, Charset: "UTF-8" },
                Body: {
                    Html: { Data: htmlBody, Charset: "UTF-8" },
                    Text: { Data: post.content, Charset: "UTF-8" }
                }
            }
        });

        await ses.send(command);
        console.log(`Successfully sent forum notification for thread: ${thread.id}`);
    } catch (error) {
        console.error("Failed to send AWS SES forum notification:", error);
    }
}
