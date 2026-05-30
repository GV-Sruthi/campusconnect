#!/usr/bin/env python3
"""
NotesNest Complete Setup Script
Run this from the project root to set up everything
"""

import subprocess
import os
import sys
from pathlib import Path

def run_command(command, cwd=None, description=""):
    """Run a shell command and return success status"""
    print(f"\n{'='*60}")
    if description:
        print(f"  {description}")
    print(f"  Running: {command}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=False)
        return result.returncode == 0
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    project_root = Path(__file__).parent.resolve()
    backend_dir = project_root / "backend"
    frontend_dir = project_root / "frontend"

    print("\n" + "="*60)
    print("  🚀 NotesNest Complete Setup")
    print("="*60)

    # Step 1: Backend setup
    print("\n📦 STEP 1: Setting up Backend...")
    
    if run_command(f"npm install", cwd=backend_dir, description="Installing backend dependencies"):
        print("✅ Backend dependencies installed")
    else:
        print("❌ Backend dependency installation failed")
        return False

    if run_command(f"node _setup.js", cwd=backend_dir, description="Creating backend files"):
        print("✅ Backend files created")
    else:
        print("❌ Backend file creation failed")
        return False

    # Step 2: Frontend setup
    print("\n📦 STEP 2: Setting up Frontend...")
    
    if run_command(f"npm install", cwd=frontend_dir, description="Installing frontend dependencies"):
        print("✅ Frontend dependencies installed")
    else:
        print("❌ Frontend dependency installation failed")
        return False

    if run_command(f"python setup_frontend.py", cwd=frontend_dir, description="Creating frontend files"):
        print("✅ Frontend files created")
    else:
        print("❌ Frontend file creation failed")
        return False

    # Step 3: Summary
    print("\n" + "="*60)
    print("  ✅ SETUP COMPLETE!")
    print("="*60)

    print("\n📝 Next Steps:")
    print("\n1. Configure .env files:")
    print(f"   Backend:  {backend_dir}/.env")
    print(f"   Frontend: {frontend_dir}/.env")
    
    print("\n2. Start MongoDB:")
    print("   mongod")
    
    print("\n3. Start Backend (from backend directory):")
    print("   npm run dev")
    
    print("\n4. Start Frontend (from frontend directory):")
    print("   npm run dev")
    
    print("\n5. Access the app at:")
    print("   Frontend: http://localhost:5173")
    print("   Backend:  http://localhost:5000")
    
    print("\n6. Seed database (optional):")
    print("   cd backend && npm run seed")
    
    print("\n📚 Documentation:")
    print(f"   See README.md at {project_root}")

    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
