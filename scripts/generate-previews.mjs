import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'public', 'previews');

async function generatePreviews() {
    const server = await createServer({
        root,
        logLevel: 'error',
        server: { host: '127.0.0.1', port: 0 },
    });

    await server.listen();
    const baseUrl = server.resolvedUrls?.local[0]?.replace(/\/$/, '');
    if (!baseUrl) throw new Error('Unable to determine the Vite preview URL.');

    const { configData } = await server.ssrLoadModule('/src/conf/configData.ts');
    const browser = await chromium.launch();

    try {
        await mkdir(outputDirectory, { recursive: true });
        const page = await browser.newPage({ viewport: { width: 1000, height: 720 }, deviceScaleFactor: 1 });

        for (const item of configData) {
            const url = `${baseUrl}${item.path}`;
            const outputPath = path.join(root, 'public', item.thumbnail.path);

            await page.goto(url, { waitUntil: 'domcontentloaded' });
            const scene = page.locator('.three-demo');
            await scene.locator('canvas').first().waitFor({ state: 'visible', timeout: 10000 });
            await page.waitForTimeout(item.thumbnail.waitMs);

            const box = await scene.boundingBox();
            if (!box) throw new Error(`Scene container is not visible: ${item.name}`);

            const side = Math.floor(Math.min(box.width, box.height));
            if (side < 320) throw new Error(`Scene container is too small to capture: ${item.name}`);

            await page.screenshot({
                path: outputPath,
                type: 'webp',
                quality: 82,
                clip: {
                    x: box.x + (box.width - side) / 2,
                    y: box.y + (box.height - side) / 2,
                    width: side,
                    height: side,
                },
            });

            console.log(`Generated ${item.thumbnail.path}`);
        }
    } finally {
        await browser.close();
        await server.close();
    }
}

generatePreviews().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
