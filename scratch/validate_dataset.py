import os
import cv2
import hashlib
from collections import Counter

def get_file_hash(filepath):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            hasher.update(chunk)
    return hasher.hexdigest()

def validate():
    workspace = r"d:\AYUVerify"
    yolo_dir = os.path.join(workspace, "dataset", "yolo")
    splits = ["train", "val", "test"]
    classes = ["Aloevera", "Amla"]
    
    print("=== STRENGTHENED DATASET VALIDATION ===")
    
    overall_pass = True
    errors = []
    
    # Track statistics
    split_counts = {s: 0 for s in splits}
    class_split_counts = {s: {c: 0 for c in classes} for s in splits}
    class_counts = Counter()
    unlabeled_images = []
    invalid_labels_count = 0
    valid_labels_count = 0
    
    # Track hashes per split for leakage detection
    split_hashes = {s: {} for s in splits}
    
    # Check data.yaml configuration
    yaml_path = os.path.join(yolo_dir, "data.yaml")
    if not os.path.exists(yaml_path):
        errors.append("data.yaml config file missing from dataset/yolo/")
        overall_pass = False
    else:
        with open(yaml_path, 'r') as yf:
            y_content = yf.read()
            if "D:" in y_content or "d:" in y_content:
                errors.append("data.yaml contains hardcoded absolute Windows drive path (violates portability)")
                overall_pass = False
                
    for s in splits:
        img_dir = os.path.join(yolo_dir, "images", s)
        lbl_dir = os.path.join(yolo_dir, "labels", s)
        
        if not os.path.exists(img_dir) or not os.path.exists(lbl_dir):
            print(f"FAIL: Split directory for '{s}' does not exist.")
            return False
            
        img_files = os.listdir(img_dir)
        split_counts[s] = len(img_files)
        
        for f in img_files:
            if not f.lower().endswith(('.jpg', '.jpeg', '.png')):
                errors.append(f"Invalid image file format in {s}: {f}")
                overall_pass = False
                continue
                
            img_path = os.path.join(img_dir, f)
            lbl_name = os.path.splitext(f)[0] + ".txt"
            lbl_path = os.path.join(lbl_dir, lbl_name)
            
            # Check Image readability & non-zero dimensions
            try:
                img = cv2.imread(img_path)
                if img is None:
                    errors.append(f"Corrupted or unreadable image: {img_path}")
                    overall_pass = False
                    continue
                h, w = img.shape[:2]
                if w <= 0 or h <= 0:
                    errors.append(f"Zero dimensions for image: {img_path}")
                    overall_pass = False
                    continue
            except Exception as e:
                errors.append(f"Error reading image {f}: {str(e)}")
                overall_pass = False
                continue
                
            # Class tracking from filename
            c_name = "Aloevera" if f.startswith("Aloevera_") else "Amla"
            class_counts[c_name] += 1
            class_split_counts[s][c_name] += 1
            
            # Track hash for duplicate/leakage check
            file_hash = get_file_hash(img_path)
            split_hashes[s][file_hash] = f
            
            # Check corresponding label file
            if not os.path.exists(lbl_path):
                unlabeled_images.append(os.path.join(s, f))
                continue
                
            # Check label coordinates and format
            try:
                with open(lbl_path, 'r') as lf:
                    lines = lf.readlines()
                    
                if not lines:
                    errors.append(f"Empty label file (but exists): {lbl_path}")
                    invalid_labels_count += 1
                    overall_pass = False
                    continue
                    
                for line_idx, line in enumerate(lines):
                    parts = line.strip().split()
                    if len(parts) != 5:
                        errors.append(f"Malformed line {line_idx+1} in {lbl_path}: expected 5 values, got {len(parts)}")
                        invalid_labels_count += 1
                        overall_pass = False
                        continue
                        
                    class_id, x_c, y_c, norm_w, norm_h = parts
                    
                    # Check class ID
                    try:
                        cid = int(class_id)
                        if cid not in [0, 1]:
                            errors.append(f"Invalid class ID {cid} in {lbl_path} line {line_idx+1}")
                            invalid_labels_count += 1
                            overall_pass = False
                    except ValueError:
                        errors.append(f"Non-integer class ID in {lbl_path} line {line_idx+1}")
                        invalid_labels_count += 1
                        overall_pass = False
                        
                    # Check coordinates normalization
                    try:
                        vals = [float(x_c), float(y_c), float(norm_w), float(norm_h)]
                        for val in vals:
                            if not (0.0 <= val <= 1.0):
                                errors.append(f"Coordinate out of bounds ({val}) in {lbl_path} line {line_idx+1}")
                                invalid_labels_count += 1
                                overall_pass = False
                        
                        # Width and height > 0
                        if vals[2] <= 0 or vals[3] <= 0:
                            errors.append(f"Zero or negative box width/height in {lbl_path} line {line_idx+1}")
                            invalid_labels_count += 1
                            overall_pass = False
                            
                        # Full-frame overflow check
                        if vals[2] > 0.98 and vals[3] > 0.98:
                            errors.append(f"Unsanitized full-frame bounding box in {lbl_path} line {line_idx+1}")
                            invalid_labels_count += 1
                            overall_pass = False
                            
                    except ValueError:
                        errors.append(f"Non-float coordinate value in {lbl_path} line {line_idx+1}")
                        invalid_labels_count += 1
                        overall_pass = False
                        
                valid_labels_count += 1
            except Exception as e:
                errors.append(f"Error reading label file {lbl_name}: {str(e)}")
                invalid_labels_count += 1
                overall_pass = False
                
    # Check for orphan label files
    for s in splits:
        img_dir = os.path.join(yolo_dir, "images", s)
        lbl_dir = os.path.join(yolo_dir, "labels", s)
        
        lbl_files = os.listdir(lbl_dir)
        for lf in lbl_files:
            img_name = os.path.splitext(lf)[0] + ".jpg"
            possible_imgs = [
                img_name,
                os.path.splitext(lf)[0] + ".jpeg",
                os.path.splitext(lf)[0] + ".png"
            ]
            if not any(os.path.exists(os.path.join(img_dir, pi)) for pi in possible_imgs):
                errors.append(f"Orphan label file found (no corresponding image): {os.path.join(lbl_dir, lf)}")
                overall_pass = False
                
    # Check class existence across splits
    for s in splits:
        for c in classes:
            if class_split_counts[s][c] == 0:
                errors.append(f"Missing class '{c}' in split '{s}'")
                overall_pass = False
                
    # Check for duplicate hashes / leakage between splits
    leakage_groups = []
    for s1 in splits:
        for s2 in splits:
            if s1 >= s2:
                continue
            common_hashes = set(split_hashes[s1].keys()) & set(split_hashes[s2].keys())
            if common_hashes:
                overall_pass = False
                for ch in common_hashes:
                    leakage_groups.append(f"Leakage: {s1}:{split_hashes[s1][ch]} and {s2}:{split_hashes[s2][ch]}")
                    
    # Print Diagnostics Report
    print("\n=== VALIDATION DIAGNOSTICS REPORT ===")
    print("Images per Split & Class:")
    for s in splits:
        print(f"  Split '{s}': Total={split_counts[s]} (Aloevera={class_split_counts[s]['Aloevera']}, Amla={class_split_counts[s]['Amla']})")
        
    print(f"\nLabel Summary:")
    print(f"  Valid Labels:    {valid_labels_count}")
    print(f"  Invalid Labels:  {invalid_labels_count}")
    print(f"  Unlabeled/Review:{len(unlabeled_images)}")
    print(f"  Data Leakage:    {len(leakage_groups)}")
    
    if errors:
        print("\nValidation Errors Identified:")
        for err in errors[:10]:
            print(f"  [ERROR] {err}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more errors.")
            
    print("\n=====================================")
    if overall_pass:
        print("RESULT: PASS")
        return True
    else:
        print("RESULT: FAIL")
        return False

if __name__ == '__main__':
    import sys
    success = validate()
    sys.exit(0 if success else 1)
