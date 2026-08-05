import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = path.resolve("public/explore-thumbs");
const outputDirectory = path.join(sourceDirectory, "normalized");
const canvasSize = 800;
const safeArea = 52;
const innerSize = canvasSize - safeArea * 2;

// These images contain a thin scanner/export edge inside the bitmap. Remove
// only that edge; the artwork itself is always preserved and fit with contain.
const edgeTrim = new Map([
  ["23.png", 4],
  ["49.png", 8],
]);

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

async function backgroundFor(input) {
  const { data, info } = await sharp(input)
    .resize(48, 48, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const patch = 6;
  const samples = [
    [0, 0],
    [info.width - patch, 0],
    [0, info.height - patch],
    [info.width - patch, info.height - patch],
  ].map(([left, top]) => {
    const channels = [[], [], []];
    for (let y = top; y < top + patch; y += 1) {
      for (let x = left; x < left + patch; x += 1) {
        const offset = (y * info.width + x) * info.channels;
        channels[0].push(data[offset]);
        channels[1].push(data[offset + 1]);
        channels[2].push(data[offset + 2]);
      }
    }
    return channels.map((channel) => Math.round(channel.reduce((sum, value) => sum + value, 0) / channel.length));
  });

  // The median corner is resistant to a bright label or dark control that
  // happens to occupy one corner of an otherwise consistent application UI.
  return {
    r: median(samples.map((sample) => sample[0])),
    g: median(samples.map((sample) => sample[1])),
    b: median(samples.map((sample) => sample[2])),
    alpha: 1,
  };
}

async function normalize(filename) {
  const input = path.join(sourceDirectory, filename);
  const trim = edgeTrim.get(filename) ?? 0;
  const metadata = await sharp(input).metadata();
  const width = metadata.width ?? canvasSize;
  const height = metadata.height ?? canvasSize;
  const extract = trim > 0
    ? { left: trim, top: trim, width: width - trim * 2, height: height - trim * 2 }
    : undefined;
  const background = await backgroundFor(input);
  let image = sharp(input);
  if (extract) image = image.extract(extract);

  const fitted = await image
    .resize(innerSize, innerSize, {
      fit: "contain",
      position: "centre",
      background,
      withoutEnlargement: false,
    })
    .webp({ quality: 91, smartSubsample: true })
    .toBuffer();

  await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background },
  })
    .composite([{ input: fitted, left: safeArea, top: safeArea }])
    .webp({ quality: 91, smartSubsample: true })
    .toFile(path.join(outputDirectory, `${path.parse(filename).name}.webp`));
}

await mkdir(outputDirectory, { recursive: true });
const files = (await readdir(sourceDirectory))
  .filter((filename) => /\.(png|jpe?g|webp)$/i.test(filename))
  .sort();
await Promise.all(files.map(normalize));
console.log(`Normalized ${files.length} demo thumbnails into ${path.relative(process.cwd(), outputDirectory)}.`);
