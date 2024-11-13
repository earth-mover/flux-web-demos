# Earthmover Query Service Demos

A showcase for using Earthmover's Query Service to drive web applications, built with React and Mapbox

## Running Locally

Install the dependencies

```bash
bun install
```

### Environment Variables

Before running or building, this app requires that you have a [mapbox access token](https://docs.mapbox.com/help/getting-started/access-tokens/) defined in `.env` or `.env.local`:

```
VITE_MAPBOX_ACCESS_TOKEN=pk.my-token
```

Run locally

```bash
bun run dev
```

## Deploying the App

This app builds into a single page application. It can be built with `vite`: 

```bash
bun run build
```

Once complete, the full website will be output into the `dist/` directory. You can simply serve this folder however you choose to run the compiled web application.