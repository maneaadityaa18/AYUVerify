import sys
import os
import torch
import torchvision
import ultralytics
import cv2
import psutil
import platform

def run_diagnostics():
    print("=== DEVICE & PORTABLE ML DIAGNOSTICS ===")
    
    # Package Versions
    print("Package Versions:")
    print(f"  Python Version:      {sys.version.split()[0]}")
    print(f"  Platform:            {platform.platform()}")
    print(f"  PyTorch Version:     {torch.__version__}")
    print(f"  Torchvision Version: {torchvision.__version__}")
    print(f"  Ultralytics Version: {ultralytics.__version__}")
    print(f"  OpenCV Version:      {cv2.__version__}")
    
    # RAM memory
    mem = psutil.virtual_memory()
    total_ram_gb = mem.total / (1024**3)
    available_ram_gb = mem.available / (1024**3)
    print(f"  System RAM:          {total_ram_gb:.2f} GB total ({available_ram_gb:.2f} GB available)")
    
    # CPU info
    print("\nCPU Information:")
    print(f"  Processor:           {platform.processor()}")
    print(f"  CPU Count (Logical): {psutil.cpu_count(logical=True)}")
    print(f"  CPU Count (Physical):{psutil.cpu_count(logical=False)}")
    
    # GPU / CUDA info
    cuda_available = torch.cuda.is_available()
    print(f"\nGPU / CUDA Information:")
    print(f"  CUDA Available:      {cuda_available}")
    
    selected_device = "cpu"
    if cuda_available:
        selected_device = "cuda"
        print(f"  CUDA Version:        {torch.version.cuda}")
        gpu_count = torch.cuda.device_count()
        print(f"  GPU Count:           {gpu_count}")
        for i in range(gpu_count):
            name = torch.cuda.get_device_name(i)
            properties = torch.cuda.get_device_properties(i)
            vram_gb = properties.total_memory / (1024**3)
            print(f"  GPU {i}:              {name}")
            print(f"    VRAM:              {vram_gb:.2f} GB")
    else:
        print("  GPU/CUDA Device:     Not Available (Falling back to CPU mode)")
        
    print(f"\nSelected Device for ML Pipeline: {selected_device.upper()}")
    print("=========================================")

if __name__ == '__main__':
    run_diagnostics()
