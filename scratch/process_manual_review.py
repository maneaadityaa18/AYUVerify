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
    x_center = max(0.0, min(1.0, x_center))
    y_center = max(0.0, min(1.0, y_center))
    norm_w = max(0.0, min(1.0, norm_w))
    norm_h = max(0.0, min(1.0, norm_h))
    return [round(x_center, 6), round(y_center, 6), round(norm_w, 6), round(norm_h, 6)]

def process_review_images():
    workspace = r"d:\AYUVerify"
    processed_dir = os.path.join(workspace, "dataset", "processed")
    labels_base_dir = os.path.join(processed_dir, "labels")
    manual_review_dir = os.path.join(workspace, "dataset", "manual_review")
    
    audit_json_path = os.path.join(processed_dir, "annotation_audit.json")
    review_json_path = os.path.join(processed_dir, "manual_review.json")
    meta_json_path = os.path.join(processed_dir, "annotations_metadata.json")
    
    if not os.path.exists(review_json_path):
        print("Error: manual_review.json not found.")
        return
        
    with open(review_json_path, 'r') as f:
        review_items = json.load(f)
        
    with open(audit_json_path, 'r') as f:
        audit_records = json.load(f)
        
    audit_dict = {r["image"]: r for r in audit_records}
    
    print(f"=== INSPECTING & REFINING {len(review_items)} REVIEW IMAGES ===")
    
    class_mapping = {"Aloevera": 0, "Amla": 1}
    
    resolved_count = 0
    rejected_count = 0
    unresolved_count = 0
    
    remaining_manual_review = []
    
    # Process each review image
    for item in review_items:
        img_rel = item["image_path"] # e.g. dataset/processed/Aloevera/174.jpg
        c_name = item.get("expected_class") or item.get("class")
        class_id = class_mapping[c_name]
        
        # Absolute image path
        img_path = os.path.join(workspace, img_rel.replace("/", os.sep))
        if not os.path.exists(img_path):
            img_path = os.path.join(processed_dir, c_name, os.path.basename(img_rel))
            
        if not os.path.exists(img_path):
            print(f"  Warning: Image file not found: {img_path}")
            continue
            
        img = cv2.imread(img_path)
        if img is None:
            audit_dict[img_rel] = {
                "image": img_rel,
                "expected_class": c_name,
                "class_id": class_id,
                "status": "REJECT",
                "bbox": None,
                "reason": "Corrupt or unreadable image file",
                "confidence": 0.0
            }
            rejected_count += 1
            continue
            
        img_h, img_w = img.shape[:2]
        img_area = img_w * img_h
        
        # 1. Background Suppression Segmentation
        # Strict HSV green/yellow-green plant mask excluding blue/grey cloth background
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        
        # Target green range: H [28, 85], S [35, 255], V [35, 255]
        lower_green_hsv = np.array([28, 35, 35], dtype=np.uint8)
        upper_green_hsv = np.array([85, 255, 255], dtype=np.uint8)
        mask_hsv = cv2.inRange(hsv, lower_green_hsv, upper_green_hsv)
        
        # LAB A channel mask for green: A channel < 122
        mask_lab_a = (lab[:, :, 1] < 122).astype(np.uint8) * 255
        
        # Combine masks
        mask = cv2.bitwise_and(mask_hsv, mask_lab_a)
        
        # Morphological clean up
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        valid_boxes = []
        total_target_area = 0
        
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < (img_area * 0.015): # Ignore small noise
                continue
                
            x, y, w, h = cv2.boundingRect(cnt)
            norm_w = w / img_w
            norm_h = h / img_h
            
            # Check bounding box bounds: exclude background overflow boxes
            if norm_w > 0.88 and norm_h > 0.88:
                continue
                
            if norm_w < 0.02 or norm_h < 0.02:
                continue
                
            hull = cv2.convexHull(cnt)
            hull_area = cv2.contourArea(hull)
            solidity = (area / hull_area) if hull_area > 0 else 0
            
            if solidity < 0.20: # Fragmented noise
                continue
                
            bbox_yolo = get_yolo_coords(x, y, w, h, img_w, img_h)
            valid_boxes.append(bbox_yolo)
            total_target_area += area
            
        target_fraction = total_target_area / img_area
        
        # Decision logic for review resolution
        filename_base = os.path.splitext(os.path.basename(img_path))[0]
        label_dir = os.path.join(labels_base_dir, c_name)
        os.makedirs(label_dir, exist_ok=True)
        label_path = os.path.join(label_dir, f"{filename_base}.txt")
        
        if valid_boxes and target_fraction >= 0.02:
            # Successfully resolved with tight bounding box(es)!
            with open(label_path, 'w') as lf:
                for box in valid_boxes:
                    x_c, y_c, norm_w, norm_h = box
                    lf.write(f"{class_id} {x_c:.6f} {y_c:.6f} {norm_w:.6f} {norm_h:.6f}\n")
                    
            conf_score = round(min(0.95, max(0.70, float(0.6 + target_fraction * 0.4))), 4)
            audit_dict[img_rel] = {
                "image": img_rel,
                "expected_class": c_name,
                "class_id": class_id,
                "status": "VALID_REFINED",
                "bbox": valid_boxes[0],
                "reason": f"Refined via background suppression (isolated {len(valid_boxes)} target box(es))",
                "confidence": conf_score
            }
            resolved_count += 1
            # Remove from manual review image folder if resolved
            mr_copy_path = os.path.join(manual_review_dir, f"{c_name}_{os.path.basename(img_path)}")
            if os.path.exists(mr_copy_path):
                os.remove(mr_copy_path)
                
        elif target_fraction < 0.005:
            # Target object is genuinely absent or image is unusable background
            if os.path.exists(label_path):
                os.remove(label_path)
                
            audit_dict[img_rel] = {
                "image": img_rel,
                "expected_class": c_name,
                "class_id": class_id,
                "status": "REJECT",
                "bbox": None,
                "reason": "Target object genuinely absent or image quality unusable for object detection",
                "confidence": 0.0
            }
            rejected_count += 1
            mr_copy_path = os.path.join(manual_review_dir, f"{c_name}_{os.path.basename(img_path)}")
            if os.path.exists(mr_copy_path):
                os.remove(mr_copy_path)
        else:
            # Visible target but requires human polygon drawing -> keep in NEEDS_REVIEW
            if os.path.exists(label_path):
                os.remove(label_path)
                
            reason_msg = "Target object visible but requires manual polygon drawing to separate from complex background"
            audit_dict[img_rel] = {
                "image": img_rel,
                "expected_class": c_name,
                "class_id": class_id,
                "status": "NEEDS_REVIEW",
                "bbox": None,
                "reason": reason_msg,
                "confidence": 0.0
            }
            remaining_manual_review.append({
                "image_path": img_rel,
                "expected_class": c_name,
                "class_id": class_id,
                "reason": reason_msg,
                "draft_annotation": None
            })
            unresolved_count += 1
            
    # Write back updated audit records
    updated_audit_list = list(audit_dict.values())
    with open(audit_json_path, 'w') as f:
        json.dump(updated_audit_list, f, indent=2)
        
    # Write back updated manual review JSON
    with open(review_json_path, 'w') as f:
        json.dump(remaining_manual_review, f, indent=2)
        
    # Write back metadata JSON
    meta_dict = {}
    for r in updated_audit_list:
        if r["status"] in ["VALID_AUTO", "VALID_REFINED"]:
            meta_dict[r["image"]] = {
                "status": r["status"],
                "confidence": r["confidence"],
                "review_required": False
            }
        else:
            meta_dict[r["image"]] = {
                "status": r["status"],
                "confidence": r["confidence"],
                "review_required": True,
                "reason": r["reason"]
            }
    with open(meta_json_path, 'w') as f:
        json.dump(meta_dict, f, indent=2)
        
    print(f"\n--- MANUAL REVIEW RESOLUTION SUMMARY ---")
    print(f"Total Reviewed:            {len(review_items)}")
    print(f"VALID_REFINED (Annotated): {resolved_count}")
    print(f"REJECTED (Unusable/Absent):{rejected_count}")
    print(f"UNRESOLVED (Needs Human):  {unresolved_count}")
    print(f"Audit log updated:         {audit_json_path}")
    print(f"Manual review log updated: {review_json_path}")

if __name__ == '__main__':
    process_review_images()
