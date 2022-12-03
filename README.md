# Google Font Previews

This repository generates preview images for [Google Fonts](https://fonts.google.com).

## Usage

Clone this repository and run the following commands:

```bash
# 1. Install dependencies
npm install

# 2. Run the script to generate the preview images
npm run generate
```

This will fetch all fonts and generate preview images for all of them. This will take a while (~20min on my machine).
The images will be saved in the `/output/previews` directory.

## Requirements

You need to have [Node.js](https://nodejs.org) v16 or newer installed.

## Configuration

You can customize the previews by editing the `config.json` file:

```json
{
  // Text of the preview images.
  // If empty, the font name will be used.
  "previewText": "",

  // The text color of the preview text.
  "textColor": "#1b1b18",

  // The font size of the preview text.
  // Has to be a valid CSS font-size value.
  "fontSize": "48px",

  // The format and file extension of the preview images.
  // Either "png" or "jpeg".
  "format": "png",

  // The quality of the preview images (only used for JPEG).
  "quality": 100,

  // If the background should be transparent (only used for PNG).
  "transparent": true
}
```

## Limitations

- Only sans-serif, serif, display, handwriting and monospace fonts are included. Icon fonts are excluded.
- Fonts with large glyphsets such as the Japanese language are excluded, e.g. [Noto Sans Japanese](https://fonts.google.com/noto/specimen/Noto+Sans+JP)

## Credits

- [Google Fonts](https://fonts.google.com)
- [@fontsource/google-font-metadata](https://github.com/fontsource/google-font-metadata)
- [@junminahn/node-font2base64](https://github.com/junminahn/node-font2base64)
- [@frinyvonnick/node-html-to-image](https://github.com/frinyvonnick/node-html-to-image)
- [@lovell/sharp](https://github.com/lovell/sharp)
- [@google/zx](https://github.com/google/zx)
