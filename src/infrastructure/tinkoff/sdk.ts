import { InvestNodeSDK } from '@ttech-pub/invest-sdk-node';
import { NodeApiClient } from '@ttech-pub/grpc-node-client';
import type { InverstNodeSDKOptions } from '@ttech-pub/invest-sdk-node/src/lib/core/instance.js';


/**
 * Creates an Invest gRPC SDK client.
 */
export async function initTinvestSdk(
  options: InverstNodeSDKOptions,
): Promise<InvestNodeSDK> {
  return InvestNodeSDK.create({
    ...options,
    metadata: { ...options.metadata, 'x-app-name': 'bond-watcher' },
    useMincifryCertificate: true,
  });
}

export async function initNodeApiClient(
  options: InverstNodeSDKOptions,
): Promise<NodeApiClient> {
  return NodeApiClient.create({
    ...options,
    metadata: { ...options.metadata, 'x-app-name': 'bond-watcher' },
    useMincifryCertificate: true,
  });
}

/**
 * Releases SDK resources. The current SDK has no public close API.
 */
export async function closeTinvestSdk(_sdk: InvestNodeSDK): Promise<void> {
  return Promise.resolve();
}
