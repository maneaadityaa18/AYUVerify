# AyurVerify — Machine Learning Environment & YOLOv8n Setup Guide

This document details the hardware environment, software dependencies, and device-independent training execution commands for training the **3-class MPBD-18 YOLOv8n model** (**Ashwagandha**, **Tulshi**, and **Bel**).

---

## 💻 Hardware & Software Environment

### Host Machine Specifications (Current Setup):
- **OS:** Windows (AMD64)
- **Python Version:** Python 3.13.5
- **Virtual Environment:** `d:\AYUVerify\backend\.venv`
- **Core Frameworks:**
  - `torch`: 2.13.0+cpu
  - `torchvision`: 0.28.0+cpu
  - `ultralytics`: 8.4.117
  - `opencv-python`: 4.11.0
  - `Pillow`: 11.1.0
- **Compute Acceleration Mode:** CPU Host Mode (Used for dataset auditing, automated annotation, dataset validation, and lightweight CPU smoke testing).

---

## 🚀 Device-Independent Training Architecture

The training scripts in `scratch/train_yolo_mpbd18.py` are strictly device-agnostic. Commands accept CLI flags so execution adapts seamlessly between CPU hosts and NVIDIA GPU machines without code modification.

### Key Configurable CLI Arguments:
- `--data`: Path to dataset config file (`dataset/yolo_mpbd18/data.yaml`)
- `--model`: Base weights initialization (default: `yolov8n.pt`)
- `--epochs`: Number of training epochs
- `--batch`: Batch size (e.g., 8 on CPU, 16/32 on GPU)
- `--imgsz`: Input image size (default: 640)
- `--patience`: Early stopping patience epochs
- `--device`: Target compute device (`cpu` for CPU, `0` or `cuda` for NVIDIA GPU)
- `--project`: Output runs directory

---

## ⚡ Execution Commands

### 1. Lightweight CPU Smoke Test (Current Machine)
To verify dataset loading, label parsing, loss computation, validation, and weight generation without long CPU wait times:
```powershell
& "d:\AYUVerify\backend\.venv\Scripts\python.exe" scratch/train_yolo_mpbd18.py --data dataset/yolo_mpbd18/data.yaml --model yolov8n.pt --epochs 2 --batch 8 --imgsz 640 --device cpu --name mpbd18_smoke_test
```

### 2. High-Performance GPU Training (Target NVIDIA RTX 2050 / CUDA Machine)
When deploying to an NVIDIA CUDA-enabled GPU machine:

1. **Install CUDA-enabled PyTorch** (if not already installed):
   ```bash
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
   ```

2. **Run Production Training**:
   ```bash
   python scratch/train_yolo_mpbd18.py --data dataset/yolo_mpbd18/data.yaml --model yolov8n.pt --epochs 50 --batch 16 --imgsz 640 --patience 10 --device 0 --name ayurverify_mpbd18_3class
   ```

---

## 📁 Portable Dataset & Model Weights Structure
- **Dataset YAML:** [dataset/yolo_mpbd18/data.yaml](file:///d:/AYUVerify/dataset/yolo_mpbd18/data.yaml)
- **Trained Model Output Directory:** `runs/ayurverify_mpbd18_3class/weights/best.pt`
