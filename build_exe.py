import os
import sys
import subprocess
import PyInstaller.__main__

def build_frontend():
    print("Building frontend...")
    frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend')
    
    npm_cmd = 'npm.cmd' if os.name == 'nt' else 'npm'
    
    # Install dependencies
    subprocess.run([npm_cmd, 'ci'], cwd=frontend_dir, check=True)
    # Build React app
    subprocess.run([npm_cmd, 'run', 'build'], cwd=frontend_dir, check=True)

def package_app(asset_name):
    print(f"Packaging application as {asset_name}...")
    
    # PyInstaller uses ';' on Windows and ':' on Unix for --add-data
    sep = ';' if os.name == 'nt' else ':'
    
    PyInstaller.__main__.run([
        'backend/run.py',
        f'--name={asset_name}',
        '--onefile',
        f'--add-data=frontend/dist{sep}frontend/dist',
        '--clean'
    ])
    
    print(f"Build complete! Binary located in 'dist' directory.")

if __name__ == "__main__":
    build_frontend()
    
    # Allow overriding output name via command line arg
    asset_name = sys.argv[1] if len(sys.argv) > 1 else 'SystemMonitor'
    package_app(asset_name)
