import "zx/globals";
import { APIv2 } from "google-font-metadata";
import nodeHtmlToImage from "node-html-to-image";
import font2base64 from "node-font2base64";
import sharp from "sharp";

const tempDir = "./tmp";
const tmpFontsDir = "./tmp/fonts";
const tmpImageDir = "./tmp/images";
const outputDir = "./output";
const previewDir = "./output/previews";

const config = await fs.readJson("./config.json");

const categories = new Set([
  "sans-serif",
  "serif",
  "display",
  "handwriting",
  "monospace",
]);

const start = Date.now();

echo`Clean up...`;
fs.rmSync(tempDir, { recursive: true, force: true });
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(tempDir);
fs.mkdirSync(tmpFontsDir);
fs.mkdirSync(tmpImageDir);
fs.mkdirSync(outputDir);
fs.mkdirSync(previewDir);

echo`Collect fonts list...`;
const fontsMetadata = Object.values(APIv2).filter((font) =>
  categories.has(font.category)
);

const fontsList = fontsMetadata.flatMap((f) => {
  const weight =
    f.weights.find((w) => w === 400 || w === "400") || f.weights[0];
  const style = f.styles.find((s) => s === "normal") || f.styles[0];
  let subset = f.subsets.find((s) => s === "latin") || f.subsets[0];

  if (f.unicodeRange && !f.unicodeRange[subset]) {
    subset = Object.keys(f.unicodeRange)[0];
  }

  const downloadUrl = f.variants[weight][style][subset].url.woff;
  const filePath = `${tmpFontsDir}/${f.id}-${subset}-${weight}-${style}.woff`;

  return { id: f.id, name: f.family, filePath, downloadUrl };
});

echo`Downloading fonts...`;
await Promise.all(
  fontsList.map(async (f) => {
    const response = await fetch(f.downloadUrl);
    const buffer = await response.buffer();
    await fs.writeFile(f.filePath, buffer);
  })
);

echo`Prepare fonts...`;
const fontsData$ = fontsList.map((f) =>
  font2base64.encodeToDataUrl(f.filePath)
);
const fontsData = await Promise.all(fontsData$);

echo`Generate previews...`;
await nodeHtmlToImage({
  type: config.format,
  quality: config.quality,
  transparent: config.transparent,
  content: fontsList.flatMap((font, idx) => [
    {
      fontId: font.id,
      fontData: fontsData[idx],
      text: config.previewText || font.name,
      color: config.textColor,
      output: `${tmpImageDir}/${font.id}.${config.format}`,
    },
  ]),
  selector: "#preview",
  html: `
    <html>
     <head>
       <style>
         @font-face {
           font-family: {{fontId}};
           src: url("{{{fontData}}}") format('woff');
         }

         #preview {
           display: inline-block;
           margin: 20px;
           color: {{color}};
           font-family: "{{fontId}}";
           font-size: ${config.fontSize};
           padding: 40px;
         }
       </style>
     </head>
     <body>
       <div id="preview">{{text}}</div>
     </body>
   </html>
  `,
});

echo`Postprocess previews...`;
fontsList.map((font) =>
  sharp(`${tmpImageDir}/${font.id}.${config.format}`)
    .trim(1)
    .toFile(`${previewDir}/${font.id}.${config.format}`)
);

const diff = Date.now() - start;
const duration = Math.round(diff / 1000);

echo(chalk.green(`Done in ${duration}s!`));
