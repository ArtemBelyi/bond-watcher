import { InvestNodeSDK } from '@ttech-pub/invest-sdk-node';

export const APP_NAME = 'bond-watcher';

export type CreateTinvestSdkOptions = {
  token: string;
  url: string;
  appName?: string;
};

/**
 * Creates an Invest gRPC SDK client.
 */
export async function createTinvestSdk(
  options: CreateTinvestSdkOptions,
): Promise<InvestNodeSDK> {
  return InvestNodeSDK.create({
    token: options.token,
    url: options.url,
    metadata: {
      'x-app-name': options.appName ?? APP_NAME,
    },
    useMincifryCertificate: true,
  });
}

/**
 * Releases SDK resources. The current SDK has no public close API.
 */
export async function closeTinvestSdk(_sdk: InvestNodeSDK): Promise<void> {
  return Promise.resolve();
}
