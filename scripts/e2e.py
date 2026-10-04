import os
from pathlib import Path
import signal
import socket
import subprocess
import time
import urllib.request

root = Path(__file__).resolve().parent.parent


def free_port(requested="0"):
    with socket.socket() as reservation:
        reservation.bind(("127.0.0.1", int(requested)))
        return str(reservation.getsockname()[1])


def wait_ready(server, origin, log_path):
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        if server.poll() is not None:
            raise RuntimeError(log_path.read_text())
        try:
            with urllib.request.urlopen(f"{origin}/health/ready", timeout=1) as response:
                if response.status == 200:
                    return
        except Exception:
            time.sleep(0.25)
    raise RuntimeError("Server did not become ready: " + log_path.read_text())


def stop(server):
    if server.poll() is None:
        os.killpg(server.pid, signal.SIGTERM)
        try:
            server.wait(timeout=20)
        except subprocess.TimeoutExpired:
            os.killpg(server.pid, signal.SIGKILL)
            server.wait()


port = free_port(os.environ.get("E2E_PORT", "0"))
origin = f"http://localhost:{port}"
env = dict(os.environ, MIX_ENV="test", PHX_SERVER="true", PORT=port,
           SUPERVISE_FRONTEND="true", E2E_SERVER="true", PUBLIC_ORIGIN=origin,
           E2E_DATABASE_PATH=str(root / "data/e2e.db"))
log_path = root / "tmp/e2e-server.log"
log_path.parent.mkdir(exist_ok=True)
subprocess.run(["mix", "ecto.setup"], cwd=root,
               env=dict(env, PHX_SERVER="false", SUPERVISE_FRONTEND="false", E2E_SERVER="false"), check=True)
with log_path.open("w") as log:
    server = subprocess.Popen(["mix", "phx.server"], cwd=root, env=env, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
    try:
        wait_ready(server, origin, log_path)
        subprocess.run(["npm", "--prefix", "frontend", "run", "test"], cwd=root,
                       env=dict(env, BASE_URL=origin), check=True)
        vite_port = free_port()
        vite_origin = f"http://localhost:{vite_port}"
        vite_env = dict(env, PORT=vite_port, BACKEND_URL=origin, PUBLIC_ORIGIN=vite_origin)
        vite_log_path = root / "tmp/e2e-vite.log"
        with vite_log_path.open("w") as vite_log:
            vite = subprocess.Popen(["npm", "--prefix", "frontend", "run", "dev", "--", "--force", "--port", vite_port],
                                    cwd=root, env=vite_env, stdout=vite_log, stderr=subprocess.STDOUT,
                                    start_new_session=True)
            try:
                wait_ready(vite, vite_origin, vite_log_path)
                subprocess.run(["npm", "--prefix", "frontend", "run", "test", "--", "--grep", "CRUD|mobile|login errors"],
                               cwd=root, env=dict(vite_env, BASE_URL=vite_origin), check=True)
            finally:
                stop(vite)
    finally:
        stop(server)
print("Supervised server and Vite stopped")
