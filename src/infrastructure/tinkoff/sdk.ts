import {
  NodeApiClient,
  type TTechAPIClientOptions,
} from '@ttech-pub/grpc-node-client';

/**
 * Creates a T-Invest gRPC client.
 */
export async function initApiClient(
  options: TTechAPIClientOptions,
): Promise<NodeApiClient> {
  return NodeApiClient.create({
    ...options,
    useMincifryCertificate: true,
  });
}

/**
 * Releases client resources. The current client has no public close API.
 */
export async function closeApiClient(_client: NodeApiClient): Promise<void> {
  return Promise.resolve();
}
