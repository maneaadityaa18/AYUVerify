import os
import shutil
import random
import json

def get_group_name(filename, class_name):
    base, ext = os.path.splitext(filename)
    if base.lower().startswith("frame"):
        return f"{class_name}_frame_seq"
    
    # Purely numeric check for grouped splits
    if base.isdigit():
        num = int(base)
        if class_name == "Aloevera":
            if num >= 4000:
                return "Aloevera_4xxx"
            elif num >= 800:
                return "Aloevera_8xx"
            else:
                return "Aloevera_short"
        elif class_name == "Amla":
            if num >= 1000:
                return "Amla_13xx"
            else:
                return "Amla_3xx_4xx"
                
    return f"{class_name}_other"

def split_data():
    workspace = r"d:\AYUVerify"
    processed_dir = os.path.join(workspace, "dataset", "processed")
    labels_dir = os.path.join(processed_dir, "labels")
    yolo_dir = os.path.join(workspace, "dataset", "yolo")
    audit_json_path = os.path.join(processed_dir, "annotation_audit.json")
    
    # Load audit records to filter out REJECT images
    rejected_rel_paths = set()
    if os.path.exists(audit_json_path):
        with open(audit_json_path, 'r') as f:
            audit_records = json.load(f)
            for r in audit_records:
                if r.get("status") == "REJECT":
                    rejected_rel_paths.add(r["image"])
                    
    print(f"Loaded audit records: Excluding {len(rejected_rel_paths)} REJECTED images from YOLO training splits.")
    
    classes = ["Aloevera", "Amla"]
    splits = ["train", "val", "test"]
    
    # Clear existing YOLO folder to ensure clean state
    if os.path.exists(yolo_dir):
        print(f"Clearing existing YOLO directory: {yolo_dir}")
        shutil.rmtree(yolo_dir)
        
    # Re-initialize directories
    for s in splits:
        os.makedirs(os.path.join(yolo_dir, "images", s), exist_ok=True)
        os.makedirs(os.path.join(yolo_dir, "labels", s), exist_ok=True)
        
    # Create portable data.yaml config (relative path from project root)
    data_yaml_path = os.path.join(yolo_dir, "data.yaml")
    data_yaml_content = """path: dataset/yolo
train: images/train
val: images/val
test: images/test

names:
  0: Aloevera
  1: Amla
"""
    with open(data_yaml_path, "w") as f:
        f.write(data_yaml_content)
    print(f"Created portable data.yaml config at: {data_yaml_path}")
        
    random.seed(42) # Deterministic split
    
    print("=== GROUPED DATASET SPLIT (VALID ANNOTATIONS ONLY) ===")
    
    split_info = {
        "train": {"total": 0, "Aloevera": 0, "Amla": 0},
        "val": {"total": 0, "Aloevera": 0, "Amla": 0},
        "test": {"total": 0, "Aloevera": 0, "Amla": 0}
    }
    
    for c in classes:
        class_img_dir = os.path.join(processed_dir, c)
        class_lbl_dir = os.path.join(labels_dir, c)
        
        if not os.path.exists(class_img_dir):
            continue
            
        all_files = [f for f in os.listdir(class_img_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        # Filter out rejected images
        valid_files = []
        for f in all_files:
            rel_p = f"dataset/processed/{c}/{f}".replace("\\", "/")
            if rel_p not in rejected_rel_paths:
                valid_files.append(f)
                
        print(f"\nClass: {c}")
        print(f"  Total processed files: {len(all_files)}")
        print(f"  Valid annotated files for split: {len(valid_files)}")
        
        # Group files
        groups = {}
        for f in valid_files:
            g_name = get_group_name(f, c)
            if g_name not in groups:
                groups[g_name] = []
            groups[g_name].append(f)
            
        print("Groups identified:")
        for g_name, g_files in groups.items():
            print(f"  - {g_name}: {len(g_files)} files")
            
        # Target sizes
        total_files = len(valid_files)
        target_train = int(total_files * 0.70)
        target_val = int(total_files * 0.20)
        target_test = total_files - target_train - target_val
        
        # Distribute groups into splits to approximate targets
        sorted_groups = sorted(groups.items(), key=lambda x: len(x[1]), reverse=True)
        
        train_files, val_files, test_files = [], [], []
        
        for g_name, g_files in sorted_groups:
            current_train_len = len(train_files)
            current_val_len = len(val_files)
            current_test_len = len(test_files)
            
            dist_train = (target_train - current_train_len) / target_train if target_train > 0 else 0
            dist_val = (target_val - current_val_len) / target_val if target_val > 0 else 0
            dist_test = (target_test - current_test_len) / target_test if target_test > 0 else 0
            
            max_dist = max(dist_train, dist_val, dist_test)
            if max_dist == dist_train:
                train_files.extend(g_files)
                print(f"  Allocated {g_name} to TRAIN")
            elif max_dist == dist_val:
                val_files.extend(g_files)
                print(f"  Allocated {g_name} to VAL")
            else:
                test_files.extend(g_files)
                print(f"  Allocated {g_name} to TEST")
                
        print(f"  Split counts: Train={len(train_files)} ({len(train_files)/total_files:.1%}), "
              f"Val={len(val_files)} ({len(val_files)/total_files:.1%}), "
              f"Test={len(test_files)} ({len(test_files)/total_files:.1%})")
              
        # Copy files to final YOLO structure
        for f in train_files:
            copy_file_to_split(f, c, "train", class_img_dir, class_lbl_dir, yolo_dir)
            split_info["train"]["total"] += 1
            split_info["train"][c] += 1
            
        for f in val_files:
            copy_file_to_split(f, c, "val", class_img_dir, class_lbl_dir, yolo_dir)
            split_info["val"]["total"] += 1
            split_info["val"][c] += 1
            
        for f in test_files:
            copy_file_to_split(f, c, "test", class_img_dir, class_lbl_dir, yolo_dir)
            split_info["test"]["total"] += 1
            split_info["test"][c] += 1
            
    print("\nSummary of Split:")
    print(f"  Train Split: {split_info['train']['total']} images (Aloevera: {split_info['train']['Aloevera']}, Amla: {split_info['train']['Amla']})")
    print(f"  Val Split:   {split_info['val']['total']} images (Aloevera: {split_info['val']['Aloevera']}, Amla: {split_info['val']['Amla']})")
    print(f"  Test Split:  {split_info['test']['total']} images (Aloevera: {split_info['test']['Aloevera']}, Amla: {split_info['test']['Amla']})")

def copy_file_to_split(filename, class_name, split_name, img_dir, lbl_dir, yolo_dir):
    base_name = os.path.splitext(filename)[0]
    
    new_filename = f"{class_name}_{filename}"
    new_labelname = f"{class_name}_{base_name}.txt"
    
    src_img = os.path.join(img_dir, filename)
    src_lbl = os.path.join(lbl_dir, base_name + ".txt")
    
    dest_img = os.path.join(yolo_dir, "images", split_name, new_filename)
    dest_lbl = os.path.join(yolo_dir, "labels", split_name, new_labelname)
    
    shutil.copy2(src_img, dest_img)
    if os.path.exists(src_lbl):
        shutil.copy2(src_lbl, dest_lbl)

if __name__ == '__main__':
    split_data()
