import { NextResponse } from "next/server";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();

        // 1. Authenticate the user
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { filename, contentType } = await req.json();

        if (!filename || !contentType) {
            return NextResponse.json(
                { error: "Missing filename or contentType" },
                { status: 400 }
            );
        }

        // 2. Generate a safe unique key for the file
        // To prevent overwriting, combine the timestamp and original name
        const fileExtension = filename.split(".").pop();
        const safeFilename = filename.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
        const key = `uploads/${session.user.id}-${Date.now()}-${safeFilename}.${fileExtension}`;

        // 3. Create the presigned URL command
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
            // Optionally, we can set ACLs if your bucket allows it, but often public-read is configured at the bucket level instead
            // ACL: "public-read",
        });

        // 4. Get the signed URL that the client will upload to
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // Valid for 60 seconds

        // Calculate the final public URL where the file can be viewed afterwards
        const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return NextResponse.json({ signedUrl, publicUrl, key });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return NextResponse.json(
            { error: "Failed to generate upload URL" },
            { status: 500 }
        );
    }
}
