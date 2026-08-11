import os
import argparse
import torch
from ultralytics import YOLO

def main():
    parser = argparse.ArgumentParser(description="AyurVerify YOLOv8n Object Detection Training Script")
    parser.add_argument("--data", type=str, default="dataset/yolo/data.yaml", help="Path to data.yaml config")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Pretrained model weights or architecture")
    parser.add_argument("--epochs", type=str, default="50", help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size")
    parser.add_argument("--workers", type=int, default=4, help="Number of data loader workers")
    parser.add_argument("--patience", type=int, default=10, help="Early stopping patience epochs")
    parser.add_argument("--device", type=str, default="auto", help="Device (cpu, cuda, or auto)")
    parser.add_argument("--project", type=str, default="runs", help="Project runs directory")
    parser.add_argument("--name", type=str, default="ayurverify_yolov8n", help="Run name")
    
    args = parser.parse_args()
    
    workspace = r"d:\AYUVerify"
    data_path = os.path.join(workspace, args.data)
    epochs_val = int(args.epochs)
    
    print("=== AYURVERIFY YOLOv8n TRAINING PIPELINE ===")
    print(f"Model:       {args.model}")
    print(f"Data YAML:   {data_path}")
    print(f"Epochs:      {epochs_val}")
    print(f"Batch Size:  {args.batch}")
    print(f"Image Size:  {args.imgsz}")
    print(f"Patience:    {args.patience}")
    
    # 1. Device detection
    selected_device = args.device.lower()
    if selected_device == "auto":
        selected_device = "0" if torch.cuda.is_available() else "cpu"
    print(f"Selected Device: {selected_device.upper()}")
    
    # 2. Load model
    print(f"Loading pretrained model: {args.model}...")
    model = YOLO(args.model)
    
    # 3. Train
    print("Starting training...")
    results = model.train(
        data=data_path,
        epochs=epochs_val,
        imgsz=args.imgsz,
        batch=args.batch,
        device=selected_device,
        workers=args.workers,
        patience=args.patience,
        project=os.path.join(workspace, args.project),
        name=args.name,
        exist_ok=True
    )
    
    best_weights_path = os.path.join(workspace, args.project, args.name, "weights", "best.pt")
    print(f"\nTraining session complete.")
    print(f"Best model weights saved to: {best_weights_path}")
    
    # 4. Validation
    print("\nEvaluating model performance...")
    metrics = model.val()
    
    print("\n=== VALIDATION METRICS ===")
    print(f"Precision (B):    {metrics.results_dict.get('metrics/precision(B)', 0.0):.4f}")
    print(f"Recall (B):       {metrics.results_dict.get('metrics/recall(B)', 0.0):.4f}")
    print(f"mAP@50 (B):       {metrics.results_dict.get('metrics/mAP50(B)', 0.0):.4f}")
    print(f"mAP@50-95 (B):    {metrics.results_dict.get('metrics/mAP50-95(B)', 0.0):.4f}")
    
    if epochs_val <= 3:
        print("\nNOTE: Smoke test detected. Validation metrics are not representative of final accuracy.")

if __name__ == '__main__':
    main()
