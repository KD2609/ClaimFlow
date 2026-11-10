#!/usr/bin/env python3
"""
Autonomous RPA Worker: Insurance Claim Processing Automation
Emulates an external Robotic Process Automation (RPA) bot communicating with
the Spring Boot REST API to automate claim intake, validation, OCR document
inspection, anomaly fraud detection, and status reconciliation.
"""

import argparse
import sys
import time
import requests
from datetime import datetime
from typing import Dict, Any, List, Optional

DEFAULT_BACKEND_URL = "http://localhost:8080"
DEFAULT_USERNAME = "admin"
DEFAULT_PASSWORD = "admin123"
DEFAULT_BOT_ID = "RPA-ROBOT-01"
DEFAULT_BOT_HOURLY_COST = 4.20  # $/hr bot operational cost


class RPAClaimWorker:
    def __init__(
        self,
        base_url: str = DEFAULT_BACKEND_URL,
        username: str = DEFAULT_USERNAME,
        password: str = DEFAULT_PASSWORD,
        bot_id: str = DEFAULT_BOT_ID,
        bot_hourly_cost: float = DEFAULT_BOT_HOURLY_COST
    ):
        self.base_url = base_url.rstrip("/")
        self.username = username
        self.password = password
        self.bot_id = bot_id
        self.bot_hourly_cost = bot_hourly_cost
        self.session = requests.Session()
        self.jwt_token: Optional[str] = None

    def log(self, message: str, level: str = "INFO"):
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{now}] [{self.bot_id}] [{level}] {message}")

    def authenticate(self) -> bool:
        """Authenticates with the Spring Boot backend to retrieve a JWT Bearer token."""
        url = f"{self.base_url}/api/auth/login"
        self.log(f"Authenticating worker credentials ({self.username}) against {url}...")
        try:
            resp = self.session.post(url, json={
                "username": self.username,
                "password": self.password
            }, timeout=8)

            if resp.status_code == 200:
                data = resp.json()
                self.jwt_token = data.get("token")
                self.session.headers.update({
                    "Authorization": f"Bearer {self.jwt_token}",
                    "Content-Type": "application/json"
                })
                self.log(f"Authentication successful. Bearer JWT acquired (Role: {data.get('role')}).")
                return True
            else:
                self.log(f"Authentication failed: HTTP {resp.status_code} - {resp.text}", level="ERROR")
                return False
        except Exception as e:
            self.log(f"Backend connection error: {e}", level="ERROR")
            return False

    def fetch_pending_claims(self, limit: int = 15) -> List[Dict[str, Any]]:
        """Retrieves SUBMITTED claims awaiting processing."""
        url = f"{self.base_url}/api/claims"
        params = {"status": "SUBMITTED", "page": 0, "size": limit}
        self.log(f"Fetching pending claims from queue (status=SUBMITTED, limit={limit})...")
        try:
            resp = self.session.get(url, params=params, timeout=10)
            if resp.status_code == 200:
                claims = resp.json().get("content", [])
                self.log(f"Found {len(claims)} claim(s) eligible for automated intake.")
                return claims
            else:
                self.log(f"Failed to fetch claims: HTTP {resp.status_code}", level="ERROR")
                return []
        except Exception as e:
            self.log(f"Error fetching claims: {e}", level="ERROR")
            return []

    def process_claim_individually(self, claim_id: int) -> Optional[Dict[str, Any]]:
        """Executes the RPA workflow for a single claim via the backend RPA engine."""
        url = f"{self.base_url}/api/rpa/run/{claim_id}"
        params = {
            "botId": self.bot_id,
            "botHourlyCost": self.bot_hourly_cost
        }
        self.log(f"Executing RPA workflow pipeline for Claim #{claim_id}...")
        start_time = time.time()
        try:
            resp = self.session.post(url, params=params, timeout=15)
            duration_ms = (time.time() - start_time) * 1000.0

            if resp.status_code == 200:
                result = resp.json()
                status = result.get("claimStatus")
                details = result.get("executionDetails", "")
                self.log(f"Claim #{claim_id} processed in {duration_ms:.1f}ms -> Status: {status}")
                self.log(f"  Audit Details: {details}")
                return result
            else:
                self.log(f"Failed to process Claim #{claim_id}: HTTP {resp.status_code} - {resp.text}", level="WARN")
                return None
        except Exception as e:
            self.log(f"Exception during Claim #{claim_id} processing: {e}", level="ERROR")
            return None

    def execute_batch(self, limit: int = 20) -> Optional[Dict[str, Any]]:
        """Triggers batch processing via the RPA batch endpoint."""
        url = f"{self.base_url}/api/rpa/batch"
        payload = {
            "botId": self.bot_id,
            "limit": limit,
            "botHourlyCost": self.bot_hourly_cost
        }
        self.log(f"Triggering automated batch run (Limit: {limit}, Bot Hourly Rate: ${self.bot_hourly_cost}/hr)...")
        start_time = time.time()
        try:
            resp = self.session.post(url, json=payload, timeout=30)
            elapsed = time.time() - start_time

            if resp.status_code == 200:
                data = resp.json()
                self.log("================================================================================")
                self.log(f"RPA BATCH EXECUTION FINISHED in {elapsed:.2f} seconds")
                self.log(f"Total Evaluated: {data.get('totalProcessed', 0)}")
                self.log(f"  -> Approved Automatically (Straight-Through): {data.get('approvedCount', 0)}")
                self.log(f"  -> Flagged / Manual Review Required:        {data.get('manualReviewCount', 0)}")
                self.log(f"  -> Rejected (Ineligible/Fraud):             {data.get('rejectedCount', 0)}")
                self.log(f"Total RPA Bot Runtime: {data.get('totalExecutionTimeMs', 0):.1f} ms")
                self.log(f"Total Bot Operational Cost: ${data.get('totalCost', 0.0):.4f}")
                self.log("================================================================================")
                return data
            else:
                self.log(f"Batch execution failed: HTTP {resp.status_code} - {resp.text}", level="ERROR")
                return None
        except Exception as e:
            self.log(f"Batch execution error: {e}", level="ERROR")
            return None


def print_banner():
    print("""
================================================================================
   INSURANCE CLAIM RPA WORKER (UiPath-Compatible Automation Demonstration)
   Operations Research College Project - Robotic Process Automation Bot
================================================================================
""")


def main():
    print_banner()
    parser = argparse.ArgumentParser(description="Autonomous RPA Insurance Claim Worker")
    parser.add_argument("--url", default=DEFAULT_BACKEND_URL, help="Spring Boot backend base URL")
    parser.add_argument("--user", default=DEFAULT_USERNAME, help="Username for API auth")
    parser.add_argument("--password", default=DEFAULT_PASSWORD, help="Password for API auth")
    parser.add_argument("--bot-id", default=DEFAULT_BOT_ID, help="RPA Bot Identifier")
    parser.add_argument("--batch-size", type=int, default=15, help="Number of claims to process in batch")
    parser.add_argument("--mode", choices=["batch", "individual", "continuous"], default="batch",
                        help="Processing mode: batch, individual, or continuous polling")
    parser.add_argument("--interval", type=int, default=10, help="Polling interval in seconds for continuous mode")

    args = parser.parse_args()

    worker = RPAClaimWorker(
        base_url=args.url,
        username=args.user,
        password=args.password,
        bot_id=args.bot_id
    )

    if not worker.authenticate():
        print("[FATAL] Could not authenticate with Spring Boot API. Ensure the backend is running.")
        sys.exit(1)

    if args.mode == "batch":
        worker.execute_batch(limit=args.batch_size)
    elif args.mode == "individual":
        pending = worker.fetch_pending_claims(limit=args.batch_size)
        if not pending:
            worker.log("No pending claims found in queue.")
            return
        for c in pending:
            cid = c.get("id")
            worker.process_claim_individually(cid)
            time.sleep(0.5)  # Realistic pacing between bot tasks
    elif args.mode == "continuous":
        worker.log(f"Starting continuous automation daemon (Polling interval: {args.interval}s)...")
        try:
            while True:
                worker.execute_batch(limit=args.batch_size)
                time.sleep(args.interval)
        except KeyboardInterrupt:
            worker.log("Continuous worker halted by operator.")


if __name__ == "__main__":
    main()

