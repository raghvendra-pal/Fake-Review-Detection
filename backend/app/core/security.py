import ipaddress
import socket
from urllib.parse import urlparse
from fastapi import HTTPException

# Disallowed private and special network ranges
BLOCKED_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),       # Link-local / Cloud metadata (169.254.169.254)
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("224.0.0.0/4"),         # Multicast
    ipaddress.ip_network("240.0.0.0/4"),         # Reserved
    ipaddress.ip_network("::1/128"),             # IPv6 Loopback
    ipaddress.ip_network("fc00::/7"),            # IPv6 Unique Local
    ipaddress.ip_network("fe80::/10"),           # IPv6 Link-Local
]

BLOCKED_HOSTNAMES = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "metadata.google.internal",
    "169.254.169.254",
    "instance-data",
}

def validate_url_security(url_str: str) -> str:
    """
    Validates URL to protect against SSRF (Server-Side Request Forgery).
    Blocks private IP addresses, cloud metadata endpoints, loopback, and disallowed schemes.
    """
    if not url_str or not isinstance(url_str, str):
        raise HTTPException(status_code=400, detail="Invalid URL format provided.")

    url_str = url_str.strip()
    if len(url_str) > 2048:
        raise HTTPException(status_code=400, detail="URL exceeds maximum allowed length of 2048 characters.")

    try:
        parsed = urlparse(url_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed URL structure.")

    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Only 'http' and 'https' protocols are permitted.")

    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="Missing hostname in URL.")

    lower_host = hostname.lower()
    if lower_host in BLOCKED_HOSTNAMES:
        raise HTTPException(status_code=400, detail="Access to internal/loopback hosts is forbidden.")

    # DNS Resolution & IP verification
    try:
        resolved_ips = socket.getaddrinfo(hostname, None)
        for family, _, _, _, sockaddr in resolved_ips:
            ip_str = sockaddr[0]
            ip_obj = ipaddress.ip_address(ip_str)

            if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_multicast or ip_obj.is_reserved:
                raise HTTPException(
                    status_code=400,
                    detail="Access to private or local network resources is strictly prohibited (SSRF prevention)."
                )

            for net in BLOCKED_NETWORKS:
                if ip_obj in net:
                    raise HTTPException(
                        status_code=400,
                        detail="Access to prohibited IP range is blocked."
                    )
    except socket.gaierror:
        # Domain cannot be resolved via DNS
        raise HTTPException(status_code=400, detail=f"Could not resolve domain: '{hostname}'. Please check the URL.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Host resolution check failed: {str(e)}")

    return url_str
