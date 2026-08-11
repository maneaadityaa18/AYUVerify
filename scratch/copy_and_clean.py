import os
import shutil
import hashlib
import cv2
import json
import csv

def get_file_hash(filepath):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            hasher.update(chunk)
    return hasher.hexdigest()

def copy_and_clean():
    workspace = r"d:\AYUVerify"
    raw_dir = os.path.join(workspace, "dataset", "raw")
    processed_dir = os.path.join(workspace, "dataset", "processed")
    
    # Clean processed directory
    if os.path.exists(processed_dir):
        shutil.rmtree(processed_dir)
    os.makedirs(processed_dir, exist_ok=True)
    
    classes = ["Aloevera", "Amla"]
    manifest_records = []
    
    # Stats
    raw_counts = {c: 0 for c in classes}
    unique_counts = {c: 0 for c in classes}
    duplicate_counts = {c: 0 for c in classes}
    corrupt_counts = {c: 0 for c in classes}
    
    seen_hashes = {}
    
    print("=== DEDUPLICATION & INTEGRITY CHECK ===")
    
    for c in classes:
        raw_class_dir = os.path.join(raw_dir, c)
        processed_class_dir = os.path.join(processed_dir, c)
        os.makedirs(processed_class_dir, exist_ok=True)
        
        if not os.path.exists(raw_class_dir):
            print(f"Warning: Raw directory {raw_class_dir} not found.")
            continue
            
        print(f"Scanning raw class: {c}")
        
        files = os.listdir(raw_class_dir)
        for f in files:
            if not f.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
                
            raw_counts[c] += 1
            src_path = os.path.join(raw_class_dir, f)
            
            # File size and hash
            file_size = os.path.getsize(src_path)
            file_hash = get_file_hash(src_path)
            
            # Check image readability and dimensions
            img = cv2.imread(src_path)
            if img is None:
                print(f"  [CORRUPT] Failed to read image: {f}")
                corrupt_counts[c] += 1
                manifest_records.append({
                    "original_path": os.path.relpath(src_path, workspace).replace("\\", "/"),
                    "processed_path": "",
                    "class": c,
                    "width": 0,
                    "height": 0,
                    "file_size_bytes": file_size,
                    "hash": file_hash,
                    "status": "corrupt",
                    "duplicate_status": "n/a",
                    "annotation_status": "skipped",
                    "review_status": "skipped"
                })
                continue
                
            img_h, img_w = img.shape[:2]
            
            # Check duplicate
            if file_hash in seen_hashes:
                # Duplicate detected
                duplicate_counts[c] += 1
                manifest_records.append({
                    "original_path": os.path.relpath(src_path, workspace).replace("\\", "/"),
                    "processed_path": "",
                    "class": c,
                    "width": img_w,
                    "height": img_h,
                    "file_size_bytes": file_size,
                    "hash": file_hash,
                    "status": "duplicate",
                    "duplicate_status": "duplicate",
                    "duplicate_of": seen_hashes[file_hash],
                    "annotation_status": "skipped",
                    "review_status": "skipped"
                })
                continue
                
            # Unique & valid image
            seen_hashes[file_hash] = os.path.relpath(src_path, raw_dir).replace("\\", "/")
            dest_path = os.path.join(processed_class_dir, f)
            shutil.copy2(src_path, dest_path)
            
            unique_counts[c] += 1
            
            manifest_records.append({
                "original_path": os.path.relpath(src_path, workspace).replace("\\", "/"),
                "processed_path": os.path.relpath(dest_path, workspace).replace("\\", "/"),
                "class": c,
                "width": img_w,
                "height": img_h,
                "file_size_bytes": file_size,
                "hash": file_hash,
                "status": "active",
                "duplicate_status": "original",
                "annotation_status": "pending",
                "review_status": "pending"
            })
            
    # Write manifests
    manifest_json_path = os.path.join(processed_dir, "dataset_manifest.json")
    with open(manifest_json_path, 'w') as jf:
        json.dump(manifest_records, jf, indent=2)
        
    manifest_csv_path = os.path.join(processed_dir, "dataset_manifest.csv")
    with open(manifest_csv_path, 'w', newline='') as cf:
        if manifest_records:
            fieldnames = manifest_records[0].keys()
            writer = csv.DictWriter(cf, fieldnames=fieldnames)
            writer.writeheader()
            for r in manifest_records:
                # Ensure all fields are present
                row = {k: r.get(k, "") for k in fieldnames}
                writer.writerow(row)
                
    # Output final summary
    print("\n--- PROCESSING REPORT ---")
    print(f"Raw Aloevera Count:  {raw_counts['Aloevera']}")
    print(f"Raw Amla Count:      {raw_counts['Amla']}")
    print(f"Duplicate Count:     {sum(duplicate_counts.values())}")
    print(f"Corrupt Count:       {sum(corrupt_counts.values())}")
    print(f"Unique Aloevera:     {unique_counts['Aloevera']}")
    print(f"Unique Amla:         {unique_counts['Amla']}")
    print(f"Total Unique Images: {sum(unique_counts.values())}")
    print(f"Manifest files saved in: {processed_dir}")

if __name__ == '__main__':
    copy_and_clean()
