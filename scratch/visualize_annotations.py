import os
import cv2
import json

def draw_yolo_boxes(img, boxes, class_names, border_color=None):
    h, w = img.shape[:2]
    annotated = img.copy()
    
    # Standard colors
    colors = {0: (0, 255, 0), 1: (0, 215, 255)} # Green for Aloevera, Orange-Yellow for Amla
    
    for box in boxes:
        class_id, x_c, y_c, norm_w, norm_h = box
        class_id = int(class_id)
        
        # Convert to absolute pixels
        x_center = x_c * w
        y_center = y_c * h
        width = norm_w * w
        height = norm_h * h
        
        x_min = max(0, int(x_center - width / 2.0))
        y_min = max(0, int(y_center - height / 2.0))
        x_max = min(w - 1, int(x_center + width / 2.0))
        y_max = min(h - 1, int(y_center + height / 2.0))
        
        color = border_color if border_color is not None else colors.get(class_id, (0, 0, 255))
        c_name = class_names.get(class_id, f"Class {class_id}")
        
        # Draw box
        cv2.rectangle(annotated, (x_min, y_min), (x_max, y_max), color, 3)
        
        # Draw label
        text = f"{c_name}"
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.8
        thickness = 2
        (text_w, text_h), _ = cv2.getTextSize(text, font, font_scale, thickness)
        
        bg_y1 = max(0, y_min - text_h - 10)
        bg_y2 = y_min
        
        cv2.rectangle(annotated, (x_min, bg_y1), (x_min + text_w + 10, bg_y2), color, cv2.FILLED)
        cv2.putText(annotated, text, (x_min + 5, y_min - 5), font, font_scale, (0, 0, 0), thickness, cv2.LINE_AA)
        
    return annotated

def generate_visualizations():
    workspace = r"d:\AYUVerify"
    yolo_dir = os.path.join(workspace, "dataset", "yolo")
    processed_dir = os.path.join(workspace, "dataset", "processed")
    
    verify_annotations_dir = os.path.join(workspace, "dataset", "verification", "annotations")
    verify_suspicious_dir = os.path.join(workspace, "dataset", "verification", "suspicious")
    
    os.makedirs(verify_annotations_dir, exist_ok=True)
    os.makedirs(verify_suspicious_dir, exist_ok=True)
    
    class_names = {0: "Aloevera", 1: "Amla"}
    
    # 1. Visualize clean/valid images from splits
    print("=== VISUALIZING DRAFT LABELS ===")
    splits = ["train", "val", "test"]
    classes = ["Aloevera", "Amla"]
    rendered_split_count = 0
    
    if os.path.exists(yolo_dir):
        for s in splits:
            img_dir = os.path.join(yolo_dir, "images", s)
            lbl_dir = os.path.join(yolo_dir, "labels", s)
            
            if not os.path.exists(img_dir):
                continue
                
            img_files = os.listdir(img_dir)
            for c in classes:
                # Find first 2 images of this class in this split with labels
                found_count = 0
                for f in img_files:
                    if f.startswith(f"{c}_"):
                        lbl_name = os.path.splitext(f)[0] + ".txt"
                        lbl_path = os.path.join(lbl_dir, lbl_name)
                        if os.path.exists(lbl_path):
                            # Read image and label
                            img = cv2.imread(os.path.join(img_dir, f))
                            if img is None:
                                continue
                            
                            boxes = []
                            with open(lbl_path, 'r') as lf:
                                for line in lf:
                                    parts = line.strip().split()
                                    if len(parts) == 5:
                                        boxes.append(list(map(float, parts)))
                                        
                            annotated_img = draw_yolo_boxes(img, boxes, class_names)
                            out_name = f"verify_{c}_{s}_{found_count + 1}.jpg"
                            cv2.imwrite(os.path.join(verify_annotations_dir, out_name), annotated_img)
                            found_count += 1
                            rendered_split_count += 1
                            if found_count >= 2:
                                break
                                
        print(f"  Generated {rendered_split_count} visual samples in: {verify_annotations_dir}")
    else:
        print("  Skipping splits visualization (split_dataset.py has not been run yet).")
        
    # 2. Visualize suspicious/flagged images
    print("=== VISUALIZING SUSPICIOUS DRAFT LABELS ===")
    review_json_path = os.path.join(processed_dir, "manual_review.json")
    rendered_suspicious_count = 0
    
    if os.path.exists(review_json_path):
        with open(review_json_path, 'r') as jf:
            review_list = json.load(jf)
            
        # Draw visual overlays for suspicious images to inspect why they failed
        for item in review_list:
            img_rel = item["image_path"]
            img_path = os.path.join(workspace, img_rel.replace("/", os.sep))
            
            if not os.path.exists(img_path):
                # Try relative to processed_dir
                img_path = os.path.join(processed_dir, os.path.basename(img_rel))
                if not os.path.exists(img_path):
                    continue
                
            img = cv2.imread(img_path)
            if img is None:
                continue
                
            cls_name = item.get("expected_class") or item.get("class", "Unknown")
            draft_box = item.get("draft_annotation")
            
            h, w = img.shape[:2]
            if draft_box:
                annotated_img = draw_yolo_boxes(img, [draft_box], class_names, border_color=(0, 0, 255))
            else:
                annotated_img = img.copy()
                cv2.rectangle(annotated_img, (5, 5), (w - 5, h - 5), (0, 0, 255), 4)
                
            reason_text = item.get("reason", "Needs manual review")
            cv2.putText(annotated_img, f"FLAGGED: {reason_text[:60]}", (10, h - 15), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1, cv2.LINE_AA)
                        
            out_name = f"suspicious_{cls_name}_{os.path.basename(img_path)}"
            cv2.imwrite(os.path.join(verify_suspicious_dir, out_name), annotated_img)
            rendered_suspicious_count += 1
            if rendered_suspicious_count >= 15:
                break
                
        print(f"  Generated {rendered_suspicious_count} suspicious visual samples in: {verify_suspicious_dir}")
    else:
        print("  Skipping suspicious visualization (manual_review.json not found).")

if __name__ == '__main__':
    generate_visualizations()
