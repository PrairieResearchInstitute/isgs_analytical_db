import { S3Client, CreateBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

if (!env.S3_ENDPOINT) throw new Error('S3_ENDPOINT is not set');
if (!env.S3_ACCESS_KEY) throw new Error('S3_ACCESS_KEY is not set');
if (!env.S3_SECRET_KEY) throw new Error('S3_SECRET_KEY is not set');

const s3 = new S3Client({
	endpoint: env.S3_ENDPOINT,
	region: 'us-east-1',
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY,
		secretAccessKey: env.S3_SECRET_KEY
	},
	forcePathStyle: true
});

export async function ensureBucket(bucket: string): Promise<void> {
	try {
		await s3.send(new CreateBucketCommand({ Bucket: bucket }));
	} catch (err: unknown) {
		const code = (err as { Code?: string; name?: string }).Code ?? (err as { name?: string }).name;
		if (code !== 'BucketAlreadyOwnedByYou' && code !== 'BucketAlreadyExists') throw err;
	}
}

export async function uploadFile(
	bucket: string,
	key: string,
	body: ArrayBuffer,
	contentType: string
): Promise<void> {
	await s3.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: new Uint8Array(body),
			ContentType: contentType
		})
	);
}
