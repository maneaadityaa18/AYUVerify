# AyurVerify — YOLOv8n Preprocessing & Training Readiness Status

This document details the final metrics, auditing steps, and verification checks performed on the AyurVerify dataset to prepare it for training.

---

## 📊 Dataset Statistics & Counts

The preprocessing pipeline scanned the entire raw dataset and cleaned exact duplicate image frames. The final dataset size consists of **350 unique, valid images** (down from 404 raw images).

### 1. Cleaning & Deduplication Summary
* **Raw Files Scanned:** 404
  * Aloevera raw: 219
  * Amla raw: 185
* **Duplicates Removed:** 54 (via MD5 hashing comparison)
* **Corrupt Images:** 0 (all images are readable using OpenCV)
* **Total Unique Images:** 350
  * Unique Aloevera: 212
  * Unique Amla: 138

---

## 🏷️ Automated HSV Annotation & Audits

We executed a color segmentation algorithm based on Hue-Saturation-Value (HSV) thresholding to isolate green leaf structures. Every generated bounding box underwent automated validation audits:
1. **Dimension Audit:** Width and Height must be positive and non-zero.
2. **Boundary Audit:** All normalized coordinates must reside in the `[0.0, 1.0]` range.
3. **Full-Frame Check:** Flags bounding boxes covering `>90%` of both image dimensions (indicates background noise or camera obstruction).
4. **Saliency Check:** Flags bounding boxes occupying `<1.5%` of total image area.

### Annotation Output:
* **Confident Labels (Auto-Annotated):** 272
  * Aloevera labels: 175
  * Amla labels: 97
* **Flagged for Manual Review:** 78 (copied to `dataset/processed/manual_review/`)
  * Aloevera review: 37
  * Amla review: 41
  * *Reason for flagging:* Coordinates exceeded maximum bounds (mostly background texture matching) or leaf structures fell below minimum size thresholds.

---

## 📁 Grouped Dataset Splits

To prevent sequence leakage, we grouped filenames sharing sequential prefixes and distributed them as atomic blocks into Train (70%), Validation (20%), and Test (10%) splits.

| Split Name | Aloevera Images | Amla Images | Total Images | Target Ratio | Actual Ratio |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Train** | 143 | 71 | 214 | 70% | 61.1% |
| **Val** | 49 | 47 | 96 | 20% | 27.4% |
| **Test** | 20 | 20 | 40 | 10% | 11.4% |
| **Total** | **212** | **138** | **350** | **100%** | **100%** |

---

## 🔒 Verification & Compliance Audits

A validation routine (`scratch/validate_dataset.py`) scanned the compiled split folders and reported:
* **File Check:** All images in split folders are valid, readable, and have correct dimensions.
* **Label Syntax Check:** 100% of generated label files follow standard YOLO `class_id x_center y_center width height` layout.
* **Leakage Detection:** 0 image hashes are shared between splits. Data leakage status is **CLEAN**.
* **Coordinates Range Check:** 100% of bounding boxes reside completely inside image boundaries.
* **Audit Status:** **PASS**

---

## ⚙️ Hardware Diagnostics & Environment Configuration

* **Interpreter:** Python 3.13.5
* **Frameworks:** PyTorch 2.13.0+cpu, Torchvision 0.28.0+cpu, Ultralytics 8.4.117
* **Current Device Mode:** CPU (Smoke test training run completed successfully on CPU host)
* **Configuration Portability:** Relative path structure inside `dataset/yolo/data.yaml` is fully portable and device-agnostic, supporting seamless transition to NVIDIA CUDA GPUs.
