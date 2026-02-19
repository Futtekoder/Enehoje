
import { S3Client } from "@aws-sdk/client-s3"

export const s3Client = new S3Client({
    region: process.env.AWS_REGION || "auto",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
    // Optional endpoint for compatible services like Cloudflare R2 or DigitalOcean Spaces
    // endpoint: process.env.AWS_ENDPOINT, 
})

export const BUCKET_NAME = process.env.AWS_BUCKET_NAME || ""
