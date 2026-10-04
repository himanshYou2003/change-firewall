# Interactive playground architecture

The interactive homepage playground has two execution profiles.

## Local development profile

The local gateway creates one temporary workspace per session, invokes the
checked-out Change Firewall package against a seeded Git repository, and exposes
only loopback HTTP endpoints. This profile exists for development and automated
integration tests. It is not a hardened boundary for untrusted public users.

Start from the repository root after building the CLI and installing each
service package. The exact service commands and environment variables live in
the service READMEs and `infra/playground` files. The website reads its gateway
base URL from the documented public environment variable and otherwise renders
an explicit unavailable state.

## Production profile

Public arbitrary command execution requires the production adapter described in
the implementation plan: one hardened gVisor or microVM sandbox per visitor,
separate controller and visitor identities, provider-protected control streams,
default-deny guest networking, resource quotas, TTL cleanup, and independently
authenticated dashboard previews. The local process adapter must never be
exposed to anonymous internet traffic.

The intended origin topology is:

```text
app.<owned-domain>                 existing Next.js website
api.<owned-domain>                 session gateway
<opaque-id>.preview.<owned-domain> isolated dashboard preview
```

App and preview credentials are host-only. Preview bootstrap tickets are
single-use and scoped to a session generation and dashboard process. The proxy
can forward only a registered loopback listener owned by that session's visitor
process. It cannot accept an arbitrary host or port.

## Trust boundaries

- Browser input, filenames, terminal bytes, CLI findings, and preview HTML are
  untrusted.
- Gateway-owned session records authorize lifecycle operations. CLI semantic
  events can improve teaching but never grant authority.
- File operations stay beneath the session workspace, use revision checks, and
  reject traversal, symlinks, and special files.
- Session tokens are scoped and short-lived; a session identifier is not an
  authorization credential.
- Reset, expiration, and deletion terminate all process groups and invalidate
  stream and preview credentials.

## Artifact flow

1. Build Change Firewall from the same checkout used for the website release.
2. Capture the CLI command manifest.
3. Seed and validate every fixture scenario against that built artifact.
4. Build the runtime image with the pinned package and fixtures; no registry
   download occurs in visitor sessions.
5. Build the website against the compatible protocol version.
6. Run real-session browser, isolation, and preview-stream tests before enabling
   public sessions.

The repository supplies a local development adapter. A production deployment
remains disabled until an operator provisions the required sandbox provider,
domains, certificates, quotas, and monitoring and completes the security checks
in the implementation plan.
