#!/usr/bin/env python3
"""
Autonomous RPA Worker: Insurance Claim Processing Automation
Emulates an external Robotic Process Automation (RPA) bot communicating with
the Spring Boot REST API to automate claim intake, validation, OCR document
inspection, anomaly fraud detection, and status reconciliation.
"""

import argparse
import os
import sys
import time
import requests
from datetime import datetime
from typing import Dict, Any, List, Optional

DEFAULT_BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8080")
DEFAULT_BOT_ID = "RPA-ROBOT-01"
DEFAULT_BOT_HOURLY_COST = 4.20  # $/hr bot operational cost


class RPAClaimWorker:
    def __init__(
        self,
        base_url: str = DEFAULT_BACKEND_URL,
        bot_id: str = DEFAULT_BOT_ID,
        bot_hourly_cost: float = DEFAULT_BOT_HOURLY_COST
    ):
        self.base_url = base_url.rstrip("/")
        self.bot_id = bot_id
        self.bot_hourly_cost = bot_hourly_cost
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json"
        })

    def log(self, message: str, level: str = "INFO"):
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{now}] [{self.bot_id}] [{level}] {message}")

    def test_connection(self) -> bool:
        """Verifies connectivity with the Spring Boot backend."""
        url = f"{self.base_url}/api/dashboard/stats"
        self.log(f"Connecting to Spring Boot backend at {url}...")
        try:
            resp = self.session.get(url, timeout=8)
            if resp.status_code == 200:
                self.log("Connection successful. Backend REST API is online.")
                return True
            else:
                self.log(f"Backend returned HTTP {resp.status_code}", level="WARNING")
                return True
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

    def execute_batch(self, limit: int = 10) -> Optional[Dict[str, Any]]:
        """Triggers the batch processing pipeline on the backend."""
        url = f"{self.base_url}/api/rpa/batch"
        payload = {
            "limit": limit,
            "botId": self.bot_id,
            "botHourlyCost": self.bot_hourly_cost
        }
        self.log(f"Triggering automated batch execution pipeline (limit={limit})...")
        start = time.time()
        try:
            resp = self.session.post(url, json=payload, timeout=30)
            elapsed = time.time() - start
            if resp.status_code == 200:
                data = resp.json()
                self.log(
                    f"Batch complete in {elapsed:.2f}s! "
                    f"Processed: {data.get('totalProcessed', 0)} | "
                    f"Approved: {data.get('approvedCount', 0)} | "
                    f"Escalated to Adjuster: {data.get('manualReviewCount', 0)} | "
                    f"RPA Cost: ${data.get('totalRpaCost', 0.0):.2f}"
                )
                return data
            else:
                self.log(f"Batch execution failed: HTTP {resp.status_code} - {resp.text}", level="ERROR")
                return None
        except Exception as e:
            self.log(f"Batch execution error: {e}", level="ERROR")
            return None

    def process_claim_individually(self, claim_id: int) -> Optional[Dict[str, Any]]:
        """Processes a single claim through the 4-stage automated pipeline."""
        url = f"{self.base_url}/api/rpa/process/{claim_id}"
        payload = {
            "botId": self.bot_id,
            "botHourlyCost": self.bot_hourly_cost,
            "simulatedProcessingTimeSeconds": 1.2
        }
        self.log(f"Processing claim ID {claim_id} through OCR & fraud screening...")
        try:
            resp = self.session.post(url, json=payload, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                self.log(
                    f"Claim {claim_id} processed: Status={data.get('status')} | "
                    f"Stage={data.get('stage')} | STP={data.get('straightThroughProcessing')}"
                )
                return data
            else:
                self.log(f"Claim {claim_id} failed: HTTP {resp.status_code}", level="ERROR")
                return None
        except Exception as e:
            self.log(f"Error processing claim {claim_id}: {e}", level="ERROR")
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
    parser.add_argument("--bot-id", default=DEFAULT_BOT_ID, help="RPA Bot Identifier")
    parser.add_argument("--batch-size", type=int, default=15, help="Number of claims to process in batch")
    parser.add_argument("--mode", choices=["batch", "individual", "continuous"], default="batch",
                        help="Processing mode: batch, individual, or continuous polling")
    parser.add_argument("--interval", type=int, default=10, help="Polling interval in seconds for continuous mode")

    args = parser.parse_args()

    worker = RPAClaimWorker(
        base_url=args.url,
        bot_id=args.bot_id
    )

    if not worker.test_connection():
        print("[FATAL] Could not connect to Spring Boot API. Ensure the backend is running.")
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
