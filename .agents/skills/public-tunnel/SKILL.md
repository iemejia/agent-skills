---
name: public-tunnel
description: Create temporary public tunnels to expose local application ports for demos or sharing work in progress. Use when the user asks to share a local app, create a public URL for a port, set up a tunnel, or make a local server temporarily accessible from the internet.
---

# Public Tunnel (tunnelmole)

Create temporary public URLs that forward to local application ports using tunnelmole. No account needed, no password — just a clean public URL.

## Usage

When a user asks to expose a local port or create a public URL for a running application:

1. Confirm the local port number (must be > 1024 for security)
2. Start a tunnel using `npx tunnelmole` as a background process
3. Parse the generated `*.tunnelmole.net` URL from the output
4. Report the public URL back to the user

## Important Rules

- **Port restriction**: Only expose ports > 1024. Refuse to tunnel privileged ports (0-1024) to prevent exposing sensitive services.
- **Single tunnel per port**: Don't create duplicate tunnels for the same port.
- **No password needed**: Tunnelmole URLs are directly accessible — no IP/password prompt.

## Example

User: "Create a tunnel for my app on port 5173"

1. Start the tunnel as a background process
2. Read the output to get the `*.tunnelmole.net` URL
3. Send the user the URL

Response example:
> Your app is now publicly accessible at: `https://f38fg.tunnelmole.net`
> The tunnel will automatically close in 15 minutes.

## Implementation Notes

Run tunnelmole via `npx` as a detached background process. The URL appears in stdout after a few seconds.

```bash
# Start tunnel (run as detached background process)
npx -y tunnelmole <port>
```

The output contains a line like:
```
https://f38fg.tunnelmole.net is forwarding to localhost:5173
```

Parse the `https://*.tunnelmole.net` URL from the output.

To close the tunnel, kill the tunnelmole process for the corresponding port.
