#!/usr/bin/env python
"""Test the evaluation history endpoint with real data."""
import sys
sys.path.insert(0, '.')

from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models import User
from app.api.auth import create_access_token
from app.models.enums import UserRole

def main():
    # Create test client
    client = TestClient(app)
    
    # Check if we have a development user
    db = SessionLocal()
    try:
        dev_user = db.query(User).filter(User.email == 'dev@fraudlens.local').first()
        if not dev_user:
            dev_user = db.query(User).filter(User.role == 'admin').first()
        
        if dev_user:
            token = create_access_token(dev_user.email, UserRole(dev_user.role))
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test the new endpoint
            print("Testing GET /api/transactions/evaluations/history...")
            response = client.get('/api/transactions/evaluations/history?limit=10', headers=headers)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Response received: {len(data)} evaluations")
                if data:
                    first = data[0]
                    print(f"\n✓ First evaluation record:")
                    print(f"  ID: {first.get('id')}")
                    print(f"  Transaction ID: {first.get('transaction_id')}")
                    print(f"  Fraud Probability: {first.get('fraud_probability')}")
                    print(f"  Predicted Label: {first.get('predicted_label')}")
                    print(f"  Model Version: {first.get('model_version')}")
                    print(f"  Threshold Used: {first.get('threshold_used')}")
                    print(f"  Created: {first.get('created_at')}")
                    print("\n✓ REAL DATA TEST PASSED - Backend API returns real evaluation records")
                    return True
                else:
                    print("✗ No data returned")
                    return False
            else:
                print(f"✗ Error: {response.status_code}")
                print(response.text)
                return False
        else:
            print("✗ No user found in database")
            return False
    finally:
        db.close()

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
