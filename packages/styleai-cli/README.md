# Style AI CLI

Terminal companion for Style AI Neural Extraction engine.

## Features
- `styleai login`: Authenticates via OAuth in your browser.
- `styleai generate <URL>`: Extracts a neural design system directly into your terminal environment.

## Build from Source

```bash
cd packages/styleai-cli
npm install
npm run build
```

## Testing Locally

You can link the package globally to test it:

```bash
npm link
styleai --help
styleai login
```

Once logged in, verify who you are:
```bash
styleai whoami
```

And test generation!
```bash
styleai generate https://apple.com --level detailed
```
