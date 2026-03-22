import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { jest } from '@jest/globals';
import { prepareMarkdownAssets, type UploadAssetInput } from '../../src/services/doc-assets.js';

describe('doc asset preparation', () => {
  let tempDir: string;
  let uploadAsset: jest.MockedFunction<(input: UploadAssetInput, suggestedName: string) => Promise<string>>;
  let fetchMock: jest.MockedFunction<typeof fetch>;
  const originalFetch = global.fetch;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'siyuan-cli-assets-'));
    uploadAsset = jest.fn<(input: UploadAssetInput, suggestedName: string) => Promise<string>>(async (_input, suggestedName) =>
      `/data/assets/cli-publish/${suggestedName}`
    );
    fetchMock = jest.fn<typeof fetch>() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('rewrites relative image paths after upload', async () => {
    const assetsDir = join(tempDir, 'img');
    mkdirSync(assetsDir);
    writeFileSync(join(assetsDir, 'demo.png'), 'png-data');

    const markdown = '![demo](./img/demo.png)';
    const filePath = join(tempDir, 'post.md');
    writeFileSync(filePath, markdown);

    const result = await prepareMarkdownAssets(markdown, {
      markdownFilePath: filePath,
      uploadAsset,
    });

    expect(uploadAsset).toHaveBeenCalledTimes(1);
    expect(result.markdown).toMatch(/\/data\/assets\/cli-publish\/demo-[a-f0-9]{8}\.png/);
  });

  test('rewrites absolute local image paths after upload', async () => {
    const imagePath = join(tempDir, 'cover.jpg');
    writeFileSync(imagePath, 'jpg-data');

    const result = await prepareMarkdownAssets(`![cover](${imagePath})`, {
      uploadAsset,
    });

    expect(uploadAsset).toHaveBeenCalledTimes(1);
    expect(result.markdown).toMatch(/\/data\/assets\/cli-publish\/cover-[a-f0-9]{8}\.jpg/);
  });

  test('downloads remote url images before upload', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      arrayBuffer: async () => new TextEncoder().encode('remote-image').buffer,
      headers: new Headers({ 'content-type': 'image/png' }),
    } as Response);

    const result = await prepareMarkdownAssets('![remote](https://example.com/demo.png)', {
      uploadAsset,
    });

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/demo.png');
    expect(uploadAsset).toHaveBeenCalledTimes(1);
    expect(result.markdown).toMatch(/\/data\/assets\/cli-publish\/demo-[a-f0-9]{8}\.png/);
  });

  test('decodes data uri images before upload', async () => {
    const result = await prepareMarkdownAssets('![inline](data:image/png;base64,aGVsbG8=)', {
      uploadAsset,
    });

    expect(uploadAsset).toHaveBeenCalledTimes(1);
    expect(result.markdown).toMatch(/\/data\/assets\/cli-publish\/image-[a-f0-9]{8}\.png/);
  });

  test('fails when a local image cannot be resolved', async () => {
    await expect(
      prepareMarkdownAssets('![missing](./missing.png)', {
        markdownFilePath: join(tempDir, 'post.md'),
        uploadAsset,
      })
    ).rejects.toThrow('Failed to resolve image');

    expect(uploadAsset).not.toHaveBeenCalled();
  });
});
