import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "./db";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

/**
 * Safely deletes an Attachment from both the database and AWS S3.
 * IMPORTANT: This should be used instead of calling prisma.attachment.delete directly 
 * to ensure that the physical file is removed from our storage bucket.
 * 
 * @param attachmentId The UUID of the Attachment
 * @param userId The ID of the user requesting deletion (for security checks)
 * @param isAdmin Whether the user has system admin privileges
 * @returns boolean indicating success
 */
export async function deleteAttachmentAndFile(attachmentId: string, userId: string, isAdmin: boolean = false) {
    // 1. Find the attachment
    const attachment = await prisma.attachment.findUnique({
        where: { id: attachmentId }
    });

    if (!attachment) {
        throw new Error("Attachment not found");
    }

    // 2. Verify authorization
    if (attachment.uploadedByUserId !== userId && !isAdmin) {
        throw new Error("Unauthorized to delete this attachment");
    }

    // 3. Delete from S3 if fileKey exists
    if (attachment.fileKey) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: attachment.fileKey,
            });
            await s3Client.send(command);
        } catch (s3Error) {
            console.error(`Failed to delete S3 object ${attachment.fileKey}:`, s3Error);
            // We log the error but continue to delete the DB record. 
            // In a strict environment we might throw here to prevent orphaned DB records,
            // but usually a dangling S3 file is better than a broken UI.
        }
    }

    // 4. Delete from Database
    await prisma.attachment.delete({
        where: { id: attachmentId }
    });

    return true;
}
