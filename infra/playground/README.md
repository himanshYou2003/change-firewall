# Local playground infrastructure

`docker compose -f infra/playground/docker-compose.yml up --build` runs the development gateway on `127.0.0.1:8787`. The container adds filesystem/process separation for convenience, but it is not the plan's required production security boundary: all sessions still share one container kernel and service identity.

Before any public rollout, replace this adapter with one sandbox or microVM per session, disable guest egress, separate controller and visitor identities, protect the control channel, implement one-use preview tickets on isolated HTTPS origins, and pass the P2/P5 cross-session, `/proc`, descriptor, symlink, resource, and lifecycle tests.
