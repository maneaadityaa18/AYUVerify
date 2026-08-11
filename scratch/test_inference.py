import os
import sys
import argparse
import time
import json
import torch
import cv2
from ultralytics import YOLO

def main():
    parser = argparse.ArgumentParser(description="AyurVerify YOLOv8n Bounding Box Inference Test Tool")
    parser.add_argument("image_path", type=str, help="Path to input image file")
    parser.add_argument("--weights", type=str, default="runs/ayurverify_yolov8n/weights/best.pt", help="Path to model weights")
    args = parser.parse_args()
    
    workspace = r"d:\AYUVerify"
    img_path = os.path.abspath(args.image_path)
    weights_path = os.path.join(workspace, args.weights)
    inference_test_dir = os.path.join(workspace, "dataset", "inference_test")
    os.makedirs(inference_test_dir, exist_ok=True)
    
    # 1. Check files exist
    if not os.path.exists(img_path):
        print(f"Error: Input image file '{img_path}' does not exist.")
        sys.exit(1)
        
    if not os.path.exists(weights_path):
        print(f"Warning: Custom weights '{weights_path}' not found. Falling back to pre-trained yolov8n.pt...")
        weights_path = "yolov8n.pt"
        
    # 2. Device selection
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    # 3. Load model and run inference
    print(f"Loading weights from: {weights_path}")
    print(f"Selected device:     {device.upper()}")
    model = YOLO(weights_path)
    
    img = cv2.imread(img_path)
    if img is None:
        print(f"Error: Failed to read image using OpenCV: {img_path}")
        sys.exit(1)
        
    img_h, img_w = img.shape[:2]
    
    start_time = time.time()
    results = model(img, device=device, verbose=False)
    inference_time_ms = (time.time() - start_time) * 1000
    
    # 4. Parse Detections
    detections = []
    class_names = {0: "Aloevera", 1: "Amla"}
    
    # Draw colors
    colors = {0: (0, 255, 0), 1: (0, 215, 255)}
    annotated_img = img.copy()
    
    # Check if results has boxes
    if results and len(results[0].boxes) > 0:
        boxes = results[0].boxes
        for box in boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            
            # Bounding box coordinates [x1, y1, x2, y2]
            xyxy = box.xyxy[0].tolist()
            x1, y1, x2, y2 = map(int, xyxy)
            
            # Map class name
            cls_name = class_names.get(cls_id, f"Unknown ({cls_id})")
            
            # Add to list
            detections.append({
                "class_id": cls_id,
                "class_name": cls_name,
                "confidence": round(conf, 4),
                "bbox": {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2
                },
                "normalized_bbox": {
                    "x1": round(x1 / img_w, 4),
                    "y1": round(y1 / img_h, 4),
                    "x2": round(x2 / img_w, 4),
                    "y2": round(y2 / img_h, 4)
                }
            })
            
            # Draw box on annotated image
            color = colors.get(cls_id, (0, 0, 255))
            cv2.rectangle(annotated_img, (x1, y1), (x2, y2), color, 3)
            
            # Label overlay
            text = f"{cls_name} {conf*100:.1f}%"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.8
            thickness = 2
            (text_w, text_h), _ = cv2.getTextSize(text, font, font_scale, thickness)
            cv2.rectangle(annotated_img, (x1, max(0, y1 - text_h - 10)), (x1 + text_w + 10, y1), color, cv2.FILLED)
            cv2.putText(annotated_img, text, (x1 + 5, y1 - 5), font, font_scale, (0, 0, 0), thickness, cv2.LINE_AA)
            
    # 5. Output visualized image
    out_name = f"prediction_{os.path.basename(img_path)}"
    out_path = os.path.join(inference_test_dir, out_name)
    cv2.imwrite(out_path, annotated_img)
    
    # Print JSON output
    output_result = {
        "success": True,
        "detections": detections,
        "inference_time_ms": round(inference_time_ms, 2),
        "device": device,
        "output_visual_path": out_path
    }
    
    print("\n--- INFERENCE RESULTS (JSON) ---")
    print(json.dumps(output_result, indent=2))
    print("---------------------------------")
    print(f"Visual overlay saved to: {out_path}")

if __name__ == '__main__':
    main()
