PrimeOS Python SDK

Install (recommended to use a venv):

python3 -m venv .venv
source .venv/bin/activate
pip install requests
# then use sdk module

Usage example

from primeos_sdk import PrimeOSClient
client = PrimeOSClient(api_url='https://api.primeodontologia.com.br', api_key='...')
client.submit_result({'type':'inference','payload':{'text':'hello from jetson'}})

# call local Clara agent
resp = client.generate_local('http://jetson.local:5000', 'Say hello')
print(resp)
