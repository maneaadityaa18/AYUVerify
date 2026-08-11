import os
import cv2
import json
import csv
import shutil
import numpy as np

def get_yolo_coords(x, y, w, h, img_w, img_h):
    x_center = (x + w / 2.0) / img_w
    y_center = (y + h / 2.0) / img_h
    norm_w = w / img_w
    norm_h = h / img_h
    # Clamp coordinates to [0.0, 1.0]
    x_center = max(0.0, min(1.0, x_center))
    y_center = max(0.0, min(1.0, y_center))
    norm_w = max(0.0, min(1.0, norm_w))
    norm_h = max(0.0, min(1.0, norm_h))
    return [round(x_center, 6), round(y_center, 6), round(norm_w, 6), round(norm_h, 6)]

def annotate_and_audit():
    workspace = r"d:\AYUVerify"
    processed_dir = os.path.join(workspace, "dataset", "processed")
    labels_base_dir = os.path.join(processed_dir, "labels")
    manual_review_dir = os.path.join(workspace, "dataset", "manual_review")
    
    # Initialize labels and manual_review directories
    if os.path.exists(labels_base_dir):
        shutil.rmtree(labels_base_dir)
    os.makedirs(labels_base_dir, exist_ok=True)
    
    if os.path.exists(manual_review_dir):
        shutil.rmtree(manual_review_dir)
    os.makedirs(manual_review_dir, exist_ok=True)
    
    classes = ["Aloevera", "Amla"]
    class_mapping = {"Aloevera": 0, "Amla": 1}
    
    audit_records = []
    annotations_metadata = {}
    manual_review_list = []
    
    # Color Threshold Ranges
    # HSV: Hue (20-95 for green/yellow-green), Saturation (25-255), Value (20-255)
    lower_hsv = np.array([20, 25, 20], dtype=np.uint8)
    upper_hsv = np.array([95, 255, 255], dtype=np.uint8)
    
    # LAB: L (30-230), A (0-124 for green hues), B (125-225 for yellow/green)
    lower_lab = np.array([30, 0, 125], dtype=np.uint8)
    upper_lab = np.array([230, 124, 225], dtype=np.uint8)
    
    total_valid_auto = 0
    total_needs_review = 0
    total_reject = 0
    
    print("=== REFINED HSV+LAB MULTI-SPACE ANNOTATION & AUDIT ===")
    
    for c in classes:
        class_images_dir = os.path.join(processed_dir, c)
        class_labels_dir = os.path.join(labels_base_dir, c)
        os.makedirs(class_labels_dir, exist_ok=True)
        
        if not os.path.exists(class_images_dir):
            continue
            
        print(f"Auditing & annotating class: {c}")
        class_id = class_mapping[c]
        
        files = os.listdir(class_images_dir)
        for f in files:
            if not f.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
                
            img_path = os.path.join(class_images_dir, f)
            rel_img_path = os.path.join("dataset", "processed", c, f).replace("\\", "/")
            img = cv2.imread(img_path)
            
            if img is None:
                audit_records.append({
                    "image": rel_img_path,
                    "expected_class": c,
                    "class_id": class_id,
                    "status": "REJECT",
                    "bbox": None,
                    "reason": "Corrupt or unreadable image file",
                    "confidence": 0.0
                })
                total_reject += 1
                continue
                
            img_h, img_w = img.shape[:2]
            img_area = img_w * img_h
            
            # 1. Multi-space color segmentation
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            
            mask_hsv = cv2.inRange(hsv, lower_hsv, upper_hsv)
            mask_lab = cv2.inRange(lab, lower_lab, upper_lab)
            
            # Combined mask (union of HSV and LAB segmentation)
            combined_mask = cv2.bitwise_or(mask_hsv, mask_lab)
            
            # Adaptive Morphological filtering
            k_size = max(5, int(min(img_w, img_h) * 0.04))
            if k_size % 2 == 0:
                k_size += 1
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k_size, k_size))
            
            mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
            
            # Find contours
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Multi-candidate contour scoring
            best_contour = None
            best_score = -1.0
            best_bbox = None
            
            for cnt in contours:
                area = cv2.contourArea(cnt)
                if area < (img_area * 0.01): # Skip minor noise
                    continue
                    
                x, y, w, h = cv2.boundingRect(cnt)
                hull = cv2.convexHull(cnt)
                hull_area = cv2.contourArea(hull)
                solidity = (area / hull_area) if hull_area > 0 else 0
                aspect_ratio = float(w) / h if h > 0 else 0
                area_fraction = area / img_area
                
                # Class-specific candidate scoring
                score = area_fraction * 0.5 + solidity * 0.5
                if c == "Aloevera":
                    # Aloevera leaves often have distinct aspect ratios or prominent areas
                    if aspect_ratio > 0.3 and aspect_ratio < 3.5:
                        score += 0.2
                elif c == "Amla":
                    # Amla fruits/leaves are generally more compact or clustered
                    if solidity > 0.4:
                        score += 0.2
                        
                if score > best_score:
                    best_score = score
                    best_contour = cnt
                    best_bbox = (x, y, w, h)
                    
            # Audit Evaluations
            if best_contour is None:
                reason = "No significant target region detected by multi-space segmentation"
                audit_records.append({
                    "image": rel_img_path,
                    "expected_class": c,
                    "class_id": class_id,
                    "status": "NEEDS_REVIEW",
                    "bbox": None,
                    "reason": reason,
                    "confidence": 0.0
                })
                manual_review_list.append({
                    "image_path": rel_img_path,
                    "expected_class": c,
                    "class_id": class_id,
                    "reason": reason,
                    "draft_annotation": None
                })
                shutil.copy2(img_path, os.path.join(manual_review_dir, f"{c}_{f}"))
                total_needs_review += 1
                continue
                
            x, y, w, h = best_bbox
            bbox_yolo = get_yolo_coords(x, y, w, h, img_w, img_h)
            x_c, y_c, norm_w, norm_h = bbox_yolo
            
            # Check 1: Full-image background overflow (>90% width and height)
            if norm_w > 0.90 and norm_h > 0.90:
                reason = f"Full-image background overflow: box covers {norm_w*100:.1f}% width and {norm_h*100:.1f}% height"
                audit_records.append({
                    "image": rel_img_path,
                    "expected_class": c,
                    "class_id": class_id,
                    "status": "NEEDS_REVIEW",
                    "bbox": bbox_yolo,
                    "reason": reason,
                    "confidence": round(float(best_score), 4)
                })
                manual_review_list.append({
                    "image_path": rel_img_path,
                    "expected_class": c,
                    "class_id": class_id,
                    "reason": reason,
                    "draft_annotation": [class_id, x_c, y_c, norm_w, norm_h]
                })
                shutil.copy2(img_path, os.path.join(manual_review_dir, f"{c}_{f}"))
                total_needs_review += 1
                continue
                
            # Check 2: Bounding box is extremely tiny (<1.5% size)
            if norm_w < 0.015 or norm_h < 0.015:
                reason = f"Bounding box is too small: norm_w={norm_w:.4f}, norm_h={norm_h:.4f}"
                audit_records.append({
                    "image": rel_img_path,
                    "expected_class": c,
                    "class_id": class_id,
                    "status": "NEEDS_REVIEW",
                    "bbox": bbox_yolo,
                    "reason": reason,
                    "confidence": round(float(best_score), 4)
                })
                manual_review_list.append({
                    "image_path": rel_img_path,
                    "expected_class": c,
                    "class_id": class_id,
                    "reason": reason,
                    "draft_annotation": [class_id, x_c, y_c, norm_w, norm_h]
                })
                shutil.copy2(img_path, os.path.join(manual_review_dir, f"{c}_{f}"))
                total_needs_review += 1
                continue
                
            # Check 3: Low candidate confidence / solidity
            if best_score < 0.15:
                reason = f"Low multi-candidate segmentation confidence ({best_score:.3f})"
                audit_records.append({
                    "image": rel_img_path,
                    "expected_class": c,
                    "class_id": class_id,
                    "status": "NEEDS_REVIEW",
                    "bbox": bbox_yolo,
                    "reason": reason,
                    "confidence": round(float(best_score), 4)
                })
                manual_review_list.append({
                    "image_path": rel_img_path,
                    "expected_class": c,
                    "class_id": class_id,
                    "reason": reason,
                    "draft_annotation": [class_id, x_c, y_c, norm_w, norm_h]
                })
                shutil.copy2(img_path, os.path.join(manual_review_dir, f"{c}_{f}"))
                total_needs_review += 1
                continue
                
            # Passed all audits -> VALID_AUTO
            label_name = os.path.splitext(f)[0] + ".txt"
            label_path = os.path.join(class_labels_dir, label_name)
            
            with open(label_path, 'w') as lf:
                lf.write(f"{class_id} {x_c:.6f} {y_c:.6f} {norm_w:.6f} {norm_h:.6f}\n")
                
            conf_score = min(0.98, max(0.65, float(best_score * 0.6 + 0.35)))
            audit_records.append({
                "image": rel_img_path,
                "expected_class": c,
                "class_id": class_id,
                "status": "VALID_AUTO",
                "bbox": bbox_yolo,
                "reason": "Passed multi-candidate HSV+LAB saliency and geometry audits",
                "confidence": round(conf_score, 4)
            })
            
            annotations_metadata[rel_img_path] = {
                "status": "AUTO_GENERATED",
                "confidence": round(conf_score, 4),
                "review_required": False
            }
            total_valid_auto += 1
            
    # Write annotation audit JSON
    audit_json_path = os.path.join(processed_dir, "annotation_audit.json")
    with open(audit_json_path, 'w') as jf:
        json.dump(audit_records, jf, indent=2)
        
    # Write manual review list JSON
    manual_json_path = os.path.join(processed_dir, "manual_review.json")
    with open(manual_json_path, 'w') as jf:
        json.dump(manual_review_list, jf, indent=2)
        
    # Write metadata JSON
    with open(os.path.join(processed_dir, "annotations_metadata.json"), 'w') as jf:
        json.dump(annotations_metadata, jf, indent=2)
        
    print(f"\n--- AUDIT & ANNOTATION REPORT ---")
    print(f"Total Images Audited:   {len(audit_records)}")
    print(f"VALID_AUTO Labels:      {total_valid_auto}")
    print(f"NEEDS_REVIEW Flagged:   {total_needs_review}")
    print(f"REJECT (Corrupt):       {total_reject}")
    print(f"Audit log saved to:    {audit_json_path}")
    print(f"Manual review images:   {manual_review_dir}")

if __name__ == '__main__':
    annotate_and_audit()
