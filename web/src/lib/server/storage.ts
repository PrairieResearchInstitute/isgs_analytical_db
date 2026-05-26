import { S3Client, CreateBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

const s3 = new S3Client({
	endpoint: env.RUSTFS_ENDPOINT ?? 'http://localhost:9000',
	region: 'us-east-1',
	credentials: {
		accessKeyId: env.RUSTFS_ACCESS_KEY ?? 'rustfsadmin',
		secretAccessKey: env.RUSTFS_SECRET_KEY ?? 'rustfsadmin'
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
