"""PrimeOS Python SDK - minimal helpers for agents and backend interaction

Usage:
from primeos_sdk import PrimeOSClient
c = PrimeOSClient(api_url='https://api.primeodontologia.com.br', api_key='...')
c.submit_result({'foo': 'bar'})

c.generate_local('http://jetson.local:5000', 'Hello')
"""
import os
import requests

class PrimeOSClient:
    def __init__(self, api_url=None, api_key=None, timeout=30):
        self.api_url = api_url or os.environ.get('PRIMEOS_API_URL', 'http://localhost:3000')
        self.api_key = api_key or os.environ.get('PRIMEOS_API_KEY')
        self.timeout = timeout
        if not self.api_key:
            print('Warning: PRIMEOS_API_KEY not provided; agent endpoints may be rejected')

    def submit_result(self, payload):
        url = f"{self.api_url.rstrip('/')}/agent/submit"
        headers = {'Content-Type': 'application/json', 'x-primeos-key': self.api_key or ''}
        r = requests.post(url, json=payload, headers=headers, timeout=self.timeout)
        r.raise_for_status()
        return r.json()

    def generate_local(self, agent_base_url, prompt, max_tokens=512):
        url = f"{agent_base_url.rstrip('/')}/generate"
        r = requests.post(url, json={'prompt': prompt, 'max_tokens': max_tokens}, timeout=self.timeout)
        r.raise_for_status()
        return r.json()

    def push_and_log(self, payload):
        r = self.submit_result(payload)
        print('submitted:', r)
        return r
